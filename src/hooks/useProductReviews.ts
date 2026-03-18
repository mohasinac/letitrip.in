"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { createReviewAction } from "@/actions";
import { apiClient } from "@mohasinac/http";

interface ReviewsResponseMeta {
  total: number;
  totalPages: number;
  hasMore: boolean;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

interface ReviewsResponse {
  data: import("@/db/schema").ReviewDocument[];
  meta: ReviewsResponseMeta;
}

interface ProductReviewsApiResult {
  items: import("@/db/schema").ReviewDocument[];
  total: number;
  totalPages: number;
  hasMore: boolean;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

/**
 * useProductReviews
 * Fetches paginated reviews for a specific product via GET /api/reviews?productId=...
 *
 * @param productId - The product to load reviews for
 * @param page      - Current page number (1-based, default: 1)
 * @param pageSize  - Reviews per page (default: 10)
 */
export function useProductReviews(productId: string, page = 1, pageSize = 10) {
  return useQuery<ReviewsResponse>({
    queryKey: ["reviews", productId, String(page)],
    queryFn: async () => {
      const result = await apiClient.get<ProductReviewsApiResult>(
        `/api/reviews?productId=${productId}&page=${page}&pageSize=${pageSize}`,
      );
      return {
        data: result.items,
        meta: {
          total: result.total,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
          averageRating: result.averageRating,
          ratingDistribution: result.ratingDistribution,
        },
      };
    },
    enabled: Boolean(productId),
  });
}

interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export function useCreateReview(
  onSuccess?: () => void,
  onError?: (err: { status?: number; message?: string }) => void,
) {
  return useMutation<unknown, Error, CreateReviewInput>({
    mutationFn: (data) =>
      createReviewAction({ ...data, images: data.images ?? [] }),
    onSuccess,
    onError,
  });
}
