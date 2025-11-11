// simple script to run schema.sql using DATABASE_URL
require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');
(async () => {
  const sql = fs.readFileSync('./db/schema.sql', 'utf8');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Running schema...');
    await pool.query(sql);
    console.log('Schema applied');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
