/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { auctionsSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from "@/constants/validation-messages";
import { updateCategoryAuctionCounts } from "@/lib/category-hierarchy";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for auctions
const auctionsConfig = {
  ...auctionsSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** Category Id */
    categoryId: "category_id",
    /** Shop Id */
    shopId: "shop_id",
    /** Created At */
    createdAt: "created_at",
    /** Start Time */
    startTime: "start_time",
    /** End Time */
    endTime: "end_time",
    /** Current Bid */
    currentBid: "current_bid",
    /** Starting Price */
    startingPrice: "starting_bid",
    /** Bid Count */
    bidCount: "bid_count",
    /** Featured */
    featured: "is_featured",
  } as Record<string, string>,
};

/**
 * Transform auction document to API response format
 */
/**
 * Transforms auction
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformauction result
 */

/**
 * Transforms auction
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformauction result
 */

function transformAuction(id: string, data: any) {
  return {
    id,
    ...data,
    // Add camelCase aliases
    /** Shop Id */
    shopId: data.shop_id,
    /** Category Id */
    categoryId: data.category_id,
    /** Current Bid */
    currentBid: data.current_bid,
    /** Starting Bid */
    startingBid: data.starting_bid,
    /** Bid Count */
    bidCount: data.bid_count,
    /** Start Time */
    startTime: data.start_time,
    /** End Time */
    endTime: data.end_time,
    /** Featured */
    featured: data.is_featured,
    /** Created At */
    createdAt: data.created_at,
    /** Updated At */
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
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const role = user?.role || "guest";
    const { searchParams } = new URL(request.url);

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, auctionsConfig);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Invalid query parameters",
          /** Details */
          details: errors,
        },
        { status: 400 }
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
          /** Success */
          success: true,
          /** Data */
          data: [],
          /** Pagination */
          pagination: {
            /** Page */
            page: 1,
            /** Page Size */
            pageSize: sieveQuery.pageSize,
            /** Total Count */
            totalCount: 0,
            /** Total Pages */
            totalPages: 0,
            /** Has Next Page */
            hasNextPage: false,
            /** Has Previous Page */
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
          filter.value
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
    /**
     * Performs offset operation
     *
     * @param {any} sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0 - The sieve query.page - 1) * sieve query.page size;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

    /**
     * Performs offset operation
     *
     * @param {any} sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0 - The sieve query.page - 1) * sieve query.page size;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

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
      transformAuction(doc.id, doc.data())
    );

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      /** Success */
      success: true,
      data,
      pagination,
      /** Meta */
      meta: {
        /** Applied Filters */
        appliedFilters: sieveQuery.filters,
        /** Applied Sorts */
        appliedSorts: sieveQuery.sorts,
        /** Warnings */
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error) {
    console.error("Error listing auctions:", error);

    if (process.env.NODE_ENV === "development") {
      console.error("Error details:", {
        /** Message */
        message: error instanceof Error ? error.message : String(error),
        /** Stack */
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: "Failed to list auctions",
        ...(process.env.NODE_ENV === "development" && {
          /** Details */
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auctions
 * Create auction (seller/admin only)
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Only sellers and admins can create auctions",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { shop_id, name, slug, starting_bid, end_time, category_id } = body;

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!shop_id) {
      errors.shop_id = VALIDATION_MESSAGES.REQUIRED.FIELD("Shop ID");
    }

    if (!name) {
      errors.name = VALIDATION_MESSAGES.REQUIRED.FIELD("Auction name");
    } else if (
      name.length < VALIDATION_RULES.AUCTION.NAME.MIN_LENGTH ||
      name.length > VALIDATION_RULES.AUCTION.NAME.MAX_LENGTH
    ) {
      errors.name = `Auction name must be between ${VALIDATION_RULES.AUCTION.NAME.MIN_LENGTH} and ${VALIDATION_RULES.AUCTION.NAME.MAX_LENGTH} characters`;
    }

    if (!slug) {
      errors.slug = VALIDATION_MESSAGES.REQUIRED.FIELD("Slug");
    } else if (
      slug.length < VALIDATION_RULES.SLUG.MIN_LENGTH ||
      slug.length > VALIDATION_RULES.SLUG.MAX_LENGTH
    ) {
      errors.slug = `Slug must be between ${VALIDATION_RULES.SLUG.MIN_LENGTH} and ${VALIDATION_RULES.SLUG.MAX_LENGTH} characters`;
    }

    if (starting_bid == null) {
      errors.starting_bid = VALIDATION_MESSAGES.REQUIRED.FIELD("Starting bid");
    } else if (starting_bid < VALIDATION_RULES.AUCTION.START_PRICE.MIN) {
      errors.starting_bid = `Starting bid must be at least ₹${VALIDATION_RULES.AUCTION.START_PRICE.MIN}`;
    }

    if (!end_time) {
      errors.end_time = VALIDATION_MESSAGES.REQUIRED.FIELD("End time");
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
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
            /** Success */
            success: false,
            /** Error */
            error: "Active auction limit reached for this shop",
          },
          { status: 400 }
        );
      }
    }

    // Check if slug/ID already exists (slug is used as document ID)
    const existingDoc = await Collections.auctions().doc(slug).get();
    if (existingDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Auction slug already exists" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const auctionData = {
      shop_id,
      name,
      slug,
      /** Description */
      description: body.description || "",
      category_id: category_id || null,
      starting_bid,
      current_bid: starting_bid,
      bid_count: 0,
      /** Status */
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
