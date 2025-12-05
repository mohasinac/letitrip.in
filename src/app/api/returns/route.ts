/**
 * @fileoverview TypeScript Module
 * @module src/app/api/returns/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { getReturnsQuery, UserRole } from "@/app/api/lib/firebase/queries";
import { getCurrentUser } from "@/app/api/lib/session";
import { returnsSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { logError } from "@/lib/firebase-error-logger";
import { Query } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for returns
const returnsConfig = {
  ...returnsSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** Order Id */
    orderId: "order_id",
    /** Order Item Id */
    orderItemId: "order_item_id",
    /** User Id */
    userId: "user_id",
    /** Shop Id */
    shopId: "shop_id",
    /** Created At */
    createdAt: "created_at",
    /** Updated At */
    updatedAt: "updated_at",
    /** Requires Admin Intervention */
    requiresAdminIntervention: "requires_admin_intervention",
  } as Record<string, string>,
};

/**
 * Transform return document to API response format
 */
/**
 * Transforms return
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformreturn result
 */

/**
 * Transforms return
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformreturn result
 */

function transformReturn(id: string, data: any) {
  return {
    id,
    ...data,
    /** Order Id */
    orderId: data.order_id,
    /** Order Item Id */
    orderItemId: data.order_item_id,
    /** User Id */
    userId: data.user_id,
    /** Shop Id */
    shopId: data.shop_id,
    /** Requires Admin Intervention */
    requiresAdminIntervention: data.requires_admin_intervention,
    /** Created At */
    createdAt: data.created_at,
    /** Updated At */
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/returns
 * List returns with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=status==pending
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

export async function GET(req: NextRequest) {
  let role: UserRole = UserRole.USER;
  try {
    const user = await getCurrentUser(req);
    role = (user?.role as UserRole) || UserRole.USER;

    const { searchParams } = new URL(req.url);

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, returnsConfig);

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

    // Legacy query params support (for backward compatibility)
    const shopId = searchParams.get("shop_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const reason = searchParams.get("reason") || undefined;
    const requiresAdminIntervention = searchParams.get(
      "requires_admin_intervention"
    );
    const startDate = searchParams.get("start_date") || undefined;
    const endDate = searchParams.get("end_date") || undefined;

    let query: Query = getReturnsQuery(role, user?.id, shopId);

    if (status) query = query.where("status", "==", status);
    if (reason) query = query.where("reason", "==", reason);
    if (
      requiresAdminIntervention !== null &&
      requiresAdminIntervention !== undefined
    ) {
      const val = requiresAdminIntervention === "true";
      query = query.where("requires_admin_intervention", "==", val);
    }
    if (startDate) query = query.where("created_at", ">=", startDate);
    if (endDate) query = query.where("created_at", "<=", endDate);

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = returnsConfig.fieldMappings[filter.field] || filter.field;
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
        const dbField = returnsConfig.fieldMappings[sort.field] || sort.field;
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
      transformReturn(doc.id, doc.data())
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
    logError(error as Error, {
      /** Component */
      component: "API.returns.list",
      /** Metadata */
      metadata: { role: role },
    });
    return NextResponse.json(
      { success: false, error: "Failed to load returns" },
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
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  let user: Awaited<ReturnType<typeof getCurrentUser>> | undefined;
  try {
    user = await getCurrentUser(req);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();
    const { orderId, orderItemId, reason, description, media, shopId } = body;

    if (!orderId || !orderItemId || !reason || !shopId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const payload = {
      order_id: orderId,
      order_item_id: orderItemId,
      user_id: user.id,
      shop_id: shopId,
      reason,
      /** Description */
      description: description || "",
      /** Media */
      media: Array.isArray(media) ? media : [],
      /** Status */
      status: "pending",
      requires_admin_intervention: false,
      created_at: now,
      updated_at: now,
    };

    const ref = await Collections.returns().add(payload as any);
    const doc = await ref.get();
    return NextResponse.json(
      { success: true, data: { id: doc.id, ...doc.data() } },
      { status: 201 }
    );
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.returns.create",
      /** Metadata */
      metadata: { userId: user?.id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to initiate return" },
      { status: 500 }
    );
  }
}
