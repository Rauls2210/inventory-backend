// Applies the SQL schema to the database. Idempotent — run it as often as you
// like. Usage: `npm run migrate`.
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // eslint-disable-next-line no-console
  console.log('📦 Applying database schema...');
  await pool.query(sql);
  // eslint-disable-next-line no-console
  console.log('✅ Schema applied successfully.');
}

migrate()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
