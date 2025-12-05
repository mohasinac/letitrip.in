/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payouts/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { payoutsSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for payouts
const payoutsConfig = {
  ...payoutsSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** Seller Id */
    sellerId: "seller_id",
    /** Shop Id */
    shopId: "shop_id",
    /** Created At */
    createdAt: "created_at",
    /** Updated At */
    updatedAt: "updated_at",
    /** Payment Method */
    paymentMethod: "payment_method",
    /** Net Amount */
    netAmount: "net_amount",
    /** Platform Fee */
    platformFee: "platform_fee",
    /** Total Sales */
    totalSales: "total_sales",
    /** Order Count */
    orderCount: "order_count",
  } as Record<string, string>,
};

/**
 * Transform payout document to API response format
 */
/**
 * Transforms payout
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformpayout result
 */

/**
 * Transforms payout
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformpayout result
 */

function transformPayout(id: string, data: any) {
  return {
    id,
    ...data,
    /** Seller Id */
    sellerId: data.seller_id,
    /** Shop Id */
    shopId: data.shop_id,
    /** Payment Method */
    paymentMethod: data.payment_method,
    /** Net Amount */
    netAmount: data.net_amount,
    /** Platform Fee */
    platformFee: data.platform_fee,
    /** Total Sales */
    totalSales: data.total_sales,
    /** Order Count */
    orderCount: data.order_count,
    /** Created At */
    createdAt: data.created_at,
    /** Updated At */
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/payouts
 * List payouts with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=status==pending
 *
 * Role-based filtering:
 * - Seller: Own payouts only
 * - Admin: All payouts
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

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, payoutsConfig);

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

    let query: FirebaseFirestore.Query = Collections.payouts();

    // Role-based filtering
    if (user.role === "seller") {
      query = query.where("seller_id", "==", user.uid);
    }
    // Admin sees all payouts (no filter)

    // Legacy query params support (for backward compatibility)
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (status) {
      query = query.where("status", "==", status);
    }
    if (startDate) {
      query = query.where("created_at", ">=", new Date(startDate));
    }
    if (endDate) {
      query = query.where("created_at", "<=", new Date(endDate));
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = payoutsConfig.fieldMappings[filter.field] || filter.field;
      if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
        query = query.where(
          dbField,
          filter.operator as FirebaseFirestore.WhereFilterOp,
          filter.value
        );
      }
    }

    // Apply sorting
    if (sieveQuery.sorts.length > 0) {
      for (const sort of sieveQuery.sorts) {
        const dbField = payoutsConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      query = query.orderBy("created_at", "desc");
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
      const lastDoc = skipSnapshot.docs.at(-1);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) =>
      transformPayout(doc.id, doc.data())
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
  } catch (error: any) {
    logError(error as Error, { component: "API.payouts.GET" });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch payouts",
      },
      { status: 500 }
    );
  }
}

/**
 * Function: P O S T
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
    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    // Only sellers can create payout requests
    if (user.role !== "seller") {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Only sellers can create payout requests",
        },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.amount || !data.paymentMethod) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Missing required fields: amount, paymentMethod",
        },
        { status: 400 }
      );
    }

    // Create payout request
    const payoutData = {
      seller_id: user.uid,
      shop_id: data.shopId || user.shopId,
      /** Amount */
      amount: data.amount,
      /** Currency */
      currency: data.currency || "INR",
      /** Status */
      status: "pending",
      payment_method: data.paymentMethod,
      bank_details: data.bankDetails || null,
      upi_id: data.upiId || null,
      /** Period */
      period: data.period || null,
      order_count: data.orderCount || 0,
      total_sales: data.totalSales || 0,
      platform_fee: data.platformFee || 0,
      net_amount: data.netAmount || data.amount,
      /** Notes */
      notes: data.notes || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const docRef = await Collections.payouts().add(payoutData);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Payout */
      payout: {
        /** Id */
        id: docRef.id,
        ...payoutData,
      },
      /** Message */
      message: "Payout request created successfully",
    });
  } catch (error: any) {
    logError(error as Error, { component: "API.payouts.POST" });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to create payout",
      },
      { status: 500 }
    );
  }
}
