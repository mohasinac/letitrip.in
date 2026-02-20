"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  Badge,
  Alert,
  Text,
  AvatarDisplay,
  EmptyState,
} from "@/components";
import {
  THEME_CONSTANTS,
  UI_LABELS,
  ERROR_MESSAGES,
  API_ENDPOINTS,
  ROUTES,
} from "@/constants";
import { formatMonthYear, formatCurrency } from "@/utils";
import { useApiQuery } from "@/hooks";
import { logger } from "@/classes";
import type { UserDocument, ProductDocument } from "@/db/schema";
import type { ImageCropData } from "@/components";

interface SellerReviewsData {
  reviews: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
    productId: string;
    productTitle: string;
    productMainImage: string | null;
    verified: boolean;
  }>;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

interface ProductsApiResponse {
  data: ProductDocument[];
  meta: { total: number; page: number; pageSize: number };
}

export default function SellerStorefrontPage() {
  const params = useParams();
  const sellerId = params?.id as string;

  const [seller, setSeller] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seller profile
  useEffect(() => {
    if (!sellerId) return;

    const fetchSeller = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.PROFILE.GET_BY_ID(sellerId));

        if (!res.ok) {
          if (res.status === 404) {
            setError(UI_LABELS.SELLER_STOREFRONT.NOT_FOUND);
          } else if (res.status === 403) {
            setError(ERROR_MESSAGES.GENERIC.PROFILE_PRIVATE);
          } else {
            setError(ERROR_MESSAGES.GENERIC.INTERNAL_ERROR);
          }
          return;
        }

        const data = await res.json();
        const user = data.user as UserDocument;

        if (user.role !== "seller" && user.role !== "admin") {
          setError(UI_LABELS.SELLER_STOREFRONT.NOT_FOUND);
          return;
        }

        setSeller(user);
      } catch (err) {
        setError(ERROR_MESSAGES.GENERIC.INTERNAL_ERROR);
        logger.error("Error fetching seller profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [sellerId]);

  const isReady = !!seller && !!sellerId;

  // Fetch seller products
  const { data: productsData, isLoading: productsLoading } =
    useApiQuery<ProductsApiResponse>({
      queryKey: ["storefront-products", sellerId],
      queryFn: async () => {
        const res = await fetch(
          API_ENDPOINTS.PROFILE.GET_STOREFRONT_PRODUCTS(sellerId),
        );
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      },
      enabled: isReady,
      cacheTTL: 60000,
    });

  // Fetch seller reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useApiQuery<{
    data: SellerReviewsData;
  }>({
    queryKey: ["storefront-reviews", sellerId],
    queryFn: async () => {
      const res = await fetch(
        API_ENDPOINTS.PROFILE.GET_SELLER_REVIEWS(sellerId),
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: isReady,
    cacheTTL: 60000,
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <Text>{UI_LABELS.SELLER_STOREFRONT.LOADING}</Text>
        </div>
      </div>
    );
  }

  // Error / not found state
  if (error || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <Alert variant="error">
            {error || UI_LABELS.SELLER_STOREFRONT.NOT_FOUND}
          </Alert>
          <div className="mt-4 flex gap-4">
            <Link
              href={ROUTES.PUBLIC.SELLERS}
              className="text-primary-600 hover:underline text-sm"
            >
              {UI_LABELS.SELLER_STOREFRONT.BACK}
            </Link>
            <Link
              href={ROUTES.HOME}
              className="text-primary-600 hover:underline text-sm"
            >
              {UI_LABELS.ACTIONS.GO_HOME}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const sellerName =
    seller.displayName || seller.email?.split("@")[0] || "Seller";
  const memberSince = formatMonthYear(seller.createdAt);

  const avatarCropData: ImageCropData | null =
    seller.avatarMetadata ||
    (seller.photoURL
      ? {
          url: seller.photoURL,
          position: { x: 50, y: 50 },
          zoom: 1,
        }
      : null);

  const hasProducts = productsData?.data && productsData.data.length > 0;
  const hasReviews = reviewsData?.data && reviewsData.data.reviews.length > 0;

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary}`}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 h-48" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
        {/* Seller Header Card */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <AvatarDisplay
                cropData={avatarCropData}
                size="2xl"
                className={`border-4 ${THEME_CONSTANTS.themed.border} shadow-lg`}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className={`${THEME_CONSTANTS.typography.h3}`}>
                  {sellerName}
                </h1>
                <Badge variant="success">Seller</Badge>
              </div>

              {seller.publicProfile?.bio && (
                <Text variant="secondary" className="mt-2 mb-3 max-w-xl">
                  {seller.publicProfile.bio}
                </Text>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Text variant="secondary">
                  {UI_LABELS.SELLER_STOREFRONT.MEMBER_SINCE} {memberSince}
                </Text>
                {seller.publicProfile?.location && (
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <Text variant="secondary">
                      {seller.publicProfile.location}
                    </Text>
                  </div>
                )}
                {reviewsData?.data && reviewsData.data.totalReviews > 0 && (
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <Text className="text-sm font-semibold">
                      {reviewsData.data.averageRating.toFixed(1)}
                    </Text>
                    <Text variant="secondary" className="text-xs">
                      ({reviewsData.data.totalReviews}{" "}
                      {UI_LABELS.SELLER_STOREFRONT.TOTAL_REVIEWS.toLowerCase()})
                    </Text>
                  </div>
                )}
              </div>

              {/* Profile link */}
              <div className="mt-3">
                <Link
                  href={ROUTES.PUBLIC.PROFILE(sellerId)}
                  className="text-sm text-primary-600 hover:underline"
                >
                  {UI_LABELS.SELLER_STOREFRONT.VISIT_PROFILE} →
                </Link>
              </div>
            </div>

            {/* Stats mini-grid */}
            <div className="flex-shrink-0 flex gap-4 sm:flex-col sm:gap-2 text-center">
              {seller.stats && (
                <>
                  <div>
                    <div className="text-xl font-bold text-primary-600">
                      {productsData?.meta?.total ?? seller.stats.itemsSold ?? 0}
                    </div>
                    <Text variant="secondary" className="text-xs">
                      {UI_LABELS.SELLER_STOREFRONT.TOTAL_PRODUCTS}
                    </Text>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-success-600">
                      {seller.stats.itemsSold ?? 0}
                    </div>
                    <Text variant="secondary" className="text-xs">
                      {UI_LABELS.SELLER_STOREFRONT.TOTAL_SALES}
                    </Text>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Products Section */}
        <Card className="mb-6">
          <h2 className={`${THEME_CONSTANTS.typography.h4} mb-4`}>
            {UI_LABELS.SELLER_STOREFRONT.PRODUCTS_TITLE}
          </h2>
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hasProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {productsData!.data.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className={`block rounded-xl overflow-hidden border ${THEME_CONSTANTS.themed.border} hover:shadow-md transition-shadow`}
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {product.mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.mainImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        🛍️
                      </div>
                    )}
                  </div>
                  <div className={THEME_CONSTANTS.spacing.padding.xs}>
                    <Text className="text-sm font-medium line-clamp-2 mb-1">
                      {product.title}
                    </Text>
                    <Text className="text-sm font-bold text-primary-600">
                      {product.isAuction
                        ? `From ${formatCurrency(product.startingBid ?? product.price)}`
                        : formatCurrency(product.price)}
                    </Text>
                    {product.isAuction && (
                      <Badge variant="warning" className="mt-1 text-xs">
                        {UI_LABELS.SELLER_STOREFRONT.AUCTION_BADGE}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title={UI_LABELS.SELLER_STOREFRONT.NO_PRODUCTS}
              description={UI_LABELS.SELLER_STOREFRONT.NO_PRODUCTS_DESC}
            />
          )}
        </Card>

        {/* Reviews Section */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={THEME_CONSTANTS.typography.h4}>
              {UI_LABELS.SELLER_STOREFRONT.REVIEWS_TITLE}
            </h2>
            {reviewsData?.data && reviewsData.data.totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(reviewsData.data.averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <Text className="text-sm font-semibold">
                  {reviewsData.data.averageRating.toFixed(1)}
                </Text>
                <Text variant="secondary" className="text-xs">
                  ({reviewsData.data.totalReviews})
                </Text>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hasReviews ? (
            <div className={THEME_CONSTANTS.spacing.stack}>
              {reviewsData!.data.reviews.map((review) => (
                <div
                  key={review.id}
                  className={`p-4 rounded-xl ${THEME_CONSTANTS.themed.bgSecondary}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 font-semibold text-sm flex-shrink-0">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Text className="text-sm font-semibold">
                          {review.userName}
                        </Text>
                        {review.verified && (
                          <Badge variant="success" className="text-xs">
                            {UI_LABELS.SELLER_STOREFRONT.VERIFIED_PURCHASE}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <Text variant="secondary" className="text-sm">
                        {review.comment}
                      </Text>
                      {review.productTitle && (
                        <Text variant="secondary" className="text-xs mt-2">
                          on{" "}
                          <Link
                            href={`/products/${review.productId}`}
                            className="text-primary-600 hover:underline"
                          >
                            {review.productTitle}
                          </Link>
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={UI_LABELS.SELLER_STOREFRONT.NO_REVIEWS}
              description={UI_LABELS.SELLER_STOREFRONT.NO_REVIEWS_DESC}
            />
          )}
        </Card>

        {/* Back link */}
        <div className="text-center">
          <Link
            href={ROUTES.PUBLIC.SELLERS}
            className="text-primary-600 hover:underline text-sm"
          >
            ← {UI_LABELS.SELLER_STOREFRONT.BACK}
          </Link>
        </div>
      </div>
    </div>
  );
}
