const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

// Register a new user and return the user (without password) plus a JWT.
const register = async ({ name, email, password }) => {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    throw ApiError.conflict('Email is already registered');
  }

  const hashed = await hashPassword(password);

  const { rows } = await query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at AS "createdAt"`,
    [name, email, hashed]
  );

  const user = rows[0];
  const token = signToken({ id: user.id, email: user.email });

  return { user, token };
};

// Validate credentials and return the user plus a JWT.
const login = async ({ email, password }) => {
  const { rows } = await query(
    'SELECT id, name, email, password FROM users WHERE email = $1',
    [email]
  );
  const user = rows[0];

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ id: user.id, email: user.email });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
};

module.exports = { register, login };
