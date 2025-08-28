const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { validateQuery, validateBody, reviewsQuerySchema, reviewActionSchema, bulkActionSchema } = require('../middleware/validation');

// GET /api/reviews/hostaway - Fetch and normalize reviews from Hostaway API
router.get('/hostaway', reviewsController.fetchHostawayReviews);

// POST /api/reviews/clear - Clear all reviews (debug only)
router.post('/clear', reviewsController.clearReviews);

// GET /api/reviews/stats - Get review statistics
router.get('/stats', reviewsController.getStats);

// POST /api/reviews/sync - Force sync with Hostaway
router.post('/sync', reviewsController.syncReviews);

// POST /api/reviews/bulk-action - Bulk approve/reject reviews
router.post('/bulk-action', validateBody(bulkActionSchema), reviewsController.bulkAction);

// GET /api/reviews/public/:propertyId - Get approved reviews for public display
router.get('/public/:propertyId', validateQuery(reviewsQuerySchema), reviewsController.getPublicReviews);

// GET /api/reviews/:id - Get specific review
router.get('/:id', reviewsController.getReviewById);

// POST /api/reviews/:id/approve - Approve review for public display
router.post('/:id/approve', validateBody(reviewActionSchema), reviewsController.approveReview);

// POST /api/reviews/:id/reject - Reject review from public display
router.post('/:id/reject', validateBody(reviewActionSchema), reviewsController.rejectReview);

// GET /api/reviews - Get reviews with filtering and pagination (keep this last to avoid conflicts)
router.get('/', validateQuery(reviewsQuerySchema), reviewsController.getReviews);

module.exports = router;
