/**
 * Public Profile Page
 *
 * Route: /profile/[userId]
 * SSR: fetches the user profile, and (if seller) their products and reviews,
 * server-side so the page ships with full HTML for SEO and zero CLS.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  userRepository,
  productRepository,
  reviewRepository,
} from "@/repositories";
import { hasRole } from "@/helpers";
import { formatMonthYear } from "@/utils";
import { SITE_CONFIG } from "@/constants";
import { PublicProfileView } from "@/features/user";
import type { UserDocument, ProductDocument } from "@/db/schema";
import type { ImageCropData } from "@/components";
import type {
  SellerReviewsData,
  SellerReviewItem,
  ProductsApiResponse,
} from "@/hooks/usePublicProfile";

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
        data: productsResult.items as ProductDocument[],
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
      user={userData as UserDocument}
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

async function buildSellerReviews(userId: string): Promise<SellerReviewsData> {
  const sellerProducts = await productRepository
    .findBySeller(userId)
    .catch(() => [] as ProductDocument[]);
  const publishedProducts = sellerProducts.filter(
    (p) => p.status === "published",
  );

  if (publishedProducts.length === 0) {
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const productSlice = publishedProducts.slice(0, 20);
  const reviewArrays = await Promise.all(
    productSlice.map((p) =>
      reviewRepository.findApprovedByProduct(p.id).catch(() => []),
    ),
  );

  const productMap = new Map(publishedProducts.map((p) => [p.id, p]));
  const allReviewsFlat = reviewArrays.flat();
  const recentReviews = [...allReviewsFlat]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  const totalReviews = allReviewsFlat.length;
  const ratingDistribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let ratingSum = 0;
  for (const review of allReviewsFlat) {
    ratingSum += review.rating;
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating]++;
    }
  }
  const averageRating =
    totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0;

  const reviews: SellerReviewItem[] = recentReviews.map((review) => ({
    id: review.id,
    userName: review.userName,
    rating: review.rating,
    comment: review.comment,
    createdAt:
      review.createdAt instanceof Date
        ? review.createdAt
        : new Date(review.createdAt as string),
    productId: review.productId,
    productTitle:
      productMap.get(review.productId)?.title ?? review.productTitle,
    productMainImage: productMap.get(review.productId)?.mainImage ?? null,
    verified: review.verified,
  }));

  return { reviews, averageRating, totalReviews, ratingDistribution };
}
