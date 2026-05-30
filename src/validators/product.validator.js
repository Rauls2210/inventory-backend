const { body, param, query } = require('express-validator');

const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .bail()
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be 0 or greater'),
];

const updateProductValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid product id'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be 0 or greater'),
];

const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid product id'),
];

const listProductsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  idParamValidator,
  listProductsValidator,
};
