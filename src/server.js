const app = require('./app');
const env = require('./config/env');
const { pool } = require('./config/db');

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running on http://localhost:${env.port} (${env.nodeEnv})`);
});

// Graceful shutdown — close HTTP server and the database pool.
const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received. Shutting down...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
});
