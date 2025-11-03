import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

// GET /api/admin/reviews - Get all reviews with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const productId = searchParams.get("productId");
    const rating = searchParams.get("rating");
    const search = searchParams.get("search");

    const db = getAdminDb();
    let query = db.collection("reviews");

    // Apply filters
    if (status && status !== "all") {
      query = query.where("status", "==", status) as any;
    }
    if (productId) {
      query = query.where("productId", "==", productId) as any;
    }
    if (rating) {
      query = query.where("rating", "==", parseInt(rating)) as any;
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();

    let reviews = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply search filter (client-side for flexible searching)
    if (search) {
      const searchLower = search.toLowerCase();
      reviews = reviews.filter(
        (review: any) =>
          review.userName?.toLowerCase().includes(searchLower) ||
          review.title?.toLowerCase().includes(searchLower) ||
          review.comment?.toLowerCase().includes(searchLower) ||
          review.productId?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reviews - Update review status
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, adminNote } = body;

    const db = getAdminDb();
    const reviewRef = db.collection("reviews").doc(reviewId);

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (adminNote) {
      updateData.adminNote = adminNote;
    }

    await reviewRef.update(updateData);

    // If approved, update product rating
    if (status === "approved") {
      const reviewDoc = await reviewRef.get();
      const reviewData = reviewDoc.data();

      if (reviewData?.productId) {
        await updateProductRating(reviewData.productId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews - Delete review
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const reviewRef = db.collection("reviews").doc(reviewId);

    // Get review data before deleting
    const reviewDoc = await reviewRef.get();
    const reviewData = reviewDoc.data();

    await reviewRef.delete();

    // Update product rating if review was approved
    if (reviewData?.status === "approved" && reviewData?.productId) {
      await updateProductRating(reviewData.productId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}

// Helper function to update product rating
async function updateProductRating(productId: string) {
  try {
    const db = getAdminDb();

    // Get all approved reviews for this product
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .get();

    const reviews = reviewsSnapshot.docs.map((doc: any) => doc.data());

    if (reviews.length === 0) {
      // No approved reviews, set rating to 0
      await db.collection("products").doc(productId).update({
        rating: 0,
        reviewCount: 0,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce(
      (sum: number, review: any) => sum + review.rating,
      0
    );
    const averageRating = totalRating / reviews.length;

    // Update product
    await db.collection("products").doc(productId).update({
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviews.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating product rating:", error);
    // Don't throw error - this is a background task
  }
}
