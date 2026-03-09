"use client";

import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { reviewService } from "@/services";

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
  return useApiQuery<ReviewsResponse>({
    queryKey: ["reviews", productId, String(page)],
    queryFn: () => reviewService.listByProduct(productId, page, pageSize),
    enabled: Boolean(productId),
  });
}

interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  comment: string;
}

export function useCreateReview(
  onSuccess?: () => void,
  onError?: (err: { status?: number; message?: string }) => void,
) {
  return useApiMutation<unknown, CreateReviewInput>({
    mutationFn: (data) => reviewService.create(data),
    onSuccess,
    onError,
  });
}
