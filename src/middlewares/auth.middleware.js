const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { query } = require('../config/db');

// Protects routes by requiring a valid Bearer token in the Authorization header.
// On success it attaches the authenticated user to req.user.
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing');
    }

    const token = header.slice(7).trim();

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const { rows } = await query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      throw ApiError.unauthorized('User no longer exists');
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
