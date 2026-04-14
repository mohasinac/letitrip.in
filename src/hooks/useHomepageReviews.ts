"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { Review } from "@mohasinac/appkit/features/reviews";

/**
 * useHomepageReviews
 * Fetches latest approved customer reviews for the homepage testimonials section.
 */
export function useHomepageReviews(options?: {
  initialData?: Review[];
}) {
  return useQuery<Review[]>({
    queryKey: ["reviews", "latest"],
    queryFn: () =>
      apiClient.get<Review[]>("/api/reviews?featured=true"),
    staleTime: 10 * 60 * 1000, // 10 minutes
    initialData: options?.initialData,
  });
}
