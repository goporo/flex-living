const axios = require('axios');
const Review = require('../models/Review');

class HostawayService {
  constructor() {
    this.baseURL = process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com/v1';
    this.accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    this.apiKey = process.env.HOSTAWAY_API_KEY;
    this.cache = new Map();
    this.cacheTTL = parseInt(process.env.CACHE_TTL) || 15 * 60 * 1000; // 15 minutes
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async fetchReviews(options = {}) {
    try {
      console.log('🔄 Fetching reviews from Hostaway API...');

      const cacheKey = 'hostaway_reviews';
      const cached = this.cache.get(cacheKey);

      // Return cached data if available and not expired
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log('📦 Returning cached Hostaway reviews');
        return cached.data;
      }

      const url = `${this.baseURL}/reviews`;
      const params = {
        accountId: this.accountId,
        limit: options.limit || 100,
        offset: options.offset || 0,
        ...options.filters
      };

      const response = await axios.get(url, {
        headers: this.getAuthHeaders(),
        params,
        timeout: 10000 // 10 second timeout
      });

      console.log(`✅ Successfully fetched ${response.data?.result?.length || 0} reviews from Hostaway`);

      if (response.data && response.data.status === 'success') {
        const normalizedReviews = this.normalizeReviews(response.data.result || []);

        // Cache the results
        this.cache.set(cacheKey, {
          data: normalizedReviews,
          timestamp: Date.now()
        });

        return normalizedReviews;
      } else {
        throw new Error('Invalid response format from Hostaway API');
      }

    } catch (error) {
      console.error('❌ Error fetching from Hostaway API:', error.message);

      // If API fails, return mock data as fallback
      console.log('🔄 Falling back to mock data...');
      return this.getMockReviews();
    }
  }

  normalizeReviews(hostawayReviews) {
    return hostawayReviews
      .filter(review => review && review.id) // Filter out invalid reviews
      .map(review => {
        try {
          return Review.fromHostawayData(review);
        } catch (error) {
          console.warn(`⚠️ Failed to normalize review ${review.id}:`, error.message);
          return null;
        }
      })
      .filter(review => review !== null); // Remove failed normalizations
  }

