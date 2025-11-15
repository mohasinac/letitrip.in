import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { withCache } from "@/app/api/middleware/cache";

// GET /api/reviews/summary - Get review statistics for a product
export async function GET(request: NextRequest) {
  return withCache(
    request,
    async (req) => {
      try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
          return NextResponse.json(
            { success: false, error: "Product ID is required" },
            { status: 400 }
          );
        }

        // Get all reviews for the product
        const reviewsSnapshot = await Collections.reviews()
          .where("product_id", "==", productId)
          .where("is_approved", "==", true)
          .get();

        const reviews = reviewsSnapshot.docs.map((doc) => doc.data());

        // Calculate statistics
        const totalReviews = reviews.length;
        let totalRating = 0;
        const ratingCounts: { [key: number]: number } = {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };

        reviews.forEach((review: any) => {
          const rating = review.rating || 0;
          totalRating += rating;
          if (rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
          }
        });

        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        // Create rating distribution array
        const ratingDistribution = [
          { rating: 5, count: ratingCounts[5] },
          { rating: 4, count: ratingCounts[4] },
          { rating: 3, count: ratingCounts[3] },
          { rating: 2, count: ratingCounts[2] },
          { rating: 1, count: ratingCounts[1] },
        ];

        return NextResponse.json({
          success: true,
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(2)),
          ratingDistribution,
        });
      } catch (error) {
        console.error("Error fetching review summary:", error);
        return NextResponse.json(
          { success: false, error: "Failed to fetch review summary" },
          { status: 500 }
        );
      }
    },
    {
      ttl: 300, // 5 minutes
      key: `reviews:summary:${new URL(request.url).searchParams.get(
        "productId"
      )}`,
    }
  );
}
