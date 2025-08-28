const express = require('express');
const GooglePlacesService = require('../services/googlePlacesService');

const router = express.Router();
const googleService = new GooglePlacesService();

/**
 * @route GET /api/google
 * @desc Fetch reviews from Google Places API
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await googleService.getAllPropertyReviews();

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
      message: 'Google reviews fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in Google reviews endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Google reviews',
      message: error.message
    });
  }
});

/**
 * @route GET /api/google/property/:propertyId
 * @desc Fetch Google reviews for a specific property
 */
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const reviews = await googleService.fetchReviews(propertyId);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
      propertyId: propertyId,
      message: `Google reviews for property ${propertyId} fetched successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching Google reviews for property ${req.params.propertyId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Google reviews for property',
      message: error.message
    });
  }
});

module.exports = router;
