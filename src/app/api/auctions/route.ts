import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

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

    // Filter params
    const shopId = searchParams.get("shop_id");
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const minBid = searchParams.get("minBid");
    const maxBid = searchParams.get("maxBid");
    const featured = searchParams.get("featured");

    // Sort params
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

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
            limit: 50,
            hasNextPage: false,
            nextCursor: null,
            count: 0,
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
    const validSortFields = [
      "created_at",
      "end_time",
      "current_bid",
      "bid_count",
    ];
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

    // Execute paginated query
    const response = await executeCursorPaginatedQuery(
      query,
      searchParams,
      (id) => Collections.auctions().doc(id).get(),
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      }),
      50, // defaultLimit
      200 // maxLimit
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error listing auctions:", error);
    
    // Log more detailed error info in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to list auctions",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : String(error)
        })
      },
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
