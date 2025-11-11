const db = require('../services/db');
const cache = require('../services/cache');

async function collect(req, res) {
  const app_id = req.app_id;
  const { event, url, referrer, device, ipAddress, timestamp, metadata, userId } = req.body;
  if (!event) return res.status(400).json({ error: 'event required' });

  const createdAt = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

  try {
    const q = `INSERT INTO events (app_id, event_name, url, referrer, device, ip_address, user_id, metadata, user_agent, created_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`;
    const vals = [app_id, event, url || null, referrer || null, device || null, ipAddress || null, userId || null, metadata || {}, req.header('user-agent') || null, createdAt];
    const { rows } = await db.query(q, vals);

    try {
      await cache.del(`event-summary:${app_id}`);
      await cache.del(`top-events:${app_id}`);
    } catch (e) {}

    res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ingest error' });
  }
}

async function eventSummary(req, res) {
  const { event, startDate, endDate, app_id } = req.query;
  const cacheKey = `event-summary:${app_id || 'all'}:${event || 'all'}:${startDate || '0'}:${endDate || 'now'}`;
  try {
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
  } catch (e) {}

  const params = [];
  let where = 'WHERE 1=1';
  if (event) { params.push(event); where += ` AND event_name = $${params.length}`; }
  if (app_id) { params.push(app_id); where += ` AND app_id = $${params.length}`; }
  if (startDate) { params.push(startDate); where += ` AND created_at >= $${params.length}`; }
  if (endDate) { params.push(endDate + ' 23:59:59'); where += ` AND created_at <= $${params.length}`; }

  try {
    const q = `
      SELECT event_name AS event,
        COUNT(*)::int AS count,
        COUNT(DISTINCT user_id)::int AS unique_users
      FROM events
      ${where}
      GROUP BY event_name
    `;
    const { rows } = await db.query(q, params);

    const deviceQ = `SELECT device, COUNT(*)::int AS count FROM events ${where} GROUP BY device`;
    const deviceRes = await db.query(deviceQ, params);
    const deviceData = {};
    deviceRes.rows.forEach(r => deviceData[r.device || 'unknown'] = r.count);

    const out = rows.length ? rows.map(r => ({ event: r.event, count: r.count, uniqueUsers: r.unique_users, deviceData })) : { event: event || null, count: 0, uniqueUsers: 0, deviceData };

    try { await cache.set(cacheKey, JSON.stringify(out), 60); } catch (e) {}

    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'query error' });
  }
}

async function userStats(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const q = `SELECT COUNT(*)::int AS total_events, MAX(ip_address) AS ip_address, MAX(user_agent) AS last_user_agent FROM events WHERE user_id=$1`;
    const { rows } = await db.query(q, [userId]);
    if (!rows.length) return res.status(404).json({ error: 'no data' });
    const deviceQ = `SELECT metadata->>'browser' AS browser, metadata->>'os' AS os, COUNT(*)::int AS cnt FROM events WHERE user_id=$1 GROUP BY metadata->>'browser', metadata->>'os' ORDER BY cnt DESC LIMIT 1`;
    const deviceRes = await db.query(deviceQ, [userId]);
    const deviceDetails = deviceRes.rows[0] || {};
    res.json({ userId, totalEvents: rows[0].total_events, deviceDetails, ipAddress: rows[0].ip_address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'query error' });
  }
}

module.exports = { collect, eventSummary, userStats };
