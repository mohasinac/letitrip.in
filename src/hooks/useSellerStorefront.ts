"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type {
  PublicUserProfile,
  SellerReviewsData,
  ProductsApiResponse,
} from "./usePublicProfile";

export { SellerReviewsData, ProductsApiResponse };

/**
 * useSellerStorefront
 *
 * Fetches a seller's public storefront data: profile, products, and reviews.
 * Only activates product/review queries when the profile confirms a seller role.
 *
 * @param initialSeller - Optional pre-fetched seller from the server (SSR). When
 *   provided, the profile query is seeded immediately so no loading flash occurs.
 */
export function useSellerStorefront(
  sellerId: string,
  options?: { initialSeller?: PublicUserProfile },
) {
  const initialProfileData: { user: PublicUserProfile } | undefined =
    options?.initialSeller ? { user: options.initialSeller } : undefined;

  const {
    data: sellerData,
    isLoading: loading,
    error: fetchError,
  } = useQuery<{ user: PublicUserProfile }>({
    queryKey: ["seller-profile", sellerId],
    queryFn: async () => {
      const user = await apiClient.get<PublicUserProfile>(
        `/api/profile/${sellerId}`,
      );
      return { user };
    },
    enabled: !!sellerId,
    initialData: initialProfileData,
  });

  const seller = sellerData?.user;
  const fetchErrorMsg: string | null = (fetchError as Error)?.message ?? null;
  const notSellerError =
    seller && seller.role !== "seller" && seller.role !== "admin"
      ? "notFound"
      : null;
  const profileError = fetchErrorMsg ?? notSellerError;

  const isReady = !!seller && !profileError && !!sellerId;

  const { data: productsData, isLoading: productsLoading } =
    useQuery<ProductsApiResponse>({
      queryKey: ["storefront-products", sellerId],
      queryFn: async () => {
        const result = await apiClient.get<{
          items: import("@mohasinac/appkit/features/products").ProductItem[];
          total: number;
          page: number;
          pageSize: number;
        }>(
          `/api/products?filters=sellerId%3D%3D${sellerId}%2Cstatus%3D%3Dpublished`,
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
      enabled: isReady,
      staleTime: 60000,
    });

  const { data: reviewsData, isLoading: reviewsLoading } =
    useQuery<SellerReviewsData>({
      queryKey: ["storefront-reviews", sellerId],
      queryFn: () =>
        apiClient.get<SellerReviewsData>(`/api/profile/${sellerId}/reviews`),
      enabled: isReady,
      staleTime: 60000,
    });

  return {
    seller,
    loading,
    profileError,
    productsData,
    productsLoading,
    reviewsData,
    reviewsLoading,
  };
}

