const { validationResult } = require('express-validator');

// Runs after a set of express-validator chains. If any validation failed it
// responds with a 422 and the list of field errors; otherwise continues.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formatted = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: formatted,
  });
};

module.exports = validate;
