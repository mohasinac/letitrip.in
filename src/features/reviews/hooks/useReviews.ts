"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/services";
import type { ReviewDocument } from "@/db/schema";

/**
 * The /api/reviews?latest=true endpoint returns successResponse(sieveResult.items, ...).
 * apiClient unwraps the `data` field, so the resolved value is ReviewDocument[].
 */
export type ReviewsApiResult = ReviewDocument[];

/**
 * useReviews
 * Wraps `reviewService.list(queryParams)` for the reviews listing page.
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
    queryFn: () => reviewService.list(queryParams),
    initialData: options?.initialData,
  });
}
