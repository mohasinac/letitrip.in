import { productRepository, reviewRepository } from "@/repositories";
import { maskName } from "@mohasinac/appkit/security";
import type { ProductDocument } from "@/db/schema";
import type { SellerReviewsData, SellerReviewItem } from "@/hooks";

export async function buildSellerReviews(
  userId: string,
): Promise<SellerReviewsData> {
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
    userName: maskName(review.userName),
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

