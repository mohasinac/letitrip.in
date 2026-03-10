"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/services";
import type { ReviewDocument } from "@/db/schema";

export interface ReviewsApiResponse {
  data: ReviewDocument[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * useReviews
 * Wraps `reviewService.list(queryParams)` for the reviews listing page.
 * `queryParams` is a pre-built URLSearchParams query string from the component.
 */
export function useReviews(queryParams: string) {
  return useQuery<ReviewsApiResponse>({
    queryKey: ["reviews", "all", queryParams],
    queryFn: () => reviewService.list(queryParams),
  });
}
