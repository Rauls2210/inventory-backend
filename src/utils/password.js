const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

// Hash a plaintext password before persisting it.
const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

// Compare a plaintext password against a stored hash.
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { hashPassword, comparePassword };
