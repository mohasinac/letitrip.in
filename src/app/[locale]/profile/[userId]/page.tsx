/**
 * Public Profile Page
 *
 * Route: /profile/[userId]
 * SSR: fetches the user profile, and (if seller) their products and reviews,
 * server-side so the page ships with full HTML for SEO and zero CLS.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { userRepository, productRepository } from "@/repositories";
import { hasRole } from "@/helpers";
import { formatMonthYear } from "@/utils";
import { SITE_CONFIG } from "@/constants";
import { PublicProfileView } from "@/features/user";
import { buildSellerReviews } from "@/features/user/server";
import type { UserDocument, ProductDocument } from "@/db/schema";
import type { ImageCropData } from "@/components";
import type { SellerReviewsData, ProductsApiResponse } from "@/hooks";
import type { ProductItem } from "@mohasinac/appkit/features/products";

interface Props {
  params: Promise<{ userId: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const userData = await userRepository.findById(userId).catch(() => null);
  const displayName =
    userData?.displayName || userData?.email?.split("@")[0] || "User";
  const title = `${displayName}'s Profile`;
  const description = `View ${displayName}'s public profile on ${SITE_CONFIG.brand.name}.`;
  return {
    title: `${title} — ${SITE_CONFIG.brand.name}`,
    description,
    openGraph: { title, description },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { userId } = await params;

  const userData = await userRepository.findById(userId).catch(() => null);

  if (!userData || !userData.publicProfile?.isPublic) {
    notFound();
  }

  const isSeller = hasRole(userData.role ?? "user", "seller");
  const profileName =
    userData.displayName || userData.email?.split("@")[0] || "User";
  const memberSince = formatMonthYear(userData.createdAt);
  const avatarCropData: ImageCropData | null =
    userData.avatarMetadata ||
    (userData.photoURL
      ? { url: userData.photoURL, position: { x: 50, y: 50 }, zoom: 1 }
      : null);

  let productsData: ProductsApiResponse | undefined;
  let reviewsData: SellerReviewsData | undefined;

  if (isSeller) {
    const [productsResult, sellerReviews] = await Promise.all([
      productRepository
        .list(
          { sorts: "-createdAt", page: 1, pageSize: 12 },
          { sellerId: userId, status: "published" },
        )
        .catch(() => null),
      buildSellerReviews(userId),
    ]);

    if (productsResult) {
      productsData = {
        data: productsResult.items as unknown as ProductItem[],
        meta: {
          total: productsResult.total,
          page: productsResult.page,
          pageSize: productsResult.pageSize,
        },
      };
    }
    reviewsData = sellerReviews;
  }

  return (
    <PublicProfileView
      user={userData as unknown as import("@/hooks").PublicUserProfile}
      isSeller={isSeller}
      profileName={profileName}
      memberSince={memberSince}
      avatarCropData={avatarCropData}
      productsData={productsData}
      productsLoading={false}
      reviewsData={reviewsData}
      reviewsLoading={false}
    />
  );
}
