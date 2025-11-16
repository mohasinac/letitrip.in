import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { ValidationError } from "@/lib/api-errors";

/**
 * GET /api/tickets
 * List support tickets with role-based filtering
 * - User: Own tickets only
 * - Seller: Shop-related tickets (if shopId matches their shop)
 * - Admin: All tickets
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const shopId = searchParams.get("shopId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const db = getFirestoreAdmin();
    let query: any = db.collection("support_tickets");

    // Role-based filtering
    if (!user || user.role === "user") {
      // Users and guests see only their own tickets (require auth for users)
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      query = query.where("userId", "==", user.uid);
    } else if (user.role === "seller") {
      // Sellers see tickets related to their shops
      if (!shopId) {
        return NextResponse.json(
          { error: "Shop ID required for seller" },
          { status: 400 }
        );
      }
      query = query.where("shopId", "==", shopId);
    }
    // Admin sees all tickets (no additional filter)

    // Apply filters
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

    // Order by created date
    query = query.orderBy("createdAt", "desc");

    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Execute query
    const snapshot = await query.get();

    const tickets = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        resolvedAt: data.resolvedAt?.toDate?.() || data.resolvedAt,
      };
    });

    // Get statistics (admin only)
    let stats = undefined;
    if (user?.role === "admin") {
      const statsSnapshot = await db.collection("support_tickets").get();
      stats = {
        total: statsSnapshot.size,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        escalated: 0,
      };

      statsSnapshot.docs.forEach((doc) => {
        const status = doc.data().status;
        if (status === "open") stats!.open++;
        else if (status === "in-progress") stats!.inProgress++;
        else if (status === "resolved") stats!.resolved++;
        else if (status === "closed") stats!.closed++;
        else if (status === "escalated") stats!.escalated++;
      });
    }

    return NextResponse.json({
      success: true,
      data: tickets,
      ...(stats && { stats }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
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
    const ticketsRef = db.collection("support_tickets");

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
        { status: 400 }
      );
    }
    console.error("Error creating support ticket:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
