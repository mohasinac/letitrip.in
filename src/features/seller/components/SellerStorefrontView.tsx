"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  Badge,
  Text,
  AvatarDisplay,
  EmptyState,
  Heading,
  MediaImage,
  TextLink,
} from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatMonthYear, formatCurrency, formatNumber } from "@/utils";
import type { PublicUserProfile } from "@/hooks";
import type { ProductItem } from "@mohasinac/feat-products";
import type { ImageCropData } from "@/components";
import type { SellerReviewsData, ProductsApiResponse } from "@/hooks";

const { flex, page } = THEME_CONSTANTS;

interface SellerStorefrontViewProps {
  seller: PublicUserProfile;
  sellerId: string;
  productsData?: ProductsApiResponse;
  productsLoading: boolean;
  reviewsData?: SellerReviewsData;
  reviewsLoading: boolean;
}

function StarIcons({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`${cls} ${i < Math.round(rating) ? THEME_CONSTANTS.rating.filled : THEME_CONSTANTS.rating.empty}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </>
  );
}

export function SellerStorefrontView({
  seller,
  sellerId,
  productsData,
  productsLoading,
  reviewsData,
  reviewsLoading,
}: SellerStorefrontViewProps) {
  const tSf = useTranslations("sellerStorefront");

  const sellerName =
    seller.displayName || seller.email?.split("@")[0] || "Seller";
  const memberSince = formatMonthYear(seller.createdAt ?? new Date());

  const avatarCropData: ImageCropData | null =
    seller.avatarMetadata ||
    (seller.photoURL
      ? { url: seller.photoURL, position: { x: 50, y: 50 }, zoom: 1 }
      : null);

  const hasProducts = productsData?.data && productsData.data.length > 0;
  const hasReviews = reviewsData?.reviews && reviewsData.reviews.length > 0;

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary}`}>
      {/* Banner */}
      <div className={`${THEME_CONSTANTS.accentBanner.coverStrip} h-48`} />

      <div className={`${page.container.lg} -mt-24 pb-12`}>
        {/* Seller Header Card */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-shrink-0">
              <AvatarDisplay
                cropData={avatarCropData}
                size="2xl"
                className={`border-4 ${THEME_CONSTANTS.themed.border} shadow-lg`}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <Heading level={1}>{sellerName}</Heading>
                <Badge variant="success">Seller</Badge>
              </div>

              {seller.publicProfile?.bio && (
                <Text variant="secondary" className="mt-2 mb-3 max-w-xl">
                  {seller.publicProfile.bio}
                </Text>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Text variant="secondary">
                  {tSf("memberSince")} {memberSince}
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
                {reviewsData && reviewsData.totalReviews > 0 && (
                  <div className="flex items-center gap-1">
                    <svg
                      className={`w-4 h-4 ${THEME_CONSTANTS.rating.filled}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <Text className="text-sm font-semibold">
                      {formatNumber(reviewsData.averageRating, "en-US", {
                        decimals: 1,
                      })}
                    </Text>
                    <Text variant="secondary" className="text-xs">
                      ({reviewsData.totalReviews}{" "}
                      {tSf("totalReviews").toLowerCase()})
                    </Text>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <TextLink
                  href={ROUTES.PUBLIC.PROFILE(sellerId)}
                  className="text-sm text-primary-700 dark:text-primary-400 hover:underline"
                >
                  {tSf("visitProfile")} →
                </TextLink>
              </div>
            </div>

            {/* Stats mini-grid */}
            <div className="flex-shrink-0 flex gap-4 sm:flex-col sm:gap-2 text-center">
              {seller.stats && (
                <>
                  <div>
                    <div className="text-xl font-bold text-primary-700 dark:text-primary-400">
                      {productsData?.meta?.total ?? seller.stats.itemsSold ?? 0}
                    </div>
                    <Text variant="secondary" className="text-xs">
                      {tSf("totalProducts")}
                    </Text>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {seller.stats.itemsSold ?? 0}
                    </div>
                    <Text variant="secondary" className="text-xs">
                      {tSf("totalSales")}
                    </Text>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Products Section */}
        <Card className="mb-6">
          <Heading level={2} className="mb-4">
            {tSf("productsTitle")}
          </Heading>
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hasProducts ? (
            <div className={THEME_CONSTANTS.grid.productCards}>
              {productsData!.data.map((product: ProductItem) => (
                <TextLink
                  key={product.id}
                  href={`/products/${product.id}`}
                  className={`block rounded-xl overflow-hidden border ${THEME_CONSTANTS.themed.border} hover:shadow-md transition-shadow`}
                >
                  <div className="relative aspect-square bg-zinc-100 dark:bg-slate-800 overflow-hidden">
                    {product.mainImage ? (
                      <MediaImage
                        src={product.mainImage}
                        alt={product.title}
                        size="card"
                      />
                    ) : (
                      <div
                        className={`w-full h-full ${flex.center} text-zinc-400 text-4xl`}
                      >
                        🛍️
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <Text className="text-sm font-medium line-clamp-2 mb-1">
                      {product.title}
                    </Text>
                    <Text className="text-sm font-bold text-primary-700 dark:text-primary-400">
                      {product.isAuction
                        ? `From ${formatCurrency(product.startingBid ?? product.price)}`
                        : formatCurrency(product.price)}
                    </Text>
                    {product.isAuction && (
                      <Badge variant="warning" className="mt-1 text-xs">
                        {tSf("auctionBadge")}
                      </Badge>
                    )}
                  </div>
                </TextLink>
              ))}
            </div>
          ) : (
            <EmptyState
              title={tSf("noProducts")}
              description={tSf("noProductsDesc")}
            />
          )}
        </Card>

        {/* Reviews Section */}
        <Card className="mb-6">
          <div className={`${flex.between} mb-4`}>
            <Heading level={2}>{tSf("reviewsTitle")}</Heading>
            {reviewsData && reviewsData.totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  <StarIcons rating={reviewsData.averageRating} />
                </div>
                <Text className="text-sm font-semibold">
                  {formatNumber(reviewsData.averageRating, "en-US", {
                    decimals: 1,
                  })}
                </Text>
                <Text variant="secondary" className="text-xs">
                  ({reviewsData.totalReviews})
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
              {reviewsData!.reviews.map((review) => (
                <div
                  key={review.id}
                  className={`p-4 rounded-xl ${THEME_CONSTANTS.themed.bgSecondary}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 ${flex.center} text-primary-800 dark:text-primary-200 font-semibold text-sm flex-shrink-0`}
                    >
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Text className="text-sm font-semibold">
                          {review.userName}
                        </Text>
                        {review.verified && (
                          <Badge variant="success" className="text-xs">
                            {tSf("verifiedPurchase")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        <StarIcons rating={review.rating} size="sm" />
                      </div>
                      <Text variant="secondary" className="text-sm">
                        {review.comment}
                      </Text>
                      {review.productTitle && (
                        <Text variant="secondary" className="text-xs mt-2">
                          on{" "}
                          <TextLink
                            href={`/products/${review.productId}`}
                            className="text-primary-700 dark:text-primary-400 hover:underline"
                          >
                            {review.productTitle}
                          </TextLink>
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={tSf("noReviews")}
              description={tSf("noReviewsDesc")}
            />
          )}
        </Card>

        {/* Back link */}
        <div className="text-center">
          <TextLink
            href={ROUTES.PUBLIC.STORES}
            className="text-primary-700 dark:text-primary-400 hover:underline text-sm"
          >
            ← {tSf("back")}
          </TextLink>
        </div>
      </div>
    </div>
  );
}
