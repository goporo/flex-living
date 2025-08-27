import axios from "axios";
import type {
  ApiResponse,
  Review,
  ReviewFilters,
  PropertyPerformance,
  PublicReview,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

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

  // Approve a review
  approveReview: async (
    reviewId: string,
    approvedBy: string
  ): Promise<ApiResponse<Review>> => {
    const response = await api.post(`/api/reviews/${reviewId}/approve`, {
      approvedBy,
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
      reason,
      rejectedBy,
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
