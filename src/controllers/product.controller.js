const asyncHandler = require('../utils/asyncHandler');
const productService = require('../services/product.service');

// POST /api/products
const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

// GET /api/products?page=&limit=&search=
const list = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const { items, pagination } = await productService.getProducts({
    page,
    limit,
    search,
  });
  res.json({ success: true, data: items, pagination });
});

// GET /api/products/:id
const getOne = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
});

// PUT /api/products/:id
const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id
const remove = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product deleted', data: result });
});

module.exports = { create, list, getOne, update, remove };
