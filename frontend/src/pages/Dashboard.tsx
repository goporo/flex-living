import React, { useEffect, useState } from "react";
import { useReview } from "../contexts/ReviewContext";
import { reviewApi } from "../services/api";
import type { PropertyPerformance } from "../types";

// Mock data for development
const mockPropertyData: PropertyPerformance[] = [
  {
    propertyId: "1",
    propertyName: "2B N1 A - 29 Shoreditch Heights",
    metrics: {
      totalReviews: 45,
      averageRating: 4.6,
      approvedReviews: 38,
      pendingReviews: 5,
      rejectedReviews: 2,
      lastReviewDate: "2024-08-25T10:30:00Z",
      categoryRatings: {
        cleanliness: 4.8,
        communication: 4.5,
        location: 4.7,
        value: 4.4,
      },
      channelBreakdown: {
        airbnb: { count: 25, averageRating: 4.7 },
        booking: { count: 15, averageRating: 4.5 },
        direct: { count: 5, averageRating: 4.8 },
      },
      monthlyTrend: [
        { month: "2024-06", reviewCount: 12, averageRating: 4.5 },
        { month: "2024-07", reviewCount: 18, averageRating: 4.6 },
        { month: "2024-08", reviewCount: 15, averageRating: 4.7 },
      ],
    },
  },
  {
    propertyId: "2",
    propertyName: "1B Central London Apartment",
    metrics: {
      totalReviews: 32,
      averageRating: 4.3,
      approvedReviews: 28,
      pendingReviews: 3,
      rejectedReviews: 1,
      lastReviewDate: "2024-08-24T15:45:00Z",
      categoryRatings: {
        cleanliness: 4.5,
        communication: 4.2,
        location: 4.8,
        value: 4.0,
      },
      channelBreakdown: {
        airbnb: { count: 20, averageRating: 4.4 },
        booking: { count: 10, averageRating: 4.1 },
        direct: { count: 2, averageRating: 4.5 },
      },
      monthlyTrend: [
        { month: "2024-06", reviewCount: 10, averageRating: 4.2 },
        { month: "2024-07", reviewCount: 12, averageRating: 4.3 },
        { month: "2024-08", reviewCount: 10, averageRating: 4.4 },
      ],
    },
  },
];

const Dashboard: React.FC = () => {
  const { loading, setLoading, setError, setReviews } = useReview();
  const [properties, setProperties] = useState<PropertyPerformance[]>([]);

  useEffect(() => {
    console.log("Dashboard useEffect running - this should only appear once");
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // For now, skip the API call and use mock data directly
        // const reviewsResponse = await reviewApi.getReviews({ limit: 10 });
        // if (reviewsResponse.success) {
        //   setReviews(reviewsResponse.data);
        // }

        // Use mock data for properties
        setProperties(mockPropertyData);
        setError(null);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setError("Failed to load dashboard data. Using mock data.");

        // Use mock data on error
        setProperties(mockPropertyData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []); // Empty dependency array to run only once

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  const totalReviews = properties.reduce(
    (sum, prop) => sum + prop.metrics.totalReviews,
    0
  );
  const averageRating =
    properties.reduce((sum, prop) => sum + prop.metrics.averageRating, 0) /
    properties.length;
  const pendingReviews = properties.reduce(
    (sum, prop) => sum + prop.metrics.pendingReviews,
    0
  );
  const approvedReviews = properties.reduce(
    (sum, prop) => sum + prop.metrics.approvedReviews,
    0
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {totalReviews}
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
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Average Rating
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {averageRating.toFixed(1)}
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
                {pendingReviews}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Approved Reviews
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {approvedReviews}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Performance */}
      <div className="dashboard-card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Property Performance
        </h3>
        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.propertyId}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  {property.propertyName}
                </h4>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-900">
                    {property.metrics.averageRating}
                  </span>
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Reviews</p>
                  <p className="font-medium">{property.metrics.totalReviews}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pending</p>
                  <p className="font-medium text-yellow-600">
                    {property.metrics.pendingReviews}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Approved</p>
                  <p className="font-medium text-green-600">
                    {property.metrics.approvedReviews}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Review</p>
                  <p className="font-medium">
                    {new Date(
                      property.metrics.lastReviewDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-gray-900">Sync Reviews</p>
              <p className="text-sm text-gray-500">
                Fetch latest reviews from Hostaway
              </p>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-gray-900">Export Data</p>
              <p className="text-sm text-gray-500">Download reviews as CSV</p>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-left">
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">
                Detailed performance insights
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
