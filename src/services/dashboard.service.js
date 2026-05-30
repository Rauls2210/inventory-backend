const { query } = require('../config/db');

const LOW_STOCK_THRESHOLD = 5;

// Aggregate dashboard statistics in a single round-trip. COUNT/SUM return
// bigint (a string in node-postgres), so we cast to int in SQL.
const getStats = async () => {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM products) AS "totalProducts",
       (SELECT COALESCE(SUM(stock), 0)::int FROM products) AS "totalStock",
       (SELECT COUNT(*)::int FROM products WHERE stock < $1) AS "lowStockProducts",
       (SELECT COUNT(*)::int FROM inventory_transactions) AS "totalTransactions"`,
    [LOW_STOCK_THRESHOLD]
  );

  return rows[0];
};

module.exports = { getStats, LOW_STOCK_THRESHOLD };
