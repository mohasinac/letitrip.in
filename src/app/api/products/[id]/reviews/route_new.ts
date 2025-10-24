import { NextRequest, NextResponse } from "next/server";
import { validateBody } from "@/lib/auth/middleware";
import { createReviewSchema } from "@/lib/validations/schemas";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, orderBy, where, addDoc, doc, getDoc } from "firebase/firestore";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sort") || "newest"; // newest, oldest, rating-high, rating-low, helpful
    const rating = searchParams.get("rating"); // Filter by specific rating
    const offset = (page - 1) * limit;

    // Fetch product reviews from Firestore
    let reviewsQuery = query(
      collection(db, "reviews"),
      where("productId", "==", productId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );

    const reviewsSnapshot = await getDocs(reviewsQuery);
    let reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
    })) as any[];

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
        reviews.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate request body
    const validation = await validateBody(request, createReviewSchema);
    if (validation.error) {
      return validation.error;
    }

    const reviewData = validation.data;

    // Check if product exists
    const productDoc = await getDoc(doc(db, "products", productId));
    if (!productDoc.exists()) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create new review in Firestore
    const newReview = {
      productId,
      userId: user.userId,
      userName: (user as any).name || "Anonymous User",
      userAvatar: (user as any).avatar || "/images/default-avatar.jpg",
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images || [],
      verified: false, // Would be true if user purchased the product
      helpful: 0,
      status: "pending", // Reviews need admin approval
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, "reviews"), newReview);

    return NextResponse.json({
      success: true,
      message: "Review submitted for approval",
      data: {
        id: docRef.id,
        ...newReview
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Add product review error:", error);
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    );
  }
}