  getMockReviews() {
    console.log('📝 Using mock review data');

    const mockData = [
      {
        id: 7453,
        type: "guest-to-host",
        status: "published",
        rating: null,
        publicReview: "Shane and family are wonderful! Would definitely host again :)",
        reviewCategory: [
          { category: "cleanliness", rating: 10 },
          { category: "communication", rating: 10 },
          { category: "respect_house_rules", rating: 10 }
        ],
        submittedAt: "2020-08-21 22:45:14",
        guestName: "Shane Finkelstein",
        listingName: "2B N1 A - 29 Shoreditch Heights"
      },
      {
        id: 7454,
        type: "guest-to-host",
        status: "published",
        rating: 5,
        publicReview: "Amazing property in a fantastic location. Everything was clean and exactly as described. The host was very responsive and helpful throughout our stay.",
        reviewCategory: [
          { category: "cleanliness", rating: 5 },
          { category: "communication", rating: 5 },
          { category: "location", rating: 5 },
          { category: "value", rating: 4 }
        ],
        submittedAt: "2024-08-15 14:30:22",
        guestName: "Emily Rodriguez",
        listingName: "1B S2 C - 15 Camden Lock Apartments"
      },
      {
        id: 7455,
        type: "guest-to-host",
        status: "published",
        rating: 4,
        publicReview: "Great stay overall. The apartment was modern and well-equipped. Only minor issue was noise from the street in the early morning, but that's expected in central London.",
        reviewCategory: [
          { category: "cleanliness", rating: 5 },
          { category: "communication", rating: 4 },
          { category: "location", rating: 5 },
          { category: "value", rating: 4 }
        ],
        submittedAt: "2024-08-10 09:15:33",
        guestName: "Marcus Thompson",
        listingName: "Studio E1 B - 42 Canary Wharf Tower"
      },
      {
        id: 7456,
        type: "guest-to-host",
        status: "published",
        rating: 3,
        publicReview: "The location was perfect for our business trip, walking distance to everything we needed. However, the wifi was quite slow and the heating system was difficult to operate.",
        reviewCategory: [
          { category: "cleanliness", rating: 4 },
          { category: "communication", rating: 3 },
          { category: "location", rating: 5 },
          { category: "value", rating: 3 }
        ],
        submittedAt: "2024-08-05 16:45:12",
        guestName: "Sarah Chen",
        listingName: "2B N1 A - 29 Shoreditch Heights"
      },
      {
        id: 7457,
        type: "guest-to-host",
        status: "published",
        rating: 5,
        publicReview: "Absolutely phenomenal experience! The property exceeded all expectations. Impeccably clean, beautifully designed, and the host went above and beyond to ensure our comfort. Will definitely book again!",
        reviewCategory: [
          { category: "cleanliness", rating: 5 },
          { category: "communication", rating: 5 },
          { category: "location", rating: 5 },
          { category: "value", rating: 5 }
        ],
        submittedAt: "2024-08-20 11:20:45",
        guestName: "David Park",
        listingName: "3B W1 D - 8 Kensington Gardens Mansion"
      },
      {
        id: 7458,
        type: "guest-to-host",
        status: "published",
        rating: 2,
        publicReview: "Unfortunately, our stay did not meet expectations. The property was not as clean as advertised and several amenities mentioned in the listing were not working. The host was slow to respond to our concerns.",
        reviewCategory: [
          { category: "cleanliness", rating: 2 },
          { category: "communication", rating: 2 },
          { category: "location", rating: 4 },
          { category: "value", rating: 2 }
        ],
        submittedAt: "2024-07-28 13:35:18",
        guestName: "Jennifer Walsh",
        listingName: "1B S2 C - 15 Camden Lock Apartments"
      },
      {
        id: 7459,
        type: "guest-to-host",
        status: "published",
        rating: 4,
        publicReview: "Lovely property with great character. The exposed brick and high ceilings made it feel very special. Check-in was seamless and the location is unbeatable for exploring London.",
        reviewCategory: [
          { category: "cleanliness", rating: 4 },
          { category: "communication", rating: 5 },
          { category: "location", rating: 5 },
          { category: "value", rating: 4 }
        ],
        submittedAt: "2024-08-12 19:22:56",
        guestName: "Alessandro Rossi",
        listingName: "Studio E1 B - 42 Canary Wharf Tower"
      },
      {
        id: 7460,
        type: "guest-to-host",
        status: "published",
        rating: 5,
        publicReview: "Perfect for our weekend getaway! The property was spotless, modern, and had everything we needed. Great local restaurants nearby and easy access to public transport.",
        reviewCategory: [
          { category: "cleanliness", rating: 5 },
          { category: "communication", rating: 4 },
          { category: "location", rating: 5 },
          { category: "value", rating: 5 }
        ],
        submittedAt: "2024-08-18 08:45:30",
        guestName: "Priya Sharma",
        listingName: "2B N1 A - 29 Shoreditch Heights"
      }
    ];

    return this.normalizeReviews(mockData);
  }

  async getReviewById(reviewId) {
    try {
      const url = `${this.baseURL}/reviews/${reviewId}`;

      const response = await axios.get(url, {
        headers: this.getAuthHeaders(),
        params: { accountId: this.accountId },
        timeout: 5000
      });

      if (response.data && response.data.status === 'success') {
        return Review.fromHostawayData(response.data.result);
      }

      throw new Error('Review not found');
    } catch (error) {
      console.error(`❌ Error fetching review ${reviewId}:`, error.message);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Hostaway cache cleared');
  }

  getCacheInfo() {
    const cacheKey = 'hostaway_reviews';
    const cached = this.cache.get(cacheKey);

    return {
      cached: !!cached,
      timestamp: cached?.timestamp,
      age: cached ? Date.now() - cached.timestamp : null,
      ttl: this.cacheTTL
    };
  }
}

module.exports = new HostawayService();
