const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Sign a JWT for an authenticated user.
const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// Verify a token and return its decoded payload (throws on invalid/expired).
const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

module.exports = { signToken, verifyToken };
