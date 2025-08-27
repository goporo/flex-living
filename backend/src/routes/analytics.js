const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/properties - Get property performance analytics
router.get('/properties', analyticsController.getPropertyAnalytics);

// GET /api/analytics/trends - Get review trends and insights
router.get('/trends', analyticsController.getTrends);

// GET /api/analytics/dashboard - Get dashboard summary data
router.get('/dashboard', analyticsController.getDashboardSummary);

module.exports = router;
