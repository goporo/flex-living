const { v4: uuidv4 } = require('uuid');

class Review {
  constructor(data) {
    // Core identifiers
    this.id = data.id || uuidv4();
    this.sourceId = data.sourceId || data.id;
    this.source = data.source || 'hostaway';

    // Property information
    this.propertyId = data.propertyId || this.extractPropertyId(data.listingName);
    this.propertyName = data.propertyName || data.listingName || '';

    // Review content
    this.guestName = data.guestName || '';
    this.reviewText = data.reviewText || data.publicReview || '';
    this.rating = this.normalizeRating(data.rating, data.reviewCategory);
    this.submittedAt = new Date(data.submittedAt || Date.now());

    // Management fields
    this.status = data.status || 'pending';
    this.isPublic = data.isPublic || false;
    this.approvedBy = data.approvedBy || null;
    this.approvedAt = data.approvedAt || null;
    this.rejectedBy = data.rejectedBy || null;
    this.rejectedAt = data.rejectedAt || null;

    // Metadata
    this.channel = data.channel || this.extractChannel(data.source);
    this.type = data.type || 'guest-review';
    this.metadata = {
      responseRequired: data.metadata?.responseRequired || false,
      flaggedForReview: data.metadata?.flaggedForReview || false,
      priority: data.metadata?.priority || 'low',
      tags: data.metadata?.tags || [],
      sourceData: data.metadata?.sourceData || data
    };

    // Timestamps
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  extractPropertyId(listingName) {
    if (!listingName) return null;

    // Extract property ID from listing name patterns
    // Example: "2B N1 A - 29 Shoreditch Heights" -> "2B-N1-A-29-Shoreditch-Heights"
    return listingName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  extractChannel(source) {
    const channelMap = {
      'hostaway': 'multiple',
      'airbnb': 'airbnb',
      'booking': 'booking.com',
      'vrbo': 'vrbo',
      'google': 'google'
    };

    return channelMap[source?.toLowerCase()] || 'unknown';
  }

  normalizeRating(overallRating, categories) {
    const rating = {
      overall: null,
      categories: {}
    };

    // Handle overall rating
    if (overallRating !== null && overallRating !== undefined) {
      rating.overall = parseFloat(overallRating);
    }

    // Handle category ratings
    if (Array.isArray(categories)) {
      categories.forEach(cat => {
        if (cat.category && cat.rating !== null && cat.rating !== undefined) {
          rating.categories[cat.category] = parseFloat(cat.rating);
        }
      });

      // Calculate overall from categories if not provided
      if (rating.overall === null && Object.keys(rating.categories).length > 0) {
        const categoryValues = Object.values(rating.categories);
        rating.overall = categoryValues.reduce((sum, val) => sum + val, 0) / categoryValues.length;
      }
    }

    return rating;
  }

  approve(approvedBy, notes = null) {
    this.status = 'approved';
    this.isPublic = true;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.updatedAt = new Date();

    if (notes) {
      this.metadata.approvalNotes = notes;
    }

    return this;
  }

  reject(rejectedBy, reason = null) {
    this.status = 'rejected';
    this.isPublic = false;
    this.rejectedBy = rejectedBy;
    this.rejectedAt = new Date();
    this.updatedAt = new Date();

    if (reason) {
      this.metadata.rejectionReason = reason;
    }

    return this;
  }

  toPublicView() {
    return {
      id: this.id,
      propertyName: this.propertyName,
      guestName: this.guestName,
      reviewText: this.reviewText,
      rating: this.rating,
      submittedAt: this.submittedAt,
      channel: this.channel
    };
  }

  toManagerView() {
    return {
      id: this.id,
      sourceId: this.sourceId,
      source: this.source,
      propertyId: this.propertyId,
      propertyName: this.propertyName,
      guestName: this.guestName,
      reviewText: this.reviewText,
      rating: this.rating,
      submittedAt: this.submittedAt,
      status: this.status,
      isPublic: this.isPublic,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt,
      rejectedBy: this.rejectedBy,
      rejectedAt: this.rejectedAt,
      channel: this.channel,
      type: this.type,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromHostawayData(hostawayReview) {
    return new Review({
      sourceId: hostawayReview.id?.toString(),
      source: 'hostaway',
      listingName: hostawayReview.listingName,
      guestName: hostawayReview.guestName,
      publicReview: hostawayReview.publicReview,
      rating: hostawayReview.rating,
      reviewCategory: hostawayReview.reviewCategory,
      submittedAt: hostawayReview.submittedAt,
      type: hostawayReview.type,
      status: hostawayReview.status === 'published' ? 'pending' : 'rejected',
      metadata: {
        sourceData: hostawayReview
      }
    });
  }
}

module.exports = Review;
