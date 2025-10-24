import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
}
