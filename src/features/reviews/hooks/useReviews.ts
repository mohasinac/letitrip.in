"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { ReviewDocument } from "@/db/schema";

/**
 * For ?latest=true / ?productId=... the API wraps results in a ReviewListResponse
 * object: { items, total, page, ... }. apiClient unwraps the outer `data` envelope,
 * so the resolved value is ReviewListResponse — not a flat array.
 */
interface ReviewListResponse {
  items: ReviewDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  averageRating?: number;
  ratingDistribution?: Record<number, number>;
}

export type ReviewsApiResult = ReviewDocument[];

/**
 * useReviews
 * Fetches reviews via GET /api/reviews for the reviews listing page.
 * `queryParams` is a pre-built URLSearchParams query string from the component.
 *
 * Accepts optional `initialData` for SSR hydration.
 */
export function useReviews(
  queryParams: string,
  options?: { initialData?: ReviewsApiResult },
) {
  return useQuery<ReviewsApiResult>({
    queryKey: ["reviews", "all", queryParams],
    queryFn: async () => {
      const result = await apiClient.get<ReviewListResponse | ReviewDocument[]>(
        `/api/reviews${queryParams ? `?${queryParams}` : ""}`,
      );
      // ?latest=true / ?productId=... return a ReviewListResponse object;
      // ?featured=true returns a flat array.
      if (
        result &&
        !Array.isArray(result) &&
        Array.isArray((result as ReviewListResponse).items)
      ) {
        return (result as ReviewListResponse).items;
      }
      return (result as ReviewDocument[]) ?? [];
    },
    initialData: options?.initialData,
  });
}
