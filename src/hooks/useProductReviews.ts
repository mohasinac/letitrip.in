"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { createReviewAction, listReviewsByProductAction } from "@/actions";

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

/**
 * useProductReviews
 * Fetches paginated reviews for a specific product.
 *
 * @param productId - The product to load reviews for
 * @param page      - Current page number (1-based, default: 1)
 * @param pageSize  - Reviews per page (default: 10)
 */
export function useProductReviews(productId: string, page = 1, pageSize = 10) {
  return useQuery<ReviewsResponse>({
    queryKey: ["reviews", productId, String(page)],
    queryFn: async () => {
      const result = await listReviewsByProductAction(
        productId,
        page,
        pageSize,
      );
      const ratingDistribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      let ratingSum = 0;
      for (const r of result.items) {
        const rating = r.rating ?? 0;
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating] = (ratingDistribution[rating] ?? 0) + 1;
          ratingSum += rating;
        }
      }
      const averageRating =
        result.items.length > 0 ? ratingSum / result.items.length : 0;
      return {
        data: result.items,
        meta: {
          total: result.total,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
          averageRating,
          ratingDistribution,
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
