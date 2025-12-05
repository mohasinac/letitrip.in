/**
 * @fileoverview React Component
 * @module src/components/product/ProductReviews
 * @description This file contains the ProductReviews component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { logError } from "@/lib/error-logger";
import { reviewsService } from "@/services/reviews.service";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

/**
 * ProductReviewsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductReviewsProps
 */
interface ProductReviewsProps {
  /** Product Id */
  productId: string;
  /** Product Slug */
  productSlug: string;
}

/**
 * Function: Product Reviews
 */
/**
 * Performs product reviews operation
 *
 * @param {ProductReviewsProps} {
  productId,
  productSlug,
} - The {
  product id,
  product slug,
}
 *
 * @returns {any} The productreviews result
 *
 * @example
 * ProductReviews({
  productId,
  productSlug,
});
 */

/**
 * Performs product reviews operation
 *
 * @param {ProductReviewsProps} {
  productId,
  productSlug,
} - The {
  product id,
  product slug,
}
 *
 * @returns {any} The productreviews result
 *
 * @example
 * ProductReviews({
  productId,
  productSlug,
});
 */

export function ProductReviews({
  productId,
  productSlug,
}: ProductReviewsProps) {
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productSlug]);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadReviews = async () => {
    try {
      setLoading(true);
      await reviewsService.list({ productId });
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "ProductReviews.loadReviews",
        /** Metadata */
        metadata: { productId },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      {/* Header with Write ReviewFE Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Reviews
        </h2>
        {!showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Write a ReviewFE
          </button>
        )}
      </div>

      {/* ReviewFE Form */}
      {showReviewForm && (
        <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Write Your ReviewFE
          </h3>
          <ReviewForm
            productId={productId}
            onSuccess={() => {
              setShowReviewForm(false);
              loadReviews();
            }}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      <ReviewList productId={productId} />
    </div>
  );
}
