import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { reviewApi } from "../services/api";
import type { PublicReview } from "../types";

interface PropertyInfo {
  id: string;
  name: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  description: string;
  images: string[];
}

const PropertyView: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [googleReviews, setGoogleReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock property data - in real app this would come from an API
  const propertyInfo: PropertyInfo = {
    id: propertyId || "",
    name: getPropertyName(propertyId || ""),
    address: getPropertyAddress(propertyId || ""),
    bedrooms: 2,
    bathrooms: 1,
    capacity: 4,
    pricePerNight: 150,
    amenities: [
      "WiFi",
      "Kitchen",
      "Washing Machine",
      "Heating",
      "TV",
      "Coffee Machine",
    ],
    description:
      "Beautiful modern apartment in the heart of London. Perfect for business travelers and tourists alike. Walking distance to major attractions and transport links.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    ],
  };

  useEffect(() => {
    if (!propertyId) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Fetch both regular reviews and Google reviews
        const [approvedReviews, googleReviewData] = await Promise.all([
          reviewApi.getApprovedReviews(propertyId),
          reviewApi.getGoogleReviewsForProperty(propertyId),
        ]);

        setReviews(approvedReviews);
        setGoogleReviews(googleReviewData);
      } catch (err) {
        setError("Failed to load reviews");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [propertyId]);

  function getPropertyName(id: string): string {
    const propertyNames: Record<string, string> = {
      "2b-n1-a-29-shoreditch-heights": "2B N1 A - 29 Shoreditch Heights",
      "1b-s2-c-15-camden-lock-apartments":
        "1B S2 C - 15 Camden Lock Apartments",
      "studio-e1-b-42-canary-wharf-tower":
        "Studio E1 B - 42 Canary Wharf Tower",
      "3b-w1-d-8-kensington-gardens-mansion":
        "3B W1 D - 8 Kensington Gardens Mansion",
    };
    return propertyNames[id] || "Luxury London Apartment";
  }

  function getPropertyAddress(id: string): string {
    const addresses: Record<string, string> = {
      "2b-n1-a-29-shoreditch-heights": "29 Shoreditch Heights, London N1",
      "1b-s2-c-15-camden-lock-apartments":
        "15 Camden Lock Apartments, London S2",
      "studio-e1-b-42-canary-wharf-tower": "42 Canary Wharf Tower, London E1",
      "3b-w1-d-8-kensington-gardens-mansion":
        "8 Kensington Gardens Mansion, London W1",
    };
    return addresses[id] || "Central London";
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </span>
    ));
  };

  // Combine all reviews for calculations
  const allReviews = [...reviews, ...googleReviews];

  const averageRating =
    allReviews.length > 0
      ? allReviews.reduce(
          (sum, review) => sum + (review.rating.overall || 0),
          0
        ) / allReviews.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Home</span>
            <span>→</span>
            <span>Properties</span>
            <span>→</span>
            <span className="text-gray-900">{propertyInfo.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Property Images */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2">
            <img
              src={propertyInfo.images[0]}
              alt={propertyInfo.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="space-y-4">
            {propertyInfo.images.slice(1).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${propertyInfo.name} ${index + 2}`}
                className="w-full h-44 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {propertyInfo.name}
              </h1>
              <p className="text-gray-600 mb-4">{propertyInfo.address}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>{propertyInfo.bedrooms} bedrooms</span>
                <span>{propertyInfo.bathrooms} bathroom</span>
                <span>Sleeps {propertyInfo.capacity}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                About this property
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {propertyInfo.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Amenities
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {propertyInfo.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Guest Reviews
                </h2>
                {allReviews.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <span className="text-gray-600">
                      {averageRating.toFixed(1)} ({allReviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading reviews...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {!loading && !error && allReviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No reviews available for this property yet.
                  </p>
                </div>
              )}

              {!loading && !error && allReviews.length > 0 && (
                <div className="space-y-6">
                  {/* Google Reviews Section */}
                  {googleReviews.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📱</span>
                        Google Reviews
                      </h3>
                      <div className="space-y-4">
                        {googleReviews.map((review) => (
                          <div
                            key={review.id}
                            className="bg-blue-50 p-6 rounded-lg border border-blue-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {review.guestName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {formatDate(review.submittedAt)}
                                </p>
                              </div>
                              <div className="flex">
                                {renderStars(review.rating.overall || 0)}
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {review.reviewText}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platform Reviews Section */}
                  {reviews.length > 0 && (
                    <div>
                      {googleReviews.length > 0 && (
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <span className="mr-2">🏠</span>
                          Property Platform Reviews
                        </h3>
                      )}
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="bg-white p-6 rounded-lg shadow-sm border"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {review.guestName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {formatDate(review.submittedAt)}
                                </p>
                              </div>
                              <div className="flex">
                                {renderStars(review.rating.overall || 0)}
                              </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-4">
                              {review.reviewText}
                            </p>

                            {review.rating.categories &&
                              Object.keys(review.rating.categories).length >
                                0 && (
                                <div className="border-t pt-4">
                                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                                    Category Ratings
                                  </h5>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(
                                      review.rating.categories
                                    ).map(([category, rating]) => (
                                      <div
                                        key={category}
                                        className="flex justify-between"
                                      >
                                        <span className="text-gray-600 capitalize">
                                          {category.replace("_", " ")}
                                        </span>
                                        <span className="text-gray-900">
                                          {rating}/5
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-4">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  £{propertyInfo.pricePerNight}
                </div>
                <div className="text-gray-600">per night</div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4">
                Check Availability
              </button>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="text-gray-900">Apartment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="text-gray-900">3:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="text-gray-900">11:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min. Stay</span>
                  <span className="text-gray-900">2 nights</span>
                </div>
              </div>

              {reviews.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-1">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {allReviews.length} guest reviews
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyView;
