"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { hasRole } from "@/helpers";
import type { UserDocument, ProductDocument } from "@/db/schema";

export interface SellerReviewItem {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  productId: string;
  productTitle: string;
  productMainImage: string | null;
  verified: boolean;
}

export interface SellerReviewsData {
  reviews: SellerReviewItem[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface ProductsApiResponse {
  data: ProductDocument[];
  meta: { total: number; page: number; pageSize: number };
}

/**
 * usePublicProfile
 *
 * Fetches a user's public profile, and (if seller) their products and reviews.
 * Wraps `profileService` calls via `useApiQuery` — no direct apiClient usage.
 */
export function usePublicProfile(userId: string) {
  const {
    data: profileData,
    isLoading: loading,
    error: fetchError,
  } = useQuery<{ user: UserDocument }>({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      const user = await apiClient.get<UserDocument>(`/api/profile/${userId}`);
      return { user };
    },
    enabled: !!userId,
  });

  const user = profileData?.user;
  const profileError: string | null = (fetchError as Error)?.message ?? null;
  const isSeller = hasRole(user?.role ?? "user", "seller");

  const { data: productsData, isLoading: productsLoading } =
    useQuery<ProductsApiResponse>({
      queryKey: ["profile-products", userId],
      queryFn: async () => {
        const result = await apiClient.get<{
          items: ProductDocument[];
          total: number;
          page: number;
          pageSize: number;
        }>(
          `/api/products?filters=sellerId%3D%3D${userId}%2Cstatus%3D%3Dpublished`,
        );
        return {
          data: result.items,
          meta: {
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
          },
        } as ProductsApiResponse;
      },
      enabled: !!userId && isSeller,
      staleTime: 60000,
    });

  const { data: reviewsData, isLoading: reviewsLoading } =
    useQuery<SellerReviewsData>({
      queryKey: ["profile-reviews", userId],
      queryFn: () =>
        apiClient.get<SellerReviewsData>(`/api/profile/${userId}/reviews`),
      enabled: !!userId && isSeller,
      staleTime: 60000,
    });

  return {
    user,
    loading,
    profileError,
    isSeller,
    productsData,
    productsLoading,
    reviewsData,
    reviewsLoading,
  };
}
