"use client";

import { useApiQuery } from "./useApiQuery";
import { profileService } from "@/services";
import type { UserDocument, ProductDocument } from "@/db/schema";
import type {
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
  options?: { initialSeller?: UserDocument },
) {
  const initialProfileData: { user: UserDocument } | undefined =
    options?.initialSeller ? { user: options.initialSeller } : undefined;

  const {
    data: sellerData,
    isLoading: loading,
    error: fetchError,
  } = useApiQuery<{ user: UserDocument }>({
    queryKey: ["seller-profile", sellerId],
    queryFn: () =>
      profileService.getById(sellerId) as Promise<{ user: UserDocument }>,
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
    useApiQuery<ProductsApiResponse>({
      queryKey: ["storefront-products", sellerId],
      queryFn: () =>
        profileService.getSellerProducts(
          sellerId,
        ) as Promise<ProductsApiResponse>,
      enabled: isReady,
      cacheTTL: 60000,
    });

  const { data: reviewsData, isLoading: reviewsLoading } =
    useApiQuery<SellerReviewsData>({
      queryKey: ["storefront-reviews", sellerId],
      queryFn: () =>
        profileService.getSellerReviews(sellerId) as Promise<SellerReviewsData>,
      enabled: isReady,
      cacheTTL: 60000,
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
