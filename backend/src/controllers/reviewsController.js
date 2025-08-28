const hostawayService = require('../services/hostawayService');
const dataService = require('../services/dataService');

class ReviewsController {

  // POST /api/reviews/clear - Clear all reviews (debug only)
  async clearReviews(req, res, next) {
    try {
      console.log('🗑️ Clearing all reviews...');

      dataService.clearReviews();

      res.json({
        success: true,
        message: 'All reviews cleared',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reviews/hostaway - Fetch and normalize reviews from Hostaway
  async fetchHostawayReviews(req, res, next) {
    try {
      console.log('📥 Fetching reviews from Hostaway...');

      const options = {
        limit: req.query.limit || 100,
        offset: req.query.offset || 0
      };

      // Fetch reviews from Hostaway API
      const reviews = await hostawayService.fetchReviews(options);

      // Save to local storage
      await dataService.saveReviews(reviews);

      // Return normalized data
      res.json({
        success: true,
        data: reviews.map(review => review.toManagerView()),
        meta: {
          total: reviews.length,
          source: 'hostaway',
          cached: hostawayService.getCacheInfo().cached,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // GET /api/reviews - Get reviews with filtering and pagination
  async getReviews(req, res, next) {
    try {
      console.log('📋 Getting filtered reviews...', req.query);

      const result = await dataService.getReviews(req.query);

      res.json({
        success: true,
        data: result.data.map(review => review.toManagerView()),
        meta: result.meta
      });

    } catch (error) {
      next(error);
    }
  }

  // GET /api/reviews/:id - Get specific review
  async getReviewById(req, res, next) {
    try {
      const { id } = req.params;
      const review = await dataService.getReviewById(id);

      res.json({
        success: true,
        data: review.toManagerView()
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // POST /api/reviews/:id/approve - Approve review for public display
  async approveReview(req, res, next) {
    try {
      const { id } = req.params;
      const { actionBy, notes } = req.body;

      const review = await dataService.approveReview(id, actionBy, notes);

      res.json({
        success: true,
        message: 'Review approved successfully',
        data: review.toManagerView()
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // POST /api/reviews/:id/reject - Reject review from public display
  async rejectReview(req, res, next) {
    try {
      const { id } = req.params;
      const { actionBy, reason } = req.body;

      const review = await dataService.rejectReview(id, actionBy, reason);

      res.json({
        success: true,
        message: 'Review rejected successfully',
        data: review.toManagerView()
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // POST /api/reviews/bulk-action - Bulk approve/reject reviews
  async bulkAction(req, res, next) {
    try {
      const { reviewIds, action, actionBy, reason } = req.body;

      console.log(`📊 Processing bulk ${action} for ${reviewIds.length} reviews...`);

      const results = await dataService.bulkUpdateReviews(reviewIds, action, actionBy, reason);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      res.json({
        success: true,
        message: `Bulk ${action} completed: ${successCount} successful, ${failureCount} failed`,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: failureCount
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // GET /api/reviews/public/:propertyId - Get approved reviews for public display
  async getPublicReviews(req, res, next) {
    try {
      const { propertyId } = req.params;

      console.log(`🌐 Getting public reviews for property: ${propertyId}`);

      const result = await dataService.getPublicReviews(propertyId, req.query);

      res.json({
        success: true,
        data: result.data,
        meta: result.meta
      });

    } catch (error) {
      next(error);
    }
  }

  // GET /api/reviews/stats - Get review statistics
  async getStats(req, res, next) {
    try {
      const stats = await dataService.getPropertyStats();
      const storageInfo = dataService.getStorageInfo();
      const cacheInfo = hostawayService.getCacheInfo();

      res.json({
        success: true,
        data: {
          properties: stats,
          system: {
            storage: storageInfo,
            cache: cacheInfo,
            timestamp: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // POST /api/reviews/sync - Force sync with Hostaway
  async syncReviews(req, res, next) {
    try {
      console.log('🔄 Force syncing reviews from Hostaway...');

      // Clear cache to force fresh fetch
      hostawayService.clearCache();

      // Fetch fresh reviews
      const reviews = await hostawayService.fetchReviews();
      await dataService.saveReviews(reviews);

      res.json({
        success: true,
        message: 'Reviews synced successfully',
        data: {
          reviewCount: reviews.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewsController();
