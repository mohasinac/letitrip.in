/**
 * @fileoverview TypeScript Module
 * @module src/app/api/orders/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ordersSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { ValidationError } from "@/lib/api-errors";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for orders
const ordersConfig = {
  ...ordersSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** User Id */
    userId: "user_id",
    /** Shop Id */
    shopId: "shop_id",
    /** Created At */
    createdAt: "created_at",
    /** Updated At */
    updatedAt: "updated_at",
    /** Payment Status */
    paymentStatus: "payment_status",
    /** Total */
    total: "total_amount",
  } as Record<string, string>,
};

/**
 * Transform order document to API response format
 */
/**
 * Transforms order
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformorder result
 */

/**
 * Transforms order
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformorder result
 */

function transformOrder(id: string, data: any) {
  return {
    id,
    ...data,
    /** User Id */
    userId: data.user_id,
    /** Shop Id */
    shopId: data.shop_id,
    /** Payment Status */
    paymentStatus: data.payment_status,
    /** Total Amount */
    totalAmount: data.total_amount,
    /** Created At */
    createdAt: data.created_at,
    /** Updated At */
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/orders
 * List orders with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=status==pending
 *
 * Role-based filtering:
 * - User: Own orders only
 * - Seller: Orders for their shop(s)
 * - Admin: All orders
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
    } = parseSieveQuery(searchParams, ordersConfig);

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

    let query: FirebaseFirestore.Query = Collections.orders();

    // Legacy query params support (for backward compatibility)
    const shopId = searchParams.get("shop_id") || searchParams.get("shopId");
    const status = searchParams.get("status");
    const paymentStatus =
      searchParams.get("paymentStatus") || searchParams.get("payment_status");

    // Role-based filtering
    if (role === "admin") {
      if (shopId) query = query.where("shop_id", "==", shopId);
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
            /** Total */
            total: 0,
            /** Total Pages */
            totalPages: 0,
          },
        });
      }
      const owns = await userOwnsShop(shopId, user!.uid);
      if (!owns) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      }
      query = query.where("shop_id", "==", shopId);
    } else if (role === "user") {
      query = query.where("user_id", "==", user!.uid);
    } else {
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
          /** Total */
          total: 0,
          /** Total Pages */
          totalPages: 0,
        },
      });
    }

    // Apply legacy filters (backward compatibility)
    if (status) {
      query = query.where("status", "==", status);
    }
    if (paymentStatus) {
      query = query.where("payment_status", "==", paymentStatus);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = ordersConfig.fieldMappings[filter.field] || filter.field;
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
        const dbField = ordersConfig.fieldMappings[sort.field] || sort.field;
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
    const data = snapshot.docs.map((doc) => transformOrder(doc.id, doc.data()));

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
    console.error("Orders list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create order (authenticated users only)
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

    const body = await request.json();
    const { shop_id, items, amount } = body;
    if (!shop_id || !Array.isArray(items) || !Number.isFinite(Number(amount))) {
      throw new ValidationError(
        "Invalid payload: shop_id, items array, and amount are required"
      );
    }
    const now = new Date().toISOString();
    const docRef = await Collections.orders().add({
      user_id: user.uid,
      shop_id,
      items,
      /** Amount */
      amount: Number(amount),
      /** Status */
      status: "pending",
      created_at: now,
      updated_at: now,
    });
    const created = await docRef.get();
    return NextResponse.json(
      { success: true, data: { id: created.id, ...created.data() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
