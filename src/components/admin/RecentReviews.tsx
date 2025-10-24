"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { useRealTimeData } from "@/hooks/useRealTimeData";

interface Review {
  id: string;
  productName: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function RecentReviews() {
  const fetchRecentReviews = async () => {
    const response = await fetch("/api/admin/reviews?limit=5&sort=newest");
    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }
    const data = await response.json();
    return data;
  };

  const { data: reviews, loading: isLoading, error } = useRealTimeData(
    fetchRecentReviews,
    {
      enabled: true,
      interval: 30000, // Refresh every 30 seconds
    }
  );

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - reviewDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Reviews
          </h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {!reviews || reviews.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {error ? "Failed to load reviews" : "No recent reviews found"}
            </div>
          ) : (
            (reviews as Review[]).map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {review.userName}
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            review.status
                          )}`}
                        >
                          {review.status.charAt(0).toUpperCase() +
                            review.status.slice(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {review.productName}
                    </p>
                    <div className="flex items-center mt-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {review.comment}
                    </p>
                    {review.status === "pending" && (
                      <div className="flex space-x-2 mt-3">
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                          Approve
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
