const { Pool } = require('pg');
const env = require('./env');

// A single shared connection pool is reused across the app. The pool manages
// individual client connections, so most code can just call `query()`. For
// multi-statement transactions, grab a dedicated client with `getClient()`.
const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[db] Unexpected error on idle PostgreSQL client', err);
});

// Convenience wrapper for one-off queries.
const query = (text, params) => pool.query(text, params);

// Check out a client for an interactive transaction (BEGIN/COMMIT/ROLLBACK).
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
