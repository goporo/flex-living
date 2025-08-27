import React, { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type {
  ReviewContextType,
  ReviewContextState,
  Review,
  ReviewFilters,
} from "../types";

// Initial state
const initialState: ReviewContextState = {
  reviews: [],
  filters: {
    page: 1,
    limit: 20,
    sortBy: "date",
    sortOrder: "desc",
  },
  loading: false,
  error: null,
  properties: [],
  selectedReviews: [],
};

// Action types
type ReviewAction =
  | { type: "SET_REVIEWS"; payload: Review[] }
  | { type: "SET_FILTERS"; payload: ReviewFilters }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "APPROVE_REVIEW"; payload: string }
  | { type: "REJECT_REVIEW"; payload: string }
  | { type: "BULK_APPROVE"; payload: string[] }
  | { type: "BULK_REJECT"; payload: string[] }
  | { type: "TOGGLE_SELECT_REVIEW"; payload: string }
  | { type: "CLEAR_SELECTION" };

// Reducer
const reviewReducer = (
  state: ReviewContextState,
  action: ReviewAction
): ReviewContextState => {
  switch (action.type) {
    case "SET_REVIEWS":
      return { ...state, reviews: action.payload };

    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "APPROVE_REVIEW":
      return {
        ...state,
        reviews: state.reviews.map((review) =>
          review.id === action.payload
            ? {
                ...review,
                status: "approved" as const,
                isPublic: true,
                approvedAt: new Date().toISOString(),
              }
            : review
        ),
      };

    case "REJECT_REVIEW":
      return {
        ...state,
        reviews: state.reviews.map((review) =>
          review.id === action.payload
            ? {
                ...review,
                status: "rejected" as const,
                isPublic: false,
              }
            : review
        ),
      };

    case "BULK_APPROVE":
      return {
        ...state,
        reviews: state.reviews.map((review) =>
          action.payload.includes(review.id)
            ? {
                ...review,
                status: "approved" as const,
                isPublic: true,
                approvedAt: new Date().toISOString(),
              }
            : review
        ),
        selectedReviews: [],
      };

    case "BULK_REJECT":
      return {
        ...state,
        reviews: state.reviews.map((review) =>
          action.payload.includes(review.id)
            ? {
                ...review,
                status: "rejected" as const,
                isPublic: false,
              }
            : review
        ),
        selectedReviews: [],
      };

    case "TOGGLE_SELECT_REVIEW":
      return {
        ...state,
        selectedReviews: state.selectedReviews.includes(action.payload)
          ? state.selectedReviews.filter((id) => id !== action.payload)
          : [...state.selectedReviews, action.payload],
      };

    case "CLEAR_SELECTION":
      return { ...state, selectedReviews: [] };

    default:
      return state;
  }
};

// Context
const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

// Provider component
interface ReviewProviderProps {
  children: ReactNode;
}

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reviewReducer, initialState);

  const setReviews = (reviews: Review[]) => {
    dispatch({ type: "SET_REVIEWS", payload: reviews });
  };

  const setFilters = (filters: ReviewFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const approveReview = (reviewId: string) => {
    dispatch({ type: "APPROVE_REVIEW", payload: reviewId });
  };

  const rejectReview = (reviewId: string) => {
    dispatch({ type: "REJECT_REVIEW", payload: reviewId });
  };

  const bulkApprove = (reviewIds: string[]) => {
    dispatch({ type: "BULK_APPROVE", payload: reviewIds });
  };

  const bulkReject = (reviewIds: string[]) => {
    dispatch({ type: "BULK_REJECT", payload: reviewIds });
  };

  const toggleSelectReview = (reviewId: string) => {
    dispatch({ type: "TOGGLE_SELECT_REVIEW", payload: reviewId });
  };

  const clearSelection = () => {
    dispatch({ type: "CLEAR_SELECTION" });
  };

  const value: ReviewContextType = {
    ...state,
    setReviews,
    setFilters,
    setLoading,
    setError,
    approveReview,
    rejectReview,
    bulkApprove,
    bulkReject,
    toggleSelectReview,
    clearSelection,
  };

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
};

// Hook to use the context
export const useReview = (): ReviewContextType => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error("useReview must be used within a ReviewProvider");
  }
  return context;
};
