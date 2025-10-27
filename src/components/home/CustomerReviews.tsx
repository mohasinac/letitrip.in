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
    <section className="py-24 bg-gradient-to-br from-theme-background to-theme-accent/30 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black text-theme-text mb-6 drop-shadow-lg">
            What Our Customers Say
          </h2>
          <p className="text-2xl text-theme-muted font-bold max-w-2xl mx-auto drop-shadow-md">
            Real reviews from real customers who love our products
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 animate-pulse border-4 border-theme-primary/30 shadow-lg"
              >
                <div className="flex mb-6">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className="w-5 h-5 bg-theme-muted rounded mr-2"
                    ></div>
                  ))}
                </div>
                <div className="h-5 bg-theme-muted rounded mb-3"></div>
                <div className="h-4 bg-theme-muted rounded mb-6"></div>
                <div className="h-4 bg-theme-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {reviews.slice(0, 6).map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border-4 border-theme-primary hover:border-theme-secondary hover-glow-theme-strong transition-all duration-500 transform hover:-translate-y-2 shadow-xl"
              >
                <div className="flex items-center mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-6 h-6 ${
                          i < review.rating
                            ? "text-theme-primary"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-3 text-lg font-bold text-theme-muted">
                    {review.rating}/5
                  </span>
                </div>
                <h3 className="font-bold text-theme-text mb-3 text-xl drop-shadow-sm">
                  {review.title}
                </h3>
                <p className="text-theme-muted mb-6 text-lg italic font-medium leading-relaxed">
                  "{review.content}"
                </p>
                <div className="text-base">
                  <p className="font-bold text-theme-text text-lg">
                    {review.author}
                  </p>
                  {review.role && (
                    <p className="text-theme-muted font-semibold">
                      {review.role}
                    </p>
                  )}
                  {review.date && (
                    <p className="text-theme-muted text-sm mt-2 font-medium">
                      {review.date}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          <div className="bg-white rounded-2xl p-6 border-4 border-theme-primary shadow-xl">
            <div className="text-5xl font-black text-theme-primary mb-2 drop-shadow-md">
              50K+
            </div>
            <div className="text-theme-muted font-bold text-lg">
              Happy Customers
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border-4 border-theme-primary shadow-xl">
            <div className="text-5xl font-black text-theme-primary mb-2 drop-shadow-md">
              99%
            </div>
            <div className="text-theme-muted font-bold text-lg">
              Satisfaction Rate
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border-4 border-theme-primary shadow-xl">
            <div className="text-5xl font-black text-theme-primary mb-2 drop-shadow-md">
              24/7
            </div>
            <div className="text-theme-muted font-bold text-lg">
              Customer Support
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border-4 border-theme-primary shadow-xl">
            <div className="text-5xl font-black text-theme-primary mb-2 drop-shadow-md">
              100%
            </div>
            <div className="text-theme-muted font-bold text-lg">
              Authentic Products
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
