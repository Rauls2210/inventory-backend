const express = require('express');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const inventoryRoutes = require('./inventory.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
