import axios from "axios";
import type {
  ApiResponse,
  Review,
  ReviewFilters,
  PropertyPerformance,
  PublicReview,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

console.log("🔧 API_BASE_URL:", API_BASE_URL);
console.log("🔧 VITE_API_URL:", import.meta.env.VITE_API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      "🚀 Making API request to:",
      `${config.baseURL || ""}${config.url || ""}`
    );
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// API methods
export const reviewApi = {
  // Get reviews from Hostaway
  getHostawayReviews: async (): Promise<ApiResponse<Review[]>> => {
    const response = await api.get("/api/reviews/hostaway");
    return response.data;
  },

  // Get filtered reviews for dashboard
  getReviews: async (
    filters: ReviewFilters = {}
  ): Promise<ApiResponse<Review[]>> => {
    const response = await api.get("/api/reviews", { params: filters });
    return response.data;
  },

  // Get approved reviews for public property page
  getApprovedReviews: async (propertyId: string): Promise<Review[]> => {
    console.log(
      "🚀 Making API request to:",
      `${API_BASE_URL}/api/reviews/public/${propertyId}`
    );
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/public/${propertyId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch approved reviews: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  },

  // Google Reviews API
  getGoogleReviews: async (): Promise<Review[]> => {
    console.log("🚀 Making API request to:", `${API_BASE_URL}/api/google`);
    const response = await fetch(`${API_BASE_URL}/api/google`);

    if (!response.ok) {
      throw new Error(`Failed to fetch Google reviews: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  },

  // Get Google reviews for specific property
  getGoogleReviewsForProperty: async (
    propertyId: string
  ): Promise<Review[]> => {
    console.log(
      "🚀 Making API request to:",
      `${API_BASE_URL}/api/google/property/${propertyId}`
    );
    const response = await fetch(
      `${API_BASE_URL}/api/google/property/${propertyId}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Google reviews for property: ${response.status}`
      );
    }

    const data = await response.json();
    return data.data || [];
  },

  // Approve a review
  approveReview: async (
    reviewId: string,
    approvedBy: string
  ): Promise<ApiResponse<Review>> => {
    const response = await api.post(`/api/reviews/${reviewId}/approve`, {
      action: "approve",
      actionBy: approvedBy,
    });
    return response.data;
  },

  // Reject a review
  rejectReview: async (
    reviewId: string,
    reason: string,
    rejectedBy: string
  ): Promise<ApiResponse<Review>> => {
    const response = await api.post(`/api/reviews/${reviewId}/reject`, {
      action: "reject",
      actionBy: rejectedBy,
      reason,
    });
    return response.data;
  },

  // Bulk actions
  bulkAction: async (
    reviewIds: string[],
    action: "approve" | "reject",
    actionBy: string,
    reason?: string
  ): Promise<ApiResponse<Review[]>> => {
    const response = await api.post("/api/reviews/bulk-action", {
      reviewIds,
      action,
      actionBy,
      reason,
    });
    return response.data;
  },

  // Get public reviews for a property
  getPublicReviews: async (
    propertyId: string,
    filters: Partial<ReviewFilters> = {}
  ): Promise<ApiResponse<PublicReview[]>> => {
    const response = await api.get(`/api/reviews/public/${propertyId}`, {
      params: filters,
    });
    return response.data;
  },
};

export const analyticsApi = {
  // Get property performance data
  getPropertyPerformance: async (): Promise<
    ApiResponse<PropertyPerformance[]>
  > => {
    const response = await api.get("/api/analytics/properties");
    return response.data;
  },

  // Get trend data
  getTrends: async (
    period: "week" | "month" | "quarter" | "year",
    propertyIds?: string[]
  ): Promise<ApiResponse<any>> => {
    const response = await api.get("/api/analytics/trends", {
      params: { period, propertyId: propertyIds },
    });
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<any> => {
  const response = await api.get("/health");
  return response.data;
};

export default api;
