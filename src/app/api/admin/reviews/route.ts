import { NextRequest, NextResponse } from "next/server";
import { createAdminHandler } from "@/lib/auth/api-middleware";
import { db } from "@/lib/database/config";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

export const GET = createAdminHandler(async (request: NextRequest, user) => {
  try {

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, approved, rejected
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    // Fetch reviews from Firestore
    let reviewsQuery = query(
      collection(db, "reviews"),
      orderBy("createdAt", "desc")
    );

    if (status) {
      reviewsQuery = query(
        collection(db, "reviews"),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    }

    const reviewsSnapshot = await getDocs(reviewsQuery);
    const allReviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedReviews = allReviews.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedReviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(allReviews.length / limit),
        totalReviews: allReviews.length,
        hasMore: offset + limit < allReviews.length
      }
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
