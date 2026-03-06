"use client";

import { useParams } from "next/navigation";
import { Card, Alert, Text, TextLink } from "@/components";
import { SellerStorefrontView } from "@/features/seller";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useSellerStorefront } from "@/hooks";
import { useTranslations } from "next-intl";

export default function SellerStorefrontPage() {
  const params = useParams();
  const sellerId = params?.id as string;
  const tSf = useTranslations("sellerStorefront");
  const tActions = useTranslations("actions");

  const {
    seller,
    loading,
    profileError,
    productsData,
    productsLoading,
    reviewsData,
    reviewsLoading,
  } = useSellerStorefront(sellerId);

  const { flex } = THEME_CONSTANTS;

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
              className="text-primary-600 hover:underline text-sm"
            >
              {tSf("back")}
            </TextLink>
            <TextLink
              href={ROUTES.HOME}
              className="text-primary-600 hover:underline text-sm"
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
