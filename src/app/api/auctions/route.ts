import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";

/**
 * GET /api/auctions
 * List auctions with role-based filtering
 * - Public: Active auctions only
 * - Seller: Own auctions (all statuses)
 * - Admin: All auctions
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const role = user?.role || "guest";
    const { searchParams } = new URL(request.url);
    
    // Pagination params
    const startAfter = searchParams.get("startAfter");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    
    // Filter params
    const shopId = searchParams.get("shop_id");
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const minBid = searchParams.get("minBid");
    const maxBid = searchParams.get("maxBid");
    const featured = searchParams.get("featured");
    
    // Sort params
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    // Build base query with role-based filtering
    let query: FirebaseFirestore.Query = Collections.auctions();
    
    // Role-based access control
    if (role === "guest" || role === "user") {
      query = query.where("status", "==", "active");
    } else if (role === "seller") {
      if (!shopId) {
        // Seller must provide shop_id
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          pagination: {
            limit,
            hasNextPage: false,
            nextCursor: null,
          },
        });
      }
      query = query.where("shop_id", "==", shopId);
    }
    // Admin sees all auctions (no additional filter)

    // Apply additional filters
    if (shopId && (role === "admin" || role === "user" || role === "guest")) {
      query = query.where("shop_id", "==", shopId);
    }
    
    if (status && role !== "guest" && role !== "user") {
      // Only admin/seller can filter by status other than active
      query = query.where("status", "==", status);
    }
    
    if (categoryId) {
      query = query.where("category_id", "==", categoryId);
    }
    
    if (featured === "true") {
      query = query.where("is_featured", "==", true);
    }
    
    // Price range filters (only if sorting by current_bid or no price sort)
    const validSortFields = ["created_at", "end_time", "current_bid", "bid_count"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    
    if (sortField === "current_bid") {
      if (minBid) {
        const minBidNum = parseFloat(minBid);
        if (!isNaN(minBidNum)) {
          query = query.where("current_bid", ">=", minBidNum);
        }
      }
      if (maxBid) {
        const maxBidNum = parseFloat(maxBid);
        if (!isNaN(maxBidNum)) {
          query = query.where("current_bid", "<=", maxBidNum);
        }
      }
    }

    // Add sorting
    query = query.orderBy(sortField, sortOrder);

    // Apply cursor pagination
    if (startAfter) {
      const startDoc = await Collections.auctions().doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    // Fetch limit + 1 to check if there's a next page
    query = query.limit(limit + 1);
    const snapshot = await query.get();
    const docs = snapshot.docs;

    // Check if there's a next page
    const hasNextPage = docs.length > limit;
    const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

    // Transform data
    const auctions = resultDocs.map((doc) => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    // Get next cursor
    const nextCursor = hasNextPage && resultDocs.length > 0
      ? resultDocs[resultDocs.length - 1].id
      : null;

    return NextResponse.json({
      success: true,
      data: auctions,
      count: auctions.length,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("Error listing auctions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list auctions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auctions
 * Create auction (seller/admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Only sellers and admins can create auctions",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { shop_id, name, slug, starting_bid, end_time } = body;
    if (!shop_id || !name || !slug || starting_bid == null || !end_time) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (role === "seller") {
      const ownsShop = await userOwnsShop(shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Cannot create auction for this shop" },
          { status: 403 }
        );
      }
      // Limit: 5 active auctions per shop
      const activeCount = await Collections.auctions()
        .where("shop_id", "==", shop_id)
        .where("status", "==", "active")
        .count()
        .get();
      if ((activeCount.data().count || 0) >= 5) {
        return NextResponse.json(
          {
            success: false,
            error: "Active auction limit reached for this shop",
          },
          { status: 400 }
        );
      }
    }

    // Slug uniqueness (may become slug-based detail later)
    const existingSlug = await Collections.auctions()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (!existingSlug.empty) {
      return NextResponse.json(
        { success: false, error: "Auction slug already exists" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const docRef = await Collections.auctions().add({
      shop_id,
      name,
      slug,
      description: body.description || "",
      starting_bid,
      current_bid: starting_bid,
      bid_count: 0,
      status: "active",
      start_time: body.start_time || now,
      end_time,
      created_at: now,
      updated_at: now,
    });
    const created = await docRef.get();
    return NextResponse.json(
      { success: true, data: { id: created.id, ...created.data() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating auction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create auction" },
      { status: 500 }
    );
  }
}
