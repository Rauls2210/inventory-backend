const asyncHandler = require('../utils/asyncHandler');
const inventoryService = require('../services/inventory.service');

// POST /api/inventory/add
const add = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const result = await inventoryService.addStock({
    productId,
    quantity,
    userId: req.user.id,
  });
  res.json({
    success: true,
    message: 'Stock added',
    data: result.product,
    transaction: result.transaction,
  });
});

// POST /api/inventory/deduct
const deduct = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const result = await inventoryService.deductStock({
    productId,
    quantity,
    userId: req.user.id,
  });
  res.json({
    success: true,
    message: 'Stock deducted',
    data: result.product,
    transaction: result.transaction,
  });
});

// GET /api/inventory/stock/:productId
const currentStock = asyncHandler(async (req, res) => {
  const product = await inventoryService.getCurrentStock(req.params.productId);
  res.json({ success: true, data: product });
});

// GET /api/inventory/history/:productId?page=&limit=
const history = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { items, pagination } = await inventoryService.getHistory(
    req.params.productId,
    { page, limit }
  );
  res.json({ success: true, data: items, pagination });
});

module.exports = { add, deduct, currentStock, history };
