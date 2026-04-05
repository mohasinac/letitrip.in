"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type { ReviewCardData } from "@/components";

/**
 * useHomepageReviews
 * Fetches latest approved customer reviews for the homepage testimonials section.
 */
export function useHomepageReviews(options?: {
  initialData?: ReviewCardData[];
}) {
  return useQuery<ReviewCardData[]>({
    queryKey: ["reviews", "latest"],
    queryFn: () =>
      apiClient.get<ReviewCardData[]>("/api/reviews?featured=true"),
    staleTime: 10 * 60 * 1000, // 10 minutes
    initialData: options?.initialData,
  });
}
