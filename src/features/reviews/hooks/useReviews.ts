"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminReviewsAction } from "@/actions";
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
    queryFn: async () => {
      const sp = new URLSearchParams(queryParams);
      const result = await listAdminReviewsAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return result.items;
    },
    initialData: options?.initialData,
  });
}
