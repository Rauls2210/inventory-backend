const { body, param, query } = require('express-validator');

const stockChangeValidator = [
  body('productId')
    .notEmpty()
    .withMessage('productId is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('productId must be a valid id'),
  body('quantity')
    .notEmpty()
    .withMessage('quantity is required')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('quantity must be greater than 0'),
];

const productIdParamValidator = [
  param('productId').isInt({ min: 1 }).withMessage('Invalid product id'),
];

const historyValidator = [
  param('productId').isInt({ min: 1 }).withMessage('Invalid product id'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
];

module.exports = {
  stockChangeValidator,
  productIdParamValidator,
  historyValidator,
};
