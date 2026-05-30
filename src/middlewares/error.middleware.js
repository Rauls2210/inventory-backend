const ApiError = require('../utils/ApiError');
const env = require('../config/env');

// 404 handler for unmatched routes.
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Central error handler. Must keep the 4-arg signature for Express to treat it
// as an error middleware.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // Translate common PostgreSQL (node-postgres) error codes into friendly
  // responses. https://www.postgresql.org/docs/current/errcodes-appendix.html
  switch (err.code) {
    case '23505': // unique_violation
      statusCode = 409;
      message = 'A record with this value already exists';
      break;
    case '23503': // foreign_key_violation
      statusCode = 409;
      message = 'Related record constraint failed';
      break;
    case '23502': // not_null_violation
      statusCode = 400;
      message = `Missing required field: ${err.column || 'unknown'}`;
      break;
    case '22P02': // invalid_text_representation (e.g. bad integer)
      statusCode = 400;
      message = 'Invalid input value';
      break;
    default:
      break;
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  const body = { success: false, message };
  if (details) body.errors = details;
  if (env.nodeEnv === 'development' && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

module.exports = { notFoundHandler, errorHandler };
