"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/services";
import type { ReviewDocument } from "@/db/schema";

/**
 * useHomepageReviews
 * Fetches latest approved customer reviews for the homepage testimonials section.
 */
export function useHomepageReviews(options?: {
  initialData?: ReviewDocument[];
}) {
  return useQuery<ReviewDocument[]>({
    queryKey: ["reviews", "latest"],
    queryFn: () => reviewService.getHomepageReviews(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    initialData: options?.initialData,
  });
}
