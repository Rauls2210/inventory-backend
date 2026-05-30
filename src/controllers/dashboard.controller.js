const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');

// GET /api/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats();
  res.json({ success: true, ...stats });
});

module.exports = { getDashboard };
