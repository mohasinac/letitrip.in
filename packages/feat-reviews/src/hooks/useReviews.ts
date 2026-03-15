"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type { Review, ReviewListResponse, ReviewListParams } from "../types";

interface UseReviewsOptions {
  initialData?: ReviewListResponse;
  enabled?: boolean;
}

export function useReviews(
  params: ReviewListParams = {},
  opts?: UseReviewsOptions,
) {
  const sp = new URLSearchParams();
  if (params.productId) sp.set("productId", params.productId);
  if (params.userId) sp.set("userId", params.userId);
  if (params.status) sp.set("status", params.status);
  if (params.rating) sp.set("rating", String(params.rating));
  if (params.featured !== undefined)
    sp.set("featured", String(params.featured));
  if (params.page) sp.set("page", String(params.page));
  if (params.perPage) sp.set("perPage", String(params.perPage));
  if (params.sort) sp.set("sort", params.sort);
  const qs = sp.toString();

  const query = useQuery<ReviewListResponse>({
    queryKey: ["reviews", qs],
    queryFn: () =>
      apiClient.get<ReviewListResponse>(`/api/reviews${qs ? `?${qs}` : ""}`),
    initialData: opts?.initialData,
    enabled: opts?.enabled,
  });

  return {
    reviews: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    averageRating: query.data?.averageRating,
    ratingBreakdown: query.data?.ratingBreakdown,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useProductReviews(productId: string, opts?: UseReviewsOptions) {
  return useReviews({ productId, status: "approved" }, opts);
}
