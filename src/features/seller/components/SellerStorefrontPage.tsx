"use client";

import { Text, Alert } from "@mohasinac/appkit/ui";
import { Card, TextLink } from "@/components";
import { SellerStorefrontView } from "./SellerStorefrontView";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useSellerStorefront } from "@/hooks";
import { useTranslations } from "next-intl";
import type { PublicUserProfile } from "@/hooks";

interface SellerStorefrontPageProps {
  sellerId: string;
  /** Pre-fetched seller document from the server (SSR). Prevents loading flash. */
  initialSeller?: PublicUserProfile;
}

/**
 * SellerStorefrontPage
 *
 * Client shell for the seller public storefront. The RSC page.tsx pre-fetches
 * the seller profile and passes it as `initialSeller` to skip the loading flash.
 * Products and reviews are always fetched client-side.
 */
export function SellerStorefrontPage({
  sellerId,
  initialSeller,
}: SellerStorefrontPageProps) {
  const tSf = useTranslations("sellerStorefront");
  const tActions = useTranslations("actions");

  const { flex } = THEME_CONSTANTS;

  const {
    seller,
    loading,
    profileError,
    productsData,
    productsLoading,
    reviewsData,
    reviewsLoading,
  } = useSellerStorefront(sellerId, { initialSeller });

  if (loading) {
    return (
      <div className={`min-h-screen ${flex.center}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <Text>{tSf("loading")}</Text>
        </div>
      </div>
    );
  }

  if (profileError || !seller) {
    return (
      <div className={`min-h-screen ${flex.center} p-4`}>
        <Card className="max-w-md w-full">
          <Alert variant="error">
            {profileError === "notFound"
              ? tSf("notFound")
              : (profileError ?? tSf("notFound"))}
          </Alert>
          <div className="mt-4 flex gap-4">
            <TextLink
              href={ROUTES.PUBLIC.SELLERS}
              className="text-primary-700 dark:text-primary-400 hover:underline text-sm"
            >
              {tSf("back")}
            </TextLink>
            <TextLink
              href={ROUTES.HOME}
              className="text-primary-700 dark:text-primary-400 hover:underline text-sm"
            >
              {tActions("goHome")}
            </TextLink>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <SellerStorefrontView
      seller={seller}
      sellerId={sellerId}
      productsData={productsData}
      productsLoading={productsLoading}
      reviewsData={reviewsData}
      reviewsLoading={reviewsLoading}
    />
  );
}
