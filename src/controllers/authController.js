const db = require('../services/db');
const { genApiKey, hashApiKey } = require('../utils/crypto');

async function register(req, res) {
  const { name, ownerEmail, expiresInDays } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const apiKey = genApiKey();
  const apiKeyHash = hashApiKey(apiKey);
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

  try {
    const insert = await db.query(
      'INSERT INTO apps (name, owner_email, api_key_hash, expires_at) VALUES ($1,$2,$3,$4) RETURNING id, name, created_at',
      [name, ownerEmail || null, apiKeyHash, expiresAt]
    );
    const app = insert.rows[0];
    res.status(201).json({ app, apiKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
}

async function getApiKey(req, res) {
  const { app_id } = req.query;
  if (!app_id) return res.status(400).json({ error: 'app_id required' });
  try {
    const { rows } = await db.query('SELECT id, name, owner_email, is_revoked, expires_at, created_at FROM apps WHERE id=$1', [app_id]);
    if (!rows.length) return res.status(404).json({ error: 'app not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
}

async function revoke(req, res) {
  const { app_id } = req.body;
  if (!app_id) return res.status(400).json({ error: 'app_id required' });
  try {
    await db.query('UPDATE apps SET is_revoked=true WHERE id=$1', [app_id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
}

async function regenerate(req, res) {
  const { app_id, expiresInDays } = req.body;
  if (!app_id) return res.status(400).json({ error: 'app_id required' });
  try {
    const apiKey = genApiKey();
    const apiKeyHash = hashApiKey(apiKey);
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;
    await db.query('UPDATE apps SET api_key_hash=$1, expires_at=$2, is_revoked=false WHERE id=$3', [apiKeyHash, expiresAt, app_id]);
    res.json({ apiKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
}

module.exports = { register, getApiKey, revoke, regenerate };
