import { NextResponse } from "next/server";
import {
  productRepository,
  reviewRepository,
  storeRepository,
} from "@/repositories";

export async function GET(
  _request: Request,
  context: { params: Promise<{ storeSlug: string }> },
): Promise<NextResponse> {
  try {
    const { storeSlug } = await context.params;
    const store = await storeRepository.findBySlug(storeSlug);

    if (!store || store.status !== "active" || !store.isPublic) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 },
      );
    }

    const productsResult = await productRepository.list(
      {
        filters: "status==published",
        sorts: "-itemsSold",
        page: 1,
        pageSize: 20,
      },
      { sellerId: store.ownerId },
    );

    const products = productsResult.items;
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const reviewPages = await Promise.all(
      products.map((product) =>
        reviewRepository.listForProduct(product.id, {
          filters: "status==approved",
          sorts: "-createdAt",
          page: 1,
          pageSize: 50,
        }),
      ),
    );

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    let totalReviews = 0;
    let ratingSum = 0;

    for (const reviewPage of reviewPages) {
      for (const review of reviewPage.items) {
        totalReviews += 1;
        ratingSum += review.rating;
        ratingDistribution[review.rating] =
          (ratingDistribution[review.rating] ?? 0) + 1;
      }
    }

    const reviews = reviewPages
      .flatMap((reviewPage) => reviewPage.items)
      .sort(
        (left, right) =>
          new Date(right.createdAt ?? 0).getTime() -
          new Date(left.createdAt ?? 0).getTime(),
      )
      .slice(0, 10)
      .map((review) => ({
        ...review,
        productTitle:
          productMap.get(review.productId)?.title ?? review.productTitle,
        productMainImage: productMap.get(review.productId)?.mainImage ?? null,
      }));

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        averageRating:
          totalReviews > 0
            ? Math.round((ratingSum / totalReviews) * 10) / 10
            : 0,
        totalReviews,
        ratingDistribution,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch store reviews" },
      { status: 500 },
    );
  }
}
