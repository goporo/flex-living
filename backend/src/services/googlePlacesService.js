const axios = require('axios');
const Review = require('../models/Review');

class GooglePlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseURL = 'https://maps.googleapis.com/maps/api/place';
    this.cache = new Map();
    this.cacheTTL = parseInt(process.env.CACHE_TTL) || 15 * 60 * 1000; // 15 minutes

    // Map property IDs to Google Place IDs
    this.propertyPlaceMapping = {
      '2b-n1-a-29-shoreditch-heights': 'ChIJyRJx9Z0cdkgRF8MmZ6vZ6_c', // Example Place ID
      '1b-s2-c-15-camden-lock-apartments': 'ChIJmRJx9Z0cdkgRF8MmZ6vZ6_d',
      '2b-e1-b-42-canary-wharf-tower': 'ChIJnRJx9Z0cdkgRF8MmZ6vZ6_e'
    };
  }

  async fetchReviews(propertyId, options = {}) {
    try {
      if (!this.apiKey) {
        console.log('⚠️ Google Places API key not configured, using mock data');
        return this.getMockGoogleReviews(propertyId);
      }

      console.log(`🔄 Fetching Google reviews for property: ${propertyId}`);

      const cacheKey = `google_reviews_${propertyId}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log('📦 Returning cached Google reviews');
        return cached.data;
      }

      const placeId = this.propertyPlaceMapping[propertyId];
      if (!placeId) {
        console.log(`⚠️ No Google Place ID mapped for property: ${propertyId}`);
        return this.getMockGoogleReviews(propertyId);
      }

      const url = `${this.baseURL}/details/json`;
      const params = {
        place_id: placeId,
        fields: 'name,rating,reviews',
        key: this.apiKey,
        language: 'en'
      };

      const response = await axios.get(url, {
        params,
        timeout: 10000
      });

      if (response.data.status === 'OK' && response.data.result) {
        const normalizedReviews = this.normalizeReviews(
          response.data.result.reviews || [],
          propertyId,
          response.data.result.name
        );

        // Cache the results
        this.cache.set(cacheKey, {
          data: normalizedReviews,
          timestamp: Date.now()
        });

        console.log(`✅ Successfully fetched ${normalizedReviews.length} Google reviews`);
        return normalizedReviews;
      } else {
        throw new Error(`Google Places API error: ${response.data.status}`);
      }

    } catch (error) {
      console.error('❌ Error fetching from Google Places API:', error.message);
      console.log('🔄 Falling back to mock Google reviews...');
      return this.getMockGoogleReviews(propertyId);
    }
  }

  normalizeReviews(googleReviews, propertyId, propertyName) {
    return googleReviews
      .filter(review => review && review.text) // Filter out reviews without text
      .map(review => {
        try {
          return Review.fromGoogleData(review, propertyId, propertyName);
        } catch (error) {
          console.warn(`⚠️ Failed to normalize Google review:`, error.message);
          return null;
        }
      })
      .filter(review => review !== null);
  }

  getMockGoogleReviews(propertyId) {
    console.log('📝 Using mock Google review data');

    const propertyNames = {
      '2b-n1-a-29-shoreditch-heights': '29 Shoreditch Heights',
      '1b-s2-c-15-camden-lock-apartments': '15 Camden Lock Apartments',
      '2b-e1-b-42-canary-wharf-tower': '42 Canary Wharf Tower'
    };

    const mockData = [
      {
        author_name: "Sarah Wilson",
        rating: 5,
        text: "Excellent property management! The apartment was spotless and the check-in process was seamless. Location is perfect for exploring London.",
        time: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60), // 7 days ago
        relative_time_description: "a week ago"
      },
      {
        author_name: "Michael Chen",
        rating: 4,
        text: "Great stay overall. The property was well-maintained and the host was responsive. Only minor issue was the WiFi speed could be better.",
        time: Math.floor(Date.now() / 1000) - (14 * 24 * 60 * 60), // 14 days ago  
        relative_time_description: "2 weeks ago"
      },
      {
        author_name: "Lisa Thompson",
        rating: 5,
        text: "Amazing experience! The apartment exceeded our expectations. Perfect for business travel with excellent transport links.",
        time: Math.floor(Date.now() / 1000) - (21 * 24 * 60 * 60), // 21 days ago
        relative_time_description: "3 weeks ago"
      }
    ];

    return this.normalizeReviews(mockData, propertyId, propertyNames[propertyId] || 'Property');
  }

  async getAllPropertyReviews() {
    const allReviews = [];

    for (const propertyId of Object.keys(this.propertyPlaceMapping)) {
      try {
        const reviews = await this.fetchReviews(propertyId);
        allReviews.push(...reviews);
      } catch (error) {
        console.error(`Error fetching Google reviews for ${propertyId}:`, error.message);
      }
    }

    return allReviews;
  }
}

module.exports = GooglePlacesService;
