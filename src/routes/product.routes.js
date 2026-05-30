const express = require('express');
const productController = require('../controllers/product.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createProductValidator,
  updateProductValidator,
  idParamValidator,
  listProductsValidator,
} = require('../validators/product.validator');

const router = express.Router();

// All product routes require authentication.
router.use(authenticate);

router.post('/', createProductValidator, validate, productController.create);
router.get('/', listProductsValidator, validate, productController.list);
router.get('/:id', idParamValidator, validate, productController.getOne);
router.put('/:id', updateProductValidator, validate, productController.update);
router.delete('/:id', idParamValidator, validate, productController.remove);

module.exports = router;
