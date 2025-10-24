import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "rating";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Fetch sellers from Firestore database
    const db = getAdminDb();
    let query = db.collection("users").where("role", "==", "seller");

    // Apply category filter if specified
    if (category && category !== "All") {
      query = query.where("category", "==", category);
    }

    // Get all sellers matching filter
    const snapshot = await query.get();
    let sellers: any[] = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply search filter in memory (for text search across multiple fields)
    if (search) {
      const searchLower = search.toLowerCase();
      sellers = sellers.filter((seller: any) =>
        (seller.businessName || "").toLowerCase().includes(searchLower) ||
        (seller.description || "").toLowerCase().includes(searchLower) ||
        (seller.location || "").toLowerCase().includes(searchLower) ||
        (seller.category || "").toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (sort) {
      case "rating":
        sellers.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        break;
      case "sales":
        sellers.sort((a: any, b: any) => (b.totalSales || 0) - (a.totalSales || 0));
        break;
      case "products":
        sellers.sort((a: any, b: any) => (b.totalProducts || 0) - (a.totalProducts || 0));
        break;
      case "newest":
        sellers.sort((a: any, b: any) => {
          const dateA = new Date(b.joinedDate || 0).getTime();
          const dateB = new Date(a.joinedDate || 0).getTime();
          return dateA - dateB;
        });
        break;
      case "oldest":
        sellers.sort((a: any, b: any) => {
          const dateA = new Date(a.joinedDate || 0).getTime();
          const dateB = new Date(b.joinedDate || 0).getTime();
          return dateA - dateB;
        });
        break;
      default:
        break;
    }

    // Calculate pagination
    const total = sellers.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedSellers = sellers.slice(offset, offset + limit);

    // Get available categories from database
    const categorySnapshot = await db.collection("users")
      .where("role", "==", "seller")
      .select("category")
      .get();
    const categories = [...new Set(
      categorySnapshot.docs
        .map((doc: any) => doc.data().category)
        .filter(Boolean)
    )];

    return NextResponse.json({
      sellers: paginatedSellers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      categories,
      filters: {
        search,
        category,
        sort,
      },
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json(
      { error: "Failed to fetch sellers. Please try again." },
      { status: 500 }
    );
  }
}
