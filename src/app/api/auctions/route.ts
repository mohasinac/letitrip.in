import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { updateCategoryAuctionCounts } from "@/lib/category-hierarchy";
import {
  parseSieveQuery,
  auctionsSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";

// Extended Sieve config with field mappings for auctions
const auctionsConfig = {
  ...auctionsSieveConfig,
  fieldMappings: {
    categoryId: "category_id",
    shopId: "shop_id",
    createdAt: "created_at",
    startTime: "start_time",
    endTime: "end_time",
    currentBid: "current_bid",
    startingPrice: "starting_bid",
    bidCount: "bid_count",
    featured: "is_featured",
  } as Record<string, string>,
};

/**
 * Transform auction document to API response format
 */
function transformAuction(id: string, data: any) {
  return {
    id,
    ...data,
    // Add camelCase aliases
    shopId: data.shop_id,
    categoryId: data.category_id,
    currentBid: data.current_bid,
    startingBid: data.starting_bid,
    bidCount: data.bid_count,
    startTime: data.start_time,
    endTime: data.end_time,
    featured: data.is_featured,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/auctions
 * List auctions with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-endTime&filters=status==active
 *
 * Role-based filtering:
 * - Public: Active auctions only
 * - Seller: Own auctions (all statuses)
 * - Admin: All auctions
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const role = user?.role || "guest";
    const { searchParams } = new URL(request.url);

    // Parse Sieve query
    const {
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, auctionsConfig);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: errors,
        },
        { status: 400 },
      );
    }

    // Legacy filter params (backward compatibility)
    const shopId = searchParams.get("shop_id") || searchParams.get("shopId");
    const status = searchParams.get("status");
    const categoryId =
      searchParams.get("categoryId") || searchParams.get("category_id");
    const minBid = searchParams.get("minBid");
    const maxBid = searchParams.get("maxBid");
    const featured = searchParams.get("featured");

    // Build base query
    let query: FirebaseFirestore.Query = Collections.auctions();

    // Role-based access control
    if (role === "guest" || role === "user") {
      query = query.where("status", "==", "active");
    } else if (role === "seller") {
      if (!shopId) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page: 1,
            pageSize: sieveQuery.pageSize,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }
      query = query.where("shop_id", "==", shopId);
    }
    // Admin sees all auctions

    // Apply legacy filters (backward compatibility)
    if (shopId && (role === "admin" || role === "user" || role === "guest")) {
      query = query.where("shop_id", "==", shopId);
    }

    if (status && role !== "guest" && role !== "user") {
      query = query.where("status", "==", status);
    }

    if (categoryId) {
      query = query.where("category_id", "==", categoryId);
    }

    if (featured === "true") {
      query = query.where("is_featured", "==", true);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField =
        auctionsConfig.fieldMappings[filter.field] || filter.field;
      if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
        query = query.where(
          dbField,
          filter.operator as FirebaseFirestore.WhereFilterOp,
          filter.value,
        );
      }
    }

    // Price range (legacy support)
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

    // Apply sorting
    if (sieveQuery.sorts.length > 0) {
      for (const sort of sieveQuery.sorts) {
        const dbField = auctionsConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      // Default sort by end_time (ending soon first)
      query = query.orderBy("end_time", "asc");
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const totalCount = countSnapshot.data().count;

    // Apply pagination
    const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0) {
      const skipSnapshot = await query.limit(offset).get();
      if (skipSnapshot.docs.length > 0) {
        const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) =>
      transformAuction(doc.id, doc.data()),
    );

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      success: true,
      data,
      pagination,
      meta: {
        appliedFilters: sieveQuery.filters,
        appliedSorts: sieveQuery.sorts,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error) {
    console.error("Error listing auctions:", error);

    if (process.env.NODE_ENV === "development") {
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to list auctions",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 },
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
        { status: 403 },
      );
    }

    const body = await request.json();
    const { shop_id, name, slug, starting_bid, end_time, category_id } = body;
    if (!shop_id || !name || !slug || starting_bid == null || !end_time) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (role === "seller") {
      const ownsShop = await userOwnsShop(shop_id, user.uid);
      if (!ownsShop) {
        return NextResponse.json(
          { success: false, error: "Cannot create auction for this shop" },
          { status: 403 },
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
          { status: 400 },
        );
      }
    }

    // Check if slug/ID already exists (slug is used as document ID)
    const existingDoc = await Collections.auctions().doc(slug).get();
    if (existingDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Auction slug already exists" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const auctionData = {
      shop_id,
      name,
      slug,
      description: body.description || "",
      category_id: category_id || null,
      starting_bid,
      current_bid: starting_bid,
      bid_count: 0,
      status: "active",
      start_time: body.start_time || now,
      end_time,
      created_at: now,
      updated_at: now,
    };

    // Use slug as document ID for SEO-friendly URLs
    await Collections.auctions().doc(slug).set(auctionData);

    // Update category auction counts if category is provided
    if (category_id) {
      try {
        await updateCategoryAuctionCounts(category_id);
      } catch (err) {
        console.error("Failed to update category auction counts:", err);
      }
    }

    return NextResponse.json(
      { success: true, data: { id: slug, ...auctionData } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating auction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create auction" },
      { status: 500 },
    );
  }
}
