const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');

// Columns aliased so the API response keeps camelCase field names.
const PRODUCT_COLUMNS =
  'id, name, sku, price, stock, created_at AS "createdAt", updated_at AS "updatedAt"';

// Create a product. SKU uniqueness is enforced both here and at the DB level.
const createProduct = async ({ name, sku, price, stock = 0 }) => {
  const existing = await query('SELECT id FROM products WHERE sku = $1', [sku]);
  if (existing.rowCount > 0) {
    throw ApiError.conflict('A product with this SKU already exists');
  }

  const { rows } = await query(
    `INSERT INTO products (name, sku, price, stock)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PRODUCT_COLUMNS}`,
    [name, sku, Number(price), Number(stock)]
  );

  return rows[0];
};

// Paginated + searchable product list.
const getProducts = async ({ page = 1, limit = 10, search = '' }) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const params = [];
  let where = '';

  if (search) {
    params.push(`%${search}%`);
    where = `WHERE name ILIKE $1 OR sku ILIKE $1`;
  }

  // Total count for pagination.
  const countResult = await query(`SELECT COUNT(*)::int AS total FROM products ${where}`, params);
  const total = countResult.rows[0].total;

  // Page of rows. LIMIT/OFFSET params come after any search param.
  const limitIdx = params.length + 1;
  const offsetIdx = params.length + 2;
  const { rows: items } = await query(
    `SELECT ${PRODUCT_COLUMNS}
     FROM products
     ${where}
     ORDER BY created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    [...params, limitNum, offset]
  );

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

// Fetch a single product or throw 404.
const getProductById = async (id) => {
  const { rows } = await query(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = $1`,
    [Number(id)]
  );
  if (rows.length === 0) {
    throw ApiError.notFound('Product not found');
  }
  return rows[0];
};

// Update a product. Guards SKU uniqueness when SKU changes.
const updateProduct = async (id, data) => {
  const productId = Number(id);
  await getProductById(productId); // throws 404 if missing

  if (data.sku) {
    const clash = await query(
      'SELECT id FROM products WHERE sku = $1 AND id <> $2',
      [data.sku, productId]
    );
    if (clash.rowCount > 0) {
      throw ApiError.conflict('A product with this SKU already exists');
    }
  }

  // Build a dynamic SET clause from the provided fields only.
  const sets = [];
  const params = [];
  let i = 1;

  if (data.name !== undefined) { sets.push(`name = $${i++}`); params.push(data.name); }
  if (data.sku !== undefined) { sets.push(`sku = $${i++}`); params.push(data.sku); }
  if (data.price !== undefined) { sets.push(`price = $${i++}`); params.push(Number(data.price)); }
  if (data.stock !== undefined) { sets.push(`stock = $${i++}`); params.push(Number(data.stock)); }

  // Always bump updated_at.
  sets.push('updated_at = NOW()');

  // Nothing to update besides the timestamp — just return the current row.
  if (sets.length === 1) {
    return getProductById(productId);
  }

  params.push(productId);
  const { rows } = await query(
    `UPDATE products SET ${sets.join(', ')} WHERE id = $${i} RETURNING ${PRODUCT_COLUMNS}`,
    params
  );

  return rows[0];
};

// Delete a product (cascades its inventory transactions via the FK).
const deleteProduct = async (id) => {
  const productId = Number(id);
  const { rowCount } = await query('DELETE FROM products WHERE id = $1', [productId]);
  if (rowCount === 0) {
    throw ApiError.notFound('Product not found');
  }
  return { id: productId };
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
