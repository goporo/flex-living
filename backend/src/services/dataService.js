const Review = require('../models/Review');

class DataService {
  constructor() {
    // In-memory storage for this demo
    // In production, this would be replaced with a database
    this.reviews = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🔄 Initializing data service...');
    // In production, this would load existing reviews from database
    this.initialized = true;
    console.log('✅ Data service initialized');
  }

  async saveReviews(reviews) {
    await this.initialize();

    reviews.forEach(review => {
      this.reviews.set(review.id, review);
    });

    console.log(`💾 Saved ${reviews.length} reviews to storage`);
    return reviews;
  }

  async getReviews(filters = {}) {
    await this.initialize();

    let reviewList = Array.from(this.reviews.values());

    // Apply filters
    if (filters.propertyId) {
      const propertyIds = Array.isArray(filters.propertyId) ? filters.propertyId : [filters.propertyId];
      reviewList = reviewList.filter(review => propertyIds.includes(review.propertyId));
    }

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      reviewList = reviewList.filter(review => statuses.includes(review.status));
    }

    if (filters.rating) {
      const [min, max] = filters.rating.split('-').map(Number);
      reviewList = reviewList.filter(review => {
        const rating = review.rating.overall;
        return rating >= min && rating <= max;
      });
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      reviewList = reviewList.filter(review => review.submittedAt >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      reviewList = reviewList.filter(review => review.submittedAt <= toDate);
    }

    if (filters.channel) {
      const channels = Array.isArray(filters.channel) ? filters.channel : [filters.channel];
      reviewList = reviewList.filter(review => channels.includes(review.channel));
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      reviewList = reviewList.filter(review =>
        review.reviewText.toLowerCase().includes(searchTerm) ||
        review.guestName.toLowerCase().includes(searchTerm) ||
        review.propertyName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'desc';

    reviewList.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'rating':
          aValue = a.rating.overall || 0;
          bValue = b.rating.overall || 0;
          break;
        case 'property':
          aValue = a.propertyName;
          bValue = b.propertyName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
        default:
          aValue = a.submittedAt;
          bValue = b.submittedAt;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedReviews = reviewList.slice(startIndex, endIndex);

    return {
      data: paginatedReviews,
      meta: {
        total: reviewList.length,
        page,
        limit,
        totalPages: Math.ceil(reviewList.length / limit),
        hasMore: endIndex < reviewList.length
      }
    };
  }

  async getReviewById(reviewId) {
    await this.initialize();

    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review with ID ${reviewId} not found`);
    }

    return review;
  }

  async updateReview(reviewId, updates) {
    await this.initialize();

    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review with ID ${reviewId} not found`);
    }

    // Update the review
    Object.assign(review, updates, { updatedAt: new Date() });
    this.reviews.set(reviewId, review);

    console.log(`📝 Updated review ${reviewId}`);
    return review;
  }

  async approveReview(reviewId, approvedBy, notes = null) {
    const review = await this.getReviewById(reviewId);
    review.approve(approvedBy, notes);

    this.reviews.set(reviewId, review);
    console.log(`✅ Approved review ${reviewId} by ${approvedBy}`);

    return review;
  }

  async rejectReview(reviewId, rejectedBy, reason = null) {
    const review = await this.getReviewById(reviewId);
    review.reject(rejectedBy, reason);

    this.reviews.set(reviewId, review);
    console.log(`❌ Rejected review ${reviewId} by ${rejectedBy}`);

    return review;
  }

  async bulkUpdateReviews(reviewIds, action, actionBy, reason = null) {
    const results = [];

    for (const reviewId of reviewIds) {
      try {
        let review;
        if (action === 'approve') {
          review = await this.approveReview(reviewId, actionBy, reason);
        } else if (action === 'reject') {
          review = await this.rejectReview(reviewId, actionBy, reason);
        }

        results.push({ reviewId, success: true, review });
      } catch (error) {
        results.push({ reviewId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Bulk ${action}: ${successCount}/${reviewIds.length} reviews updated`);

    return results;
  }

  async getPublicReviews(propertyId, filters = {}) {
    await this.initialize();

    // Get only approved reviews
    const publicFilters = {
      ...filters,
      propertyId,
      status: 'approved'
    };

    const result = await this.getReviews(publicFilters);

    // Convert to public view format
    result.data = result.data.map(review => review.toPublicView());

    // Add rating distribution
    const allApprovedReviews = Array.from(this.reviews.values())
      .filter(review => review.propertyId === propertyId && review.status === 'approved');

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    allApprovedReviews.forEach(review => {
      if (review.rating.overall) {
        const roundedRating = Math.round(review.rating.overall);
        ratingDistribution[roundedRating] = (ratingDistribution[roundedRating] || 0) + 1;
        totalRating += review.rating.overall;
      }
    });

    result.meta.averageRating = allApprovedReviews.length > 0
      ? totalRating / allApprovedReviews.length
      : 0;
    result.meta.ratingDistribution = ratingDistribution;

    return result;
  }

  async getPropertyStats() {
    await this.initialize();

    const stats = {};

    Array.from(this.reviews.values()).forEach(review => {
      const propId = review.propertyId;

      if (!stats[propId]) {
        stats[propId] = {
          propertyId: propId,
          propertyName: review.propertyName,
          totalReviews: 0,
          approvedReviews: 0,
          pendingReviews: 0,
          rejectedReviews: 0,
          averageRating: 0,
          totalRating: 0,
          lastReviewDate: null,
          channelBreakdown: {}
        };
      }

      const stat = stats[propId];
      stat.totalReviews++;

      if (review.status === 'approved') stat.approvedReviews++;
      else if (review.status === 'pending') stat.pendingReviews++;
      else if (review.status === 'rejected') stat.rejectedReviews++;

      if (review.rating.overall) {
        stat.totalRating += review.rating.overall;
      }

      if (!stat.lastReviewDate || review.submittedAt > stat.lastReviewDate) {
        stat.lastReviewDate = review.submittedAt;
      }

      // Channel breakdown
      if (!stat.channelBreakdown[review.channel]) {
        stat.channelBreakdown[review.channel] = { count: 0, totalRating: 0 };
      }
      stat.channelBreakdown[review.channel].count++;
      if (review.rating.overall) {
        stat.channelBreakdown[review.channel].totalRating += review.rating.overall;
      }
    });

    // Calculate averages
    Object.values(stats).forEach(stat => {
      if (stat.totalRating > 0) {
        stat.averageRating = stat.totalRating / stat.totalReviews;
      }

      Object.values(stat.channelBreakdown).forEach(channel => {
        if (channel.totalRating > 0) {
          channel.averageRating = channel.totalRating / channel.count;
        }
      });
    });

    return Object.values(stats);
  }

  getStorageInfo() {
    return {
      totalReviews: this.reviews.size,
      initialized: this.initialized,
      memoryUsage: process.memoryUsage()
    };
  }
}

module.exports = new DataService();
