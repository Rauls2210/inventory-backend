const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  stockChangeValidator,
  productIdParamValidator,
  historyValidator,
} = require('../validators/inventory.validator');

const router = express.Router();

router.use(authenticate);

router.post('/add', stockChangeValidator, validate, inventoryController.add);
router.post('/deduct', stockChangeValidator, validate, inventoryController.deduct);
router.get('/stock/:productId', productIdParamValidator, validate, inventoryController.currentStock);
router.get('/history/:productId', historyValidator, validate, inventoryController.history);

module.exports = router;
