"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
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
    queryFn: () =>
      apiClient.get<ReviewDocument[]>("/api/reviews?featured=true"),
    staleTime: 10 * 60 * 1000, // 10 minutes
    initialData: options?.initialData,
  });
}
