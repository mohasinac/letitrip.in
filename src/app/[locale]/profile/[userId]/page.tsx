"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Alert, Text, PublicProfileView } from "@/components";
import { ERROR_MESSAGES, ROUTES } from "@/constants";
import { formatMonthYear } from "@/utils";
import { usePublicProfile } from "@/hooks";
import type { ImageCropData } from "@/components";
import { useTranslations } from "next-intl";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");
  const tProfile = useTranslations("profile");

  const {
    user,
    loading,
    profileError,
    isSeller,
    productsData,
    productsLoading,
    reviewsData,
    reviewsLoading,
  } = usePublicProfile(userId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <Text>{tLoading("default")}</Text>
        </div>
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <Alert variant="error">{profileError || tProfile("notFound")}</Alert>
          <div className="mt-4">
            <Link
              href={ROUTES.HOME}
              className="text-primary-600 hover:underline"
            >
              {tActions("goHome")}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const profileName = user.displayName || user.email?.split("@")[0] || "User";
  const memberSince = formatMonthYear(user.createdAt);
  const avatarCropData: ImageCropData | null =
    user.avatarMetadata ||
    (user.photoURL
      ? { url: user.photoURL, position: { x: 50, y: 50 }, zoom: 1 }
      : null);

  return (
    <PublicProfileView
      user={user}
      isSeller={isSeller}
      profileName={profileName}
      memberSince={memberSince}
      avatarCropData={avatarCropData}
      productsData={productsData}
      productsLoading={productsLoading}
      reviewsData={reviewsData}
      reviewsLoading={reviewsLoading}
    />
  );
}
