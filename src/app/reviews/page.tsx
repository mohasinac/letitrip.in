"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  verified: boolean;
  helpful: number;
  date: string;
  images?: string[];
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    // Mock reviews data
    const mockReviews: ProductReview[] = [
      {
        id: "1",
        productId: "beyblade-1",
        productName: "Dragon Storm Beyblade Burst Pro",
        productImage: "/images/beyblade-1.jpg",
        userName: "Alex Chen",
        rating: 5,
        title: "Absolutely amazing Beyblade!",
        content:
          "This Beyblade exceeded all my expectations. The build quality is fantastic, and it performs incredibly well in battles. The burst mechanism works perfectly, and the design is stunning. My son loves it and it has become his favorite.",
        pros: [
          "Excellent build quality",
          "Great balance",
          "Beautiful design",
          "Strong burst mechanism",
        ],
        cons: ["Price is a bit high"],
        verified: true,
        helpful: 12,
        date: "2024-10-20T14:30:00Z",
        images: ["/images/review-1-1.jpg", "/images/review-1-2.jpg"],
      },
      {
        id: "2",
        productId: "beyblade-2",
        productName: "Lightning L-Drago Metal Fight",
        productImage: "/images/beyblade-2.jpg",
        userName: "Sarah Johnson",
        rating: 4,
        title: "Great for competitive battles",
        content:
          "Solid Beyblade with good attack power. The metal construction feels premium and durable. It spins well and has good stamina. Only minor issue is that it can be a bit aggressive for younger kids.",
        pros: ["Heavy metal construction", "Good attack power", "Durable"],
        cons: ["Can be too aggressive", "Sharp edges"],
        verified: true,
        helpful: 8,
        date: "2024-10-18T09:15:00Z",
      },
      {
        id: "3",
        productId: "stadium-1",
        productName: "Thunder Dome Beyblade Stadium",
        productImage: "/images/stadium-1.jpg",
        userName: "Mike Wilson",
        rating: 5,
        title: "Perfect stadium for battles!",
        content:
          "This stadium is exactly what we needed. The size is perfect, the walls are high enough to contain even the most aggressive Beyblades, and the surface provides good grip. Assembly was easy and it feels very sturdy.",
        pros: [
          "Perfect size",
          "High walls",
          "Good surface grip",
          "Easy assembly",
          "Sturdy construction",
        ],
        cons: [],
        verified: true,
        helpful: 15,
        date: "2024-10-15T16:45:00Z",
      },
      {
        id: "4",
        productId: "launcher-1",
        productName: "Power Grip Pro Launcher",
        productImage: "/images/launcher-1.jpg",
        userName: "Emily Davis",
        rating: 3,
        title: "Decent launcher but could be better",
        content:
          "The launcher works fine and gives good power to the Beyblade launch. However, the grip could be more comfortable and sometimes the string gets stuck. For the price, it's okay but not exceptional.",
        pros: ["Good launch power", "Compatible with most Beyblades"],
        cons: [
          "Uncomfortable grip",
          "String sometimes sticks",
          "Feels a bit cheap",
        ],
        verified: true,
        helpful: 4,
        date: "2024-10-12T11:20:00Z",
      },
      {
        id: "5",
        productId: "beyblade-3",
        productName: "Xcalibur Sword Beyblade X",
        productImage: "/images/beyblade-3.jpg",
        userName: "Ryan Martinez",
        rating: 5,
        title: "Next-level Beyblade experience!",
        content:
          "The Beyblade X series is incredible! This Xcalibur has amazing attack power and the new X-Rail system adds a whole new dimension to battles. The build quality is top-notch and it feels premium in every way.",
        pros: [
          "X-Rail compatibility",
          "Incredible attack power",
          "Premium feel",
          "Innovative design",
        ],
        cons: ["Expensive", "Requires X-Rail stadium"],
        verified: true,
        helpful: 9,
        date: "2024-10-10T13:30:00Z",
      },
      {
        id: "6",
        productId: "beyblade-1",
        productName: "Dragon Storm Beyblade Burst Pro",
        productImage: "/images/beyblade-1.jpg",
        userName: "David Kim",
        rating: 4,
        title: "Great Beyblade, minor issues",
        content:
          "Overall a really good Beyblade. It performs well in battles and looks amazing. The only downside is that the burst mechanism is maybe a bit too sensitive, causing it to burst more often than I'd like in competitive play.",
        pros: ["Great performance", "Beautiful design", "Good balance"],
        cons: ["Burst mechanism too sensitive"],
        verified: false,
        helpful: 6,
        date: "2024-10-08T10:15:00Z",
      },
    ];

    const mockStats: ReviewStats = {
      totalReviews: 156,
      averageRating: 4.3,
      ratingDistribution: {
        5: 78,
        4: 45,
        3: 21,
        2: 8,
        1: 4,
      },
    };

    // Simulate API call
    setTimeout(() => {
      setReviews(mockReviews);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReviews = reviews.filter((review) => {
    if (filterRating && review.rating !== filterRating) return false;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "rating-high":
        return b.rating - a.rating;
      case "rating-low":
        return a.rating - b.rating;
      case "helpful":
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-gray-700">
                Home
              </Link>
              <span>›</span>
              <span className="text-gray-900">Reviews</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Reviews
            </h1>
            <p className="text-gray-600 mt-1">
              See what customers are saying about our products
            </p>
          </div>

          {/* Review Stats */}
          {stats && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {stats.averageRating}
                    </div>
                    <div>
                      {renderStars(Math.round(stats.averageRating), "lg")}
                      <p className="text-sm text-gray-600 mt-1">
                        Based on {stats.totalReviews} reviews
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Rating Distribution
                  </h3>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div
                      key={rating}
                      className="flex items-center space-x-3 mb-2"
                    >
                      <span className="text-sm w-6">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (stats.ratingDistribution[
                                rating as keyof typeof stats.ratingDistribution
                              ] /
                                stats.totalReviews) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {
                          stats.ratingDistribution[
                            rating as keyof typeof stats.ratingDistribution
                          ]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filters and Sorting */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-wrap items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Filter by rating:
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilterRating(null)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filterRating === null
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFilterRating(rating)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                        filterRating === rating
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span>{rating}</span>
                      <svg
                        className="h-3 w-3 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating-high">Highest Rating</option>
                  <option value="rating-low">Lowest Rating</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <Link href={`/products/${review.productId}`}>
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                    </Link>

                    {/* Review Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${review.productId}`}
                        className="text-sm font-medium text-primary hover:text-primary-dark"
                      >
                        {review.productName}
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          by {review.userName}
                        </span>
                        {review.verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {review.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {review.content}
                  </p>
                </div>

                {/* Pros and Cons */}
                {(review.pros.length > 0 || review.cons.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {review.pros.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-800 mb-2 flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Pros
                        </h4>
                        <ul className="space-y-1">
                          {review.pros.map((pro, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-700 flex items-start"
                            >
                              <span className="text-green-500 mr-2">•</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {review.cons.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-800 mb-2 flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18 12H6"
                            />
                          </svg>
                          Cons
                        </h4>
                        <ul className="space-y-1">
                          {review.cons.map((con, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-700 flex items-start"
                            >
                              <span className="text-red-500 mr-2">•</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      {review.images.map((image, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center"
                        >
                          <svg
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    <button className="text-sm text-gray-600 hover:text-gray-800">
                      Reply
                    </button>
                  </div>
                  <button className="text-sm text-gray-400 hover:text-gray-600">
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="btn btn-outline">Load More Reviews</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
