const dotenv = require('dotenv');

dotenv.config();

// Centralised, validated access to environment variables.
const env = {
  port: parseInt(process.env.PORT, 10) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'super-secret-change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};


if (!process.env.DATABASE_URL) {
  // The pg pool needs this; fail loud and early with a helpful message.
  // eslint-disable-next-line no-console
  console.warn('[env] DATABASE_URL is not set. The database pool will not be able to connect.');
}

module.exports = env;
