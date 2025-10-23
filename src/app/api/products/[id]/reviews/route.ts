import { NextRequest, NextResponse } from "next/server";
import { validateBody } from "@/lib/auth/middleware";
import { createReviewSchema } from "@/lib/validations/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sort") || "newest"; // newest, oldest, rating-high, rating-low, helpful
    const rating = searchParams.get("rating"); // Filter by specific rating
    const offset = (page - 1) * limit;

    // Mock product reviews - replace with database query
    let reviews = [
      {
        id: "review_1",
        productId,
        userId: "user_1",
        userName: "BeybladeExpert",
        userAvatar: "/images/user-1.jpg",
        rating: 5,
        title: "Amazing quality and authentic!",
        comment: "This Beyblade exceeded my expectations. The metal fusion technology is incredible and the performance is outstanding. Definitely worth the price!",
        images: ["/images/review-1-1.jpg", "/images/review-1-2.jpg"],
        verified: true,
        helpful: 12,
        createdAt: "2024-01-10T14:30:00Z",
        updatedAt: "2024-01-10T14:30:00Z"
      },
      {
        id: "review_2",
        productId,
        userId: "user_2",
        userName: "CollectorPro",
        userAvatar: "/images/user-2.jpg",
        rating: 4,
        title: "Great for collectors",
        comment: "Excellent condition and packaging. Fast shipping. Only minor issue was the launcher felt a bit loose, but overall satisfied with the purchase.",
        images: [],
        verified: true,
        helpful: 8,
        createdAt: "2024-01-08T09:15:00Z",
        updatedAt: "2024-01-08T09:15:00Z"
      },
      {
        id: "review_3",
        productId,
        userId: "user_3",
        userName: "MetalFusionFan",
        userAvatar: "/images/user-3.jpg",
        rating: 5,
        title: "Perfect!",
        comment: "Exactly as described. Authentic Takara Tomy product. My son loves it and it performs amazingly in battles.",
        images: ["/images/review-3-1.jpg"],
        verified: true,
        helpful: 15,
        createdAt: "2024-01-05T16:45:00Z",
        updatedAt: "2024-01-05T16:45:00Z"
      },
      {
        id: "review_4",
        productId,
        userId: "user_4",
        userName: "ToyCollector",
        userAvatar: "/images/user-4.jpg",
        rating: 3,
        title: "Good but overpriced",
        comment: "The product is good quality but I think it's a bit overpriced for what you get. Still works well though.",
        images: [],
        verified: false,
        helpful: 3,
        createdAt: "2024-01-03T11:20:00Z",
        updatedAt: "2024-01-03T11:20:00Z"
      }
    ];

    // Filter by rating if specified
    if (rating) {
      const ratingFilter = parseInt(rating);
      reviews = reviews.filter(review => review.rating === ratingFilter);
    }

    // Sort reviews
    switch (sortBy) {
      case "oldest":
        reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "rating-high":
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-low":
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case "helpful":
        reviews.sort((a, b) => b.helpful - a.helpful);
        break;
      default: // newest
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const paginatedReviews = reviews.slice(offset, offset + limit);

    // Calculate review statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    return NextResponse.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasMore: offset + limit < totalReviews
        },
        statistics: {
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalReviews,
          ratingDistribution,
          verifiedReviews: reviews.filter(r => r.verified).length
        }
      }
    });

  } catch (error) {
    console.error("Get product reviews error:", error);
    return NextResponse.json(
      { error: "Failed to get product reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Note: In a real implementation, you'd check authentication here
    // For now, we'll create a mock review

    // Validate request body
    const validation = await validateBody(request, createReviewSchema);
    if (validation.error) {
      return validation.error;
    }

    const reviewData = validation.data;

    // Check if product exists - replace with database query
    const productExists = true; // Mock check

    if (!productExists) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create new review - replace with database insert
    const newReview = {
      id: `review_${Date.now()}`,
      productId,
      userId: "user_current", // Would come from auth
      userName: "Anonymous User", // Would come from user profile
      userAvatar: "/images/default-avatar.jpg",
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images || [],
      verified: false, // Would be true if user purchased the product
      helpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Review added successfully",
      data: newReview
    }, { status: 201 });

  } catch (error) {
    console.error("Add product review error:", error);
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    );
  }
}
