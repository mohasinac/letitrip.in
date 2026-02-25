"use client";

import { useApiQuery } from "./useApiQuery";
import { profileService } from "@/services";
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
  } = useApiQuery<{ user: UserDocument }>({
    queryKey: ["public-profile", userId],
    queryFn: () =>
      profileService.getById(userId) as Promise<{ user: UserDocument }>,
    enabled: !!userId,
  });

  const user = profileData?.user;
  const profileError: string | null = (fetchError as Error)?.message ?? null;
  const isSeller = hasRole(user?.role ?? "user", "seller");

  const { data: productsData, isLoading: productsLoading } =
    useApiQuery<ProductsApiResponse>({
      queryKey: ["profile-products", userId],
      queryFn: () =>
        profileService.getSellerProducts(
          userId,
        ) as Promise<ProductsApiResponse>,
      enabled: !!userId && isSeller,
      cacheTTL: 60000,
    });

  const { data: reviewsData, isLoading: reviewsLoading } =
    useApiQuery<SellerReviewsData>({
      queryKey: ["profile-reviews", userId],
      queryFn: () =>
        profileService.getSellerReviews(userId) as Promise<SellerReviewsData>,
      enabled: !!userId && isSeller,
      cacheTTL: 60000,
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
