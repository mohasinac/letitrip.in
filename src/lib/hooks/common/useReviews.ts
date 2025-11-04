/**
 * useReviews Hook
 * React hook for fetching and managing review data
 * 
 * Usage:
 *   const { reviews, loading } = useReviews({ productId: 'abc123' });
 */

import { useState, useEffect, useCallback } from 'react';
import { reviewsService } from '@/lib/api/services';
import type { Review } from "@/types/shared";
import type { ReviewFilters } from '@/lib/api/services/reviews.service';
import type { PaginatedData } from '@/lib/api/responses';

export interface UseReviewsResult {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch list of reviews
 */
export function useReviews(filters?: ReviewFilters): UseReviewsResult {
  const [data, setData] = useState<PaginatedData<Review> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reviewsService.list(filters);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    hasMore: data?.hasMore || false,
    loading,
    error,
    refetch: fetchReviews,
  };
}

/**
 * Hook to fetch reviews for a specific product
 */
export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await reviewsService.getByProduct(productId);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product reviews');
      console.error('Failed to fetch product reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}
