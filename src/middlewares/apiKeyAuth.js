const db = require('../services/db');
const { hashApiKey } = require('../utils/crypto');

async function apiKeyAuth(req, res, next) {
  const header = req.header('x-api-key') || req.header('authorization');
  if (!header) return res.status(401).json({ error: 'API key missing' });

  const token = header.startsWith('ApiKey ') ? header.split(' ')[1] : header;
  const hashed = hashApiKey(token);

  try {
    const { rows } = await db.query('SELECT id, is_revoked, expires_at FROM apps WHERE api_key_hash=$1 LIMIT 1', [hashed]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid API key' });

    const app = rows[0];
    if (app.is_revoked) return res.status(403).json({ error: 'API key revoked' });
    if (app.expires_at && new Date(app.expires_at) < new Date()) return res.status(403).json({ error: 'API key expired' });

    req.app_id = app.id;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'auth error' });
  }
}

module.exports = apiKeyAuth;
