const dataService = require('../services/dataService');
const { startOfWeek, startOfMonth, startOfQuarter, startOfYear, format } = require('date-fns');

class AnalyticsController {

  // GET /api/analytics/properties - Get property performance analytics
  async getPropertyAnalytics(req, res, next) {
    try {
      console.log('📊 Getting property analytics...');

      const stats = await dataService.getPropertyStats();

      // Calculate additional metrics
      const analytics = await Promise.all(stats.map(async (property) => ({
        ...property,
        metrics: {
          totalReviews: property.totalReviews,
          averageRating: Math.round(property.averageRating * 10) / 10,
          approvedReviews: property.approvedReviews,
          pendingReviews: property.pendingReviews,
          rejectedReviews: property.rejectedReviews,
          approvalRate: property.totalReviews > 0
            ? Math.round((property.approvedReviews / property.totalReviews) * 100)
            : 0,
          lastReviewDate: property.lastReviewDate,
          performance: this.calculatePerformanceScore(property),
          categoryRatings: await this.getCategoryRatings(property.propertyId),
          channelBreakdown: property.channelBreakdown
        }
      })));

      // Sort by performance score
      analytics.sort((a, b) => b.metrics.performance - a.metrics.performance);

      res.json({
        success: true,
        data: analytics,
        meta: {
          totalProperties: analytics.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // GET /api/analytics/trends - Get review trends and insights
  async getTrends(req, res, next) {
    try {
      const { period = 'month', propertyId } = req.query;

      console.log(`📈 Getting trends for period: ${period}`);

      const filters = propertyId ? { propertyId } : {};
      const { data: reviews } = await dataService.getReviews(filters);

      const trends = this.calculateTrends(reviews, period);
      const insights = this.generateInsights(reviews);

      res.json({
        success: true,
        data: {
          trends,
          insights,
          period,
          propertyId: propertyId || 'all'
        },
        meta: {
          totalReviews: reviews.length,
          dateRange: {
            from: trends.length > 0 ? trends[0].period : null,
            to: trends.length > 0 ? trends[trends.length - 1].period : null
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // GET /api/analytics/dashboard - Get dashboard summary data
  async getDashboardSummary(req, res, next) {
    try {
      console.log('📋 Getting dashboard summary...');

      const { data: allReviews } = await dataService.getReviews({});
      const propertyStats = await dataService.getPropertyStats();

      const summary = {
        overview: {
          totalReviews: allReviews.length,
          approvedReviews: allReviews.filter(r => r.status === 'approved').length,
          pendingReviews: allReviews.filter(r => r.status === 'pending').length,
          rejectedReviews: allReviews.filter(r => r.status === 'rejected').length,
          averageRating: this.calculateOverallAverageRating(allReviews),
          totalProperties: propertyStats.length
        },
        recentActivity: this.getRecentActivity(allReviews),
        topPerformingProperties: this.getTopPerformingProperties(propertyStats, 5),
        issuesRequiringAttention: this.getIssuesRequiringAttention(allReviews),
        channelPerformance: this.getChannelPerformance(allReviews),
        ratingDistribution: this.getRatingDistribution(allReviews)
      };

      res.json({
        success: true,
        data: summary,
        meta: {
          generatedAt: new Date().toISOString(),
          dataAsOf: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Helper methods

  calculatePerformanceScore(property) {
    let score = 0;

    // Rating score (40% weight)
    if (property.averageRating > 0) {
      score += (property.averageRating / 5) * 40;
    }

    // Volume score (30% weight)
    const volumeNormalized = Math.min(property.totalReviews / 20, 1); // Normalize to max 20 reviews
    score += volumeNormalized * 30;

    // Approval rate score (20% weight)
    const approvalRate = property.totalReviews > 0
      ? property.approvedReviews / property.totalReviews
      : 0;
    score += approvalRate * 20;

    // Recency score (10% weight)
    if (property.lastReviewDate) {
      const daysSinceLastReview = (Date.now() - new Date(property.lastReviewDate)) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - (daysSinceLastReview / 30)); // Decay over 30 days
      score += recencyScore * 10;
    }

    return Math.round(score);
  }

  async getCategoryRatings(propertyId) {
    const { data: reviews } = await dataService.getReviews({
      propertyId,
      status: 'approved'
    });

    const categories = {};
    let count = 0;

    reviews.forEach(review => {
      if (review.rating.categories) {
        Object.entries(review.rating.categories).forEach(([category, rating]) => {
          if (!categories[category]) {
            categories[category] = { total: 0, count: 0 };
          }
          categories[category].total += rating;
          categories[category].count++;
        });
        count++;
      }
    });

    // Calculate averages
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      categories[category] = Math.round((cat.total / cat.count) * 10) / 10;
    });

    return categories;
  }

  calculateTrends(reviews, period) {
    const trends = {};

    reviews.forEach(review => {
      let periodKey;
      const date = new Date(review.submittedAt);

      switch (period) {
        case 'week':
          periodKey = format(startOfWeek(date), 'yyyy-MM-dd');
          break;
        case 'quarter':
          periodKey = format(startOfQuarter(date), 'yyyy-MM');
          break;
        case 'year':
          periodKey = format(startOfYear(date), 'yyyy');
          break;
        case 'month':
        default:
          periodKey = format(startOfMonth(date), 'yyyy-MM');
          break;
      }

      if (!trends[periodKey]) {
        trends[periodKey] = {
          period: periodKey,
          reviewCount: 0,
          totalRating: 0,
          approvedCount: 0,
          rejectedCount: 0
        };
      }

      trends[periodKey].reviewCount++;
      if (review.rating.overall) {
        trends[periodKey].totalRating += review.rating.overall;
      }
      if (review.status === 'approved') trends[periodKey].approvedCount++;
      if (review.status === 'rejected') trends[periodKey].rejectedCount++;
    });

    // Calculate averages and sort
    return Object.values(trends)
      .map(trend => ({
        ...trend,
        averageRating: trend.totalRating > 0
          ? Math.round((trend.totalRating / trend.reviewCount) * 10) / 10
          : 0,
        approvalRate: trend.reviewCount > 0
          ? Math.round((trend.approvedCount / trend.reviewCount) * 100)
          : 0
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  generateInsights(reviews) {
    const insights = [];

    // Low rating alerts
    const lowRatingReviews = reviews.filter(r => r.rating.overall && r.rating.overall < 3);
    if (lowRatingReviews.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Low Rating Alert',
        message: `${lowRatingReviews.length} reviews with rating below 3.0 require attention`,
        action: 'review_low_ratings',
        priority: 'high'
      });
    }

    // Pending reviews
    const pendingReviews = reviews.filter(r => r.status === 'pending');
    if (pendingReviews.length > 5) {
      insights.push({
        type: 'info',
        title: 'Pending Reviews',
        message: `${pendingReviews.length} reviews are waiting for approval`,
        action: 'approve_pending',
        priority: 'medium'
      });
    }

    // High performing properties
    const highRatingReviews = reviews.filter(r => r.rating.overall && r.rating.overall >= 4.5);
    if (highRatingReviews.length > reviews.length * 0.7) {
      insights.push({
        type: 'success',
        title: 'Excellent Performance',
        message: `${Math.round((highRatingReviews.length / reviews.length) * 100)}% of reviews are 4.5+ stars`,
        action: 'celebrate',
        priority: 'low'
      });
    }

    return insights;
  }

  calculateOverallAverageRating(reviews) {
    const ratingsWithValues = reviews.filter(r => r.rating.overall);
    if (ratingsWithValues.length === 0) return 0;

    const totalRating = ratingsWithValues.reduce((sum, r) => sum + r.rating.overall, 0);
    return Math.round((totalRating / ratingsWithValues.length) * 10) / 10;
  }

  getRecentActivity(reviews) {
    return reviews
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10)
      .map(review => ({
        id: review.id,
        propertyName: review.propertyName,
        guestName: review.guestName,
        action: review.status,
        timestamp: review.updatedAt,
        rating: review.rating.overall
      }));
  }

  getTopPerformingProperties(propertyStats, limit = 5) {
    return propertyStats
      .filter(p => p.totalReviews > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit)
      .map(property => ({
        propertyId: property.propertyId,
        propertyName: property.propertyName,
        averageRating: Math.round(property.averageRating * 10) / 10,
        totalReviews: property.totalReviews,
        approvalRate: Math.round((property.approvedReviews / property.totalReviews) * 100)
      }));
  }

  getIssuesRequiringAttention(reviews) {
    const issues = [];

    // Low ratings
    const lowRatings = reviews.filter(r => r.rating.overall && r.rating.overall < 3);
    if (lowRatings.length > 0) {
      issues.push({
        type: 'low_ratings',
        count: lowRatings.length,
        severity: 'high',
        description: 'Reviews with ratings below 3.0'
      });
    }

    // Old pending reviews
    const oldPending = reviews.filter(r => {
      if (r.status !== 'pending') return false;
      const daysSinceSubmission = (Date.now() - new Date(r.submittedAt)) / (1000 * 60 * 60 * 24);
      return daysSinceSubmission > 7;
    });

    if (oldPending.length > 0) {
      issues.push({
        type: 'stale_pending',
        count: oldPending.length,
        severity: 'medium',
        description: 'Pending reviews older than 7 days'
      });
    }

    return issues;
  }

  getChannelPerformance(reviews) {
    const channels = {};

    reviews.forEach(review => {
      if (!channels[review.channel]) {
        channels[review.channel] = {
          name: review.channel,
          totalReviews: 0,
          totalRating: 0,
          approvedReviews: 0
        };
      }

      channels[review.channel].totalReviews++;
      if (review.rating.overall) {
        channels[review.channel].totalRating += review.rating.overall;
      }
      if (review.status === 'approved') {
        channels[review.channel].approvedReviews++;
      }
    });

    return Object.values(channels).map(channel => ({
      ...channel,
      averageRating: channel.totalRating > 0
        ? Math.round((channel.totalRating / channel.totalReviews) * 10) / 10
        : 0,
      approvalRate: Math.round((channel.approvedReviews / channel.totalReviews) * 100)
    }));
  }

  getRatingDistribution(reviews) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(review => {
      if (review.rating.overall) {
        const roundedRating = Math.round(review.rating.overall);
        if (distribution[roundedRating] !== undefined) {
          distribution[roundedRating]++;
        }
      }
    });

    return distribution;
  }
}

module.exports = new AnalyticsController();
