import { NextResponse } from "next/server";
import { reviewRepository, createReview, successResponse, errorResponse } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import { createRouteHandler } from "@mohasinac/appkit";

function param(url: URL, key: string): string | null {
  return url.searchParams.get(key);
}

function numParam(url: URL, key: string, fallback: number): number {
  const value = url.searchParams.get(key);
  const parsed = value !== null ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function computeAggregates(ratings: number[]): {
  averageRating: number;
  ratingDistribution: Record<number, number>;
} {
  const ratingDistribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const rating of ratings) {
    ratingDistribution[rating] = (ratingDistribution[rating] ?? 0) + 1;
  }

  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return {
    averageRating: ratings.length > 0 ? sum / ratings.length : 0,
    ratingDistribution,
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const featured = param(url, "featured") === "true";
    const latest = param(url, "latest") === "true";
    const page = numParam(url, "page", 1);
    const pageSize = numParam(url, "pageSize", latest ? 24 : 10);
    const sorts = param(url, "sorts") ?? param(url, "sort") ?? "-createdAt";

    if (featured) {
      const featuredReviews = await reviewRepository.findFeatured(
        Math.min(pageSize, 50),
      );
      const response = NextResponse.json({
        success: true,
        data: featuredReviews,
      });
      response.headers.set(
        "Cache-Control",
        "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
      );
      return response;
    }

    if (latest) {
      const result = await reviewRepository.listAll({
        filters: "status==approved",
        sorts,
        page,
        pageSize,
      });
      const response = NextResponse.json({
        success: true,
        data: {
          items: result.items,
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      });
      response.headers.set(
        "Cache-Control",
        "public, max-age=120, s-maxage=300, stale-while-revalidate=60",
      );
      return response;
    }

    const productId = param(url, "productId");
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId query parameter is required" },
        { status: 400 },
      );
    }

    const allApprovedReviews =
      await reviewRepository.findApprovedByProduct(productId);
    const aggregates = computeAggregates(
      allApprovedReviews.map((review) => review.rating),
    );
    const result = await reviewRepository.listForProduct(productId, {
      filters: "status==approved",
      sorts,
      page,
      pageSize,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
        averageRating: aggregates.averageRating,
        ratingDistribution: aggregates.ratingDistribution,
      },
    });
    response.headers.set(
      "Cache-Control",
      "public, max-age=120, s-maxage=300, stale-while-revalidate=60",
    );
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const body = await request.json().catch(() => ({}));
      const result = await createReview({ ...body, userId: user!.uid });
      return successResponse(result, "Review submitted", 201);
    },
  }),
);

