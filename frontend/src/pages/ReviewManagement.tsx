import React, { useEffect, useState } from "react";
import { useReview } from "../contexts/ReviewContext";
import { reviewApi } from "../services/api";
import type { Review, ReviewFilters } from "../types";

const ReviewManagement: React.FC = () => {
  const {
    reviews,
    filters,
    loading,
    error,
    selectedReviews,
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
  } = useReview();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "date" | "rating" | "property" | "status"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Load reviews on component mount and when filters change
  useEffect(() => {
    loadReviews();
  }, [filters, searchTerm, sortBy, sortOrder]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const filterParams: ReviewFilters = {
        ...filters,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
        page: 1,
        limit: 20,
      };

      const response = await reviewApi.getReviews(filterParams);
      if (response.success) {
        setReviews(response.data);
      } else {
        setError("Failed to load reviews");
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await reviewApi.approveReview(reviewId, "Manager");
      if (response.success) {
        approveReview(reviewId);
      }
    } catch (error) {
      console.error("Error approving review:", error);
      setError("Failed to approve review");
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const response = await reviewApi.rejectReview(
        reviewId,
        "Not suitable for public display",
        "Manager"
      );
      if (response.success) {
        rejectReview(reviewId);
      }
    } catch (error) {
      console.error("Error rejecting review:", error);
      setError("Failed to reject review");
    }
  };

  const handleBulkApprove = async () => {
    try {
      const response = await reviewApi.bulkAction(
        selectedReviews,
        "approve",
        "Manager"
      );
      if (response.success) {
        bulkApprove(selectedReviews);
        clearSelection();
      }
    } catch (error) {
      console.error("Error bulk approving reviews:", error);
      setError("Failed to bulk approve reviews");
    }
  };

  const handleBulkReject = async () => {
    try {
      const response = await reviewApi.bulkAction(
        selectedReviews,
        "reject",
        "Manager",
        "Bulk rejection"
      );
      if (response.success) {
        bulkReject(selectedReviews);
        clearSelection();
      }
    } catch (error) {
      console.error("Error bulk rejecting reviews:", error);
      setError("Failed to bulk reject reviews");
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      "ID",
      "Property",
      "Guest Name",
      "Rating",
      "Review Text",
      "Date",
      "Status",
      "Channel",
    ];

    const csvData = reviews.map((review) => [
      review.id,
      review.propertyName,
      review.guestName,
      review.rating.overall || "N/A",
      `"${review.reviewText.replace(/"/g, '""')}"`, // Escape quotes for CSV
      new Date(review.submittedAt).toLocaleDateString(),
      review.status,
      review.channel,
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reviews-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openReviewModal = (review: Review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getRatingStars = (rating: number | null) => {
    if (!rating || rating < 1 || rating > 5) return "N/A";
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    const stars = "★".repeat(fullStars) + "☆".repeat(emptyStars);
    return `${stars} (${rating})`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 bg-opacity-10 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviews.length}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 bg-opacity-10 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Reviews
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviews.filter((r) => r.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 bg-opacity-10 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Approved Reviews
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviews.filter((r) => r.status === "approved").length}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 bg-opacity-10 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Average Rating
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviews.length > 0
                  ? (
                      reviews.reduce(
                        (sum, r) => sum + (r.rating.overall || 0),
                        0
                      ) / reviews.length
                    ).toFixed(1)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Review Management
          </h2>
          <div className="flex items-center space-x-4">
            {selectedReviews.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedReviews.length} selected
                </span>
                <button
                  onClick={handleBulkApprove}
                  className="btn-primary btn-sm"
                >
                  Bulk Approve
                </button>
                <button
                  onClick={handleBulkReject}
                  className="btn-secondary btn-sm"
                >
                  Bulk Reject
                </button>
                <button onClick={clearSelection} className="btn-ghost btn-sm">
                  Clear Selection
                </button>
              </div>
            )}
            <button onClick={loadReviews} className="btn-primary">
              Refresh
            </button>
            <button onClick={handleExportCSV} className="btn-ghost">
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by guest name or review content..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status?.[0] || ""}
              onChange={(e) =>
                setFilters({
                  status: e.target.value ? [e.target.value] : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <select
              value={filters.rating || ""}
              onChange={(e) =>
                setFilters({ rating: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="1-2">1-2 Stars</option>
              <option value="3-3">3 Stars</option>
              <option value="4-4">4 Stars</option>
              <option value="5-5">5 Stars</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) =>
                setFilters({ dateFrom: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date</option>
                <option value="rating">Rating</option>
                <option value="property">Property</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="dashboard-card">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading reviews...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          reviews.forEach((review) => {
                            if (!selectedReviews.includes(review.id)) {
                              toggleSelectReview(review.id);
                            }
                          });
                        } else {
                          clearSelection();
                        }
                      }}
                      checked={
                        reviews.length > 0 &&
                        selectedReviews.length === reviews.length
                      }
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => toggleSelectReview(review.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {review.propertyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.channel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.guestName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getRatingStars(review.rating.overall)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {review.reviewText}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(review.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          review.status
                        )}`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openReviewModal(review)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {review.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(review.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* No results */}
            {reviews.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No reviews found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Details Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Review Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Property
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedReview.propertyName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Guest Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedReview.guestName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {getRatingStars(selectedReview.rating.overall)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Review Text
                  </label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedReview.reviewText}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Submitted Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(
                        selectedReview.submittedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Channel
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReview.channel}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                      selectedReview.status
                    )}`}
                  >
                    {selectedReview.status}
                  </span>
                </div>

                {selectedReview.status === "pending" && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        handleApprove(selectedReview.id);
                        setShowModal(false);
                      }}
                      className="btn-primary"
                    >
                      Approve Review
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedReview.id);
                        setShowModal(false);
                      }}
                      className="btn-secondary"
                    >
                      Reject Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
