"use client";

import { useState, useEffect } from "react";
import {
  fetchMarkdownContent,
  parseReviewsMarkdown,
} from "@/lib/utils/markdown-client";
import type { ReviewItem } from "@/lib/utils/markdown-client";

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const reviewsData = await fetchMarkdownContent("homepage/reviews.md");
        const parsedReviews = parseReviewsMarkdown(reviewsData.content);
        setReviews(parsedReviews);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real reviews from real customers who love our products
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className="w-4 h-4 bg-gray-200 rounded mr-1"
                    ></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.slice(0, 6).map((review, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {review.rating}/5
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {review.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm italic">
                  "{review.content}"
                </p>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{review.author}</p>
                  {review.role && (
                    <p className="text-gray-500">{review.role}</p>
                  )}
                  {review.date && (
                    <p className="text-gray-400 text-xs mt-1">{review.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">50K+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">99%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">24/7</div>
            <div className="text-gray-600">Customer Support</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-gray-600">Authentic Products</div>
          </div>
        </div>
      </div>
    </section>
  );
}
