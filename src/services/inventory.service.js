const { query, getClient } = require('../config/db');
const ApiError = require('../utils/ApiError');

const PRODUCT_COLUMNS =
  'id, name, sku, price, stock, created_at AS "createdAt", updated_at AS "updatedAt"';

/**
 * Apply a stock change (ADD or DEDUCT) atomically.
 *
 * Concurrency safety:
 *  - The whole operation runs inside a single transaction on one client
 *    (BEGIN / COMMIT / ROLLBACK).
 *  - We `SELECT ... FOR UPDATE` the product row first, which takes a row-level
 *    lock. Any concurrent stock change for the same product blocks until this
 *    transaction commits, so two requests can never read the same stock and
 *    both deduct from it (no overselling / no lost updates).
 *  - Every successful change records an InventoryTransaction row in the SAME
 *    transaction. If anything throws, ROLLBACK undoes both the stock update and
 *    the history row.
 */
const applyStockChange = async ({ productId, quantity, action, userId }) => {
  const id = Number(productId);
  const qty = Number(quantity);

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Lock the product row for the duration of the transaction.
    const locked = await client.query(
      'SELECT id, stock FROM products WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (locked.rowCount === 0) {
      throw ApiError.notFound('Product not found');
    }

    const previousStock = locked.rows[0].stock;
    let newStock;

    if (action === 'ADD') {
      newStock = previousStock + qty;
    } else {
      // DEDUCT — stock must never go negative.
      if (previousStock < qty) {
        throw ApiError.badRequest('Insufficient stock');
      }
      newStock = previousStock - qty;
    }

    const updated = await client.query(
      `UPDATE products SET stock = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING ${PRODUCT_COLUMNS}`,
      [newStock, id]
    );

    const tx = await client.query(
      `INSERT INTO inventory_transactions
         (product_id, action, quantity, previous_stock, new_stock, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, product_id AS "productId", action, quantity,
                 previous_stock AS "previousStock", new_stock AS "newStock",
                 created_by AS "createdBy", created_at AS "createdAt"`,
      [id, action, qty, previousStock, newStock, userId]
    );

    await client.query('COMMIT');

    return { product: updated.rows[0], transaction: tx.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const addStock = (payload) => applyStockChange({ ...payload, action: 'ADD' });
const deductStock = (payload) => applyStockChange({ ...payload, action: 'DEDUCT' });

// Return only the current stock of a product.
const getCurrentStock = async (productId) => {
  const { rows } = await query(
    'SELECT id, name, sku, stock FROM products WHERE id = $1',
    [Number(productId)]
  );
  if (rows.length === 0) {
    throw ApiError.notFound('Product not found');
  }
  return rows[0];
};

// Paginated inventory history for a product, newest first.
const getHistory = async (productId, { page = 1, limit = 10 } = {}) => {
  const id = Number(productId);
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const product = await query('SELECT id FROM products WHERE id = $1', [id]);
  if (product.rowCount === 0) {
    throw ApiError.notFound('Product not found');
  }

  const countResult = await query(
    'SELECT COUNT(*)::int AS total FROM inventory_transactions WHERE product_id = $1',
    [id]
  );
  const total = countResult.rows[0].total;

  const { rows: items } = await query(
    `SELECT
       t.id,
       t.product_id     AS "productId",
       t.action,
       t.quantity,
       t.previous_stock AS "previousStock",
       t.new_stock      AS "newStock",
       t.created_by     AS "createdBy",
       t.created_at     AS "createdAt",
       json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) AS product,
       json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS user
     FROM inventory_transactions t
     JOIN products p ON p.id = t.product_id
     JOIN users u ON u.id = t.created_by
     WHERE t.product_id = $1
     ORDER BY t.created_at DESC
     LIMIT $2 OFFSET $3`,
    [id, limitNum, offset]
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

module.exports = {
  addStock,
  deductStock,
  getCurrentStock,
  getHistory,
};
