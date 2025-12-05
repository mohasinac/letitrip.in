/**
 * @fileoverview TypeScript Module
 * @module src/app/api/tickets/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { ticketsSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";
import { ValidationError } from "@/lib/api-errors";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for tickets
const ticketsConfig = {
  ...ticketsSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** User Id */
    userId: "userId",
    /** Shop Id */
    shopId: "shopId",
    /** Assigned To */
    assignedTo: "assignedTo",
    /** Created At */
    createdAt: "createdAt",
    /** Updated At */
    updatedAt: "updatedAt",
    /** Resolved At */
    resolvedAt: "resolvedAt",
  } as Record<string, string>,
};

/**
 * Transform ticket document to API response format
 */
/**
 * Transforms ticket
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformticket result
 */

/**
 * Transforms ticket
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformticket result
 */

function transformTicket(id: string, data: any) {
  return {
    id,
    ...data,
    /** Created At */
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    /** Updated At */
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    /** Resolved At */
    resolvedAt: data.resolvedAt?.toDate?.() || data.resolvedAt,
  };
}

/**
 * GET /api/tickets
 * List support tickets with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-createdAt&filters=status==open
 *
 * Role-based filtering:
 * - User: Own tickets only
 * - Seller: Shop-related tickets (if shopId matches their shop)
 * - Admin: All tickets
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
  let user: any;
  try {
    user = await getUserFromRequest(request);
    const searchParams = request.nextUrl.searchParams;

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, ticketsConfig);

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

    const db = getFirestoreAdmin();
    let query: FirebaseFirestore.Query = db.collection(
      COLLECTIONS.SUPPORT_TICKETS
    );

    // Legacy query params support (for backward compatibility)
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const shopId = searchParams.get("shopId");

    // Role-based filtering
    if (!user || user.role === "user") {
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      query = query.where("userId", "==", user.uid);
    } else if (user.role === "seller") {
      if (!shopId) {
        return NextResponse.json(
          { error: "Shop ID required for seller" },
          { status: 400 }
        );
      }
      query = query.where("shopId", "==", shopId);
    }
    // Admin sees all tickets (no additional filter)

    // Apply legacy filters
    if (status) {
      query = query.where("status", "==", status);
    }
    if (category) {
      query = query.where("category", "==", category);
    }
    if (priority) {
      query = query.where("priority", "==", priority);
    }
    if (assignedTo && user?.role === "admin") {
      query = query.where("assignedTo", "==", assignedTo);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = ticketsConfig.fieldMappings[filter.field] || filter.field;
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
        const dbField = ticketsConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      query = query.orderBy("createdAt", "desc");
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
      transformTicket(doc.id, doc.data())
    );

    // Get statistics (admin only)
    let stats = undefined;
    if (user?.role === "admin") {
      const statsSnapshot = await db
        .collection(COLLECTIONS.SUPPORT_TICKETS)
        .get();
      stats = {
        /** Total */
        total: statsSnapshot.size,
        /** Open */
        open: 0,
        /** In Progress */
        inProgress: 0,
        /** Resolved */
        resolved: 0,
        /** Closed */
        closed: 0,
        /** Escalated */
        escalated: 0,
      };

      statsSnapshot.docs.forEach((doc) => {
        const ticketStatus = doc.data().status;
        if (ticketStatus === "open") stats!.open++;
        else if (ticketStatus === "in-progress") stats!.inProgress++;
        else if (ticketStatus === "resolved") stats!.resolved++;
        else if (ticketStatus === "closed") stats!.closed++;
        else if (ticketStatus === "escalated") stats!.escalated++;
      });
    }

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
      ...(stats && { stats }),
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.tickets.list",
      /** Metadata */
      metadata: { userId: user?.uid },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/tickets
 * Create a new support ticket (authenticated users only)
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
  let user: any;
  let data: any;
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    user = authResult.user!;

    data = await request.json();
    const {
      subject,
      category,
      priority,
      description,
      attachments,
      shopId,
      orderId,
    } = data;

    // Validation
    const errors: Record<string, string> = {};

    if (!subject || subject.trim().length < 3) {
      errors.subject = "Subject must be at least 3 characters";
    }

    if (!description || description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    if (!category) {
      errors.category = "Category is required";
    } else {
      const validCategories = [
        "order-issue",
        "return-refund",
        "product-question",
        "account",
        "payment",
        "other",
      ];
      if (!validCategories.includes(category)) {
        errors.category = "Invalid category";
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    const validPriorities = ["low", "medium", "high", "urgent"];
    const ticketPriority =
      priority && validPriorities.includes(priority) ? priority : "medium";

    const db = getFirestoreAdmin();
    const ticketsRef = db.collection(COLLECTIONS.SUPPORT_TICKETS);

    const now = new Date();
    const ticket = {
      /** User Id */
      userId: user.uid,
      /** Subject */
      subject: subject.trim(),
      category,
      /** Priority */
      priority: ticketPriority,
      /** Description */
      description: description.trim(),
      /** Attachments */
      attachments: attachments || [],
      /** Shop Id */
      shopId: shopId || null,
      /** Order Id */
      orderId: orderId || null,
      /** Status */
      status: "open",
      /** Assigned To */
      assignedTo: null,
      /** Created At */
      createdAt: now,
      /** Updated At */
      updatedAt: now,
      /** Resolved At */
      resolvedAt: null,
    };

    const docRef = await ticketsRef.add(ticket);

    console.log("Support ticket created:", {
      /** Ticket Id */
      ticketId: docRef.id,
      /** User Id */
      userId: user.uid,
      subject,
      category,
      /** Priority */
      priority: ticketPriority,
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: docRef.id,
        ...ticket,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    logError(error as Error, {
      /** Component */
      component: "API.tickets.create",
      /** Metadata */
      metadata: { userId: user?.uid, subject: data?.subject },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
