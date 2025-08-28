// Core Review Types
export interface Review {
  id: string;
  sourceId: string;
  source: "hostaway" | "google" | "manual";

  // Property information
  propertyId: string;
  propertyName: string;

  // Review content
  guestName: string;
  reviewText: string;
  rating: ReviewRating;
  submittedAt: string; // ISO date string

  // Management fields
  status: "pending" | "approved" | "rejected";
  isPublic: boolean;
  approvedBy?: string;
  approvedAt?: string; // ISO date string

  // Metadata
  channel: string;
  type: string;
  metadata: ReviewMetadata;
}

export interface ReviewRating {
  overall: number | null;
  categories: {
    cleanliness?: number;
    communication?: number;
    location?: number;
    value?: number;
    checkin?: number;
    accuracy?: number;
  };
}

export interface ReviewMetadata {
  responseRequired: boolean;
  flaggedForReview: boolean;
  priority: "low" | "medium" | "high";
  tags: string[];
  sourceData: any;
}

// Property Performance Types
export interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  metrics: {
    totalReviews: number;
    averageRating: number;
    approvedReviews: number;
    pendingReviews: number;
    rejectedReviews: number;
    lastReviewDate: string;
    categoryRatings: {
      cleanliness: number;
      communication: number;
      location: number;
      value: number;
    };
    channelBreakdown: {
      [channel: string]: {
        count: number;
        averageRating: number;
      };
    };
    monthlyTrend: {
      month: string;
      reviewCount: number;
      averageRating: number;
    }[];
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    lastSync?: string;
    averageRating?: number;
    ratingDistribution?: {
      [rating: number]: number;
    };
  };
  message?: string;
  error?: string;
}

// Filter Types
export interface ReviewFilters {
  propertyId?: string[];
  status?: string[];
  rating?: string; // e.g., "4-5"
  dateFrom?: string;
  dateTo?: string;
  channel?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "rating" | "property" | "status";
  sortOrder?: "asc" | "desc";
}

// Public Review Types
export interface PublicReview {
  id: string;
  guestName: string;
  reviewText: string;
  rating: ReviewRating;
  submittedAt: string;
  propertyName: string;
  channel: string;
}

// Context Types
export interface ReviewContextState {
  reviews: Review[];
  filters: ReviewFilters;
  loading: boolean;
  error: string | null;
  properties: PropertyPerformance[];
  selectedReviews: string[];
}

export interface ReviewContextActions {
  setReviews: (reviews: Review[]) => void;
  setFilters: (filters: ReviewFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  bulkApprove: (reviewIds: string[]) => void;
  bulkReject: (reviewIds: string[]) => void;
  toggleSelectReview: (reviewId: string) => void;
  clearSelection: () => void;
}

export type ReviewContextType = ReviewContextState & ReviewContextActions;
