"use client";

import { useApiQuery } from "./useApiQuery";
import { reviewService } from "@/services";
import type { ReviewDocument } from "@/db/schema";

/**
 * useHomepageReviews
 * Fetches latest approved customer reviews for the homepage testimonials section.
 */
export function useHomepageReviews() {
  return useApiQuery<ReviewDocument[]>({
    queryKey: ["reviews", "latest"],
    queryFn: () => reviewService.getHomepageReviews(),
    cacheTTL: 10 * 60 * 1000, // 10 minutes
  });
}
