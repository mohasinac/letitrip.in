import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { ValidationError } from "@/lib/api-errors";
import {
  parseSieveQuery,
  ticketsSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";
import { COLLECTIONS } from "@/constants/database";

// Extended Sieve config with field mappings for tickets
const ticketsConfig = {
  ...ticketsSieveConfig,
  fieldMappings: {
    userId: "userId",
    shopId: "shopId",
    assignedTo: "assignedTo",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    resolvedAt: "resolvedAt",
  } as Record<string, string>,
};

/**
 * Transform ticket document to API response format
 */
function transformTicket(id: string, data: any) {
  return {
    id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
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
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const searchParams = request.nextUrl.searchParams;

    // Parse Sieve query
    const {
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, ticketsConfig);

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

    const db = getFirestoreAdmin();
    let query: FirebaseFirestore.Query = db.collection(
      COLLECTIONS.SUPPORT_TICKETS,
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
          { status: 401 },
        );
      }
      query = query.where("userId", "==", user.uid);
    } else if (user.role === "seller") {
      if (!shopId) {
        return NextResponse.json(
          { error: "Shop ID required for seller" },
          { status: 400 },
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
          filter.value,
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
      transformTicket(doc.id, doc.data()),
    );

    // Get statistics (admin only)
    let stats = undefined;
    if (user?.role === "admin") {
      const statsSnapshot = await db
        .collection(COLLECTIONS.SUPPORT_TICKETS)
        .get();
      stats = {
        total: statsSnapshot.size,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
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
      success: true,
      data,
      pagination,
      meta: {
        appliedFilters: sieveQuery.filters,
        appliedSorts: sieveQuery.sorts,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
      ...(stats && { stats }),
    });
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/tickets
 * Create a new support ticket (authenticated users only)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user!;

    const data = await request.json();
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
      userId: user.uid,
      subject: subject.trim(),
      category,
      priority: ticketPriority,
      description: description.trim(),
      attachments: attachments || [],
      shopId: shopId || null,
      orderId: orderId || null,
      status: "open",
      assignedTo: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };

    const docRef = await ticketsRef.add(ticket);

    console.log("Support ticket created:", {
      ticketId: docRef.id,
      userId: user.uid,
      subject,
      category,
      priority: ticketPriority,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...ticket,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: 400 },
      );
    }
    console.error("Error creating support ticket:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
