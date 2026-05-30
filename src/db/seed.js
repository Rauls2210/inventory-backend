// Seeds an admin user, sample products, and one sample inventory transaction.
// Idempotent thanks to ON CONFLICT clauses. Usage: `npm run seed`.
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function main() {
  console.log('🌱 Seeding database...');

  // --- Admin user -----------------------------------------------------------
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminResult = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, email`,
    ['Admin User', 'admin@example.com', passwordHash]
  );
  const admin = adminResult.rows[0];
  console.log(`   ✓ Admin user: ${admin.email} (password: password123)`);

  // --- Products -------------------------------------------------------------
  const products = [
    { name: 'Dell Laptop', sku: 'DELL01', price: 55000, stock: 10 },
    { name: 'HP Pavilion', sku: 'HP01', price: 48000, stock: 4 },
    { name: 'Logitech Mouse', sku: 'LOGI01', price: 1200, stock: 50 },
    { name: 'Mechanical Keyboard', sku: 'KEYB01', price: 3500, stock: 3 },
    { name: '27" Monitor', sku: 'MON27', price: 18000, stock: 8 },
    { name: 'USB-C Hub', sku: 'HUB01', price: 2500, stock: 2 },
    { name: 'Webcam HD', sku: 'CAM01', price: 4000, stock: 15 },
    { name: 'Noise Cancelling Headphones', sku: 'HEAD01', price: 12000, stock: 6 },
  ];

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, sku, price, stock)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (sku) DO NOTHING`,
      [p.name, p.sku, p.price, p.stock]
    );
  }
  console.log(`   ✓ Seeded ${products.length} products`);

  // --- A sample inventory transaction --------------------------------------
  const dell = await pool.query('SELECT id, stock FROM products WHERE sku = $1', ['DELL01']);
  const txCount = await pool.query('SELECT COUNT(*)::int AS total FROM inventory_transactions');

  if (dell.rowCount > 0 && txCount.rows[0].total === 0) {
    const product = dell.rows[0];
    await pool.query(
      `INSERT INTO inventory_transactions
         (product_id, action, quantity, previous_stock, new_stock, created_by)
       VALUES ($1, 'ADD', $2, 0, $2, $3)`,
      [product.id, product.stock, admin.id]
    );
    console.log('   ✓ Seeded sample inventory transaction');
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((err) => {
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
