import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * GET /admin/tickets
 * List all support tickets (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Database query
    const db = getFirestoreAdmin();
    let query: any = db.collection("support_tickets");

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
    if (assignedTo) {
      query = query.where("assignedTo", "==", assignedTo);
    }

    // Order by priority and created date
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

    // Get statistics
    const statsSnapshot = await db.collection("support_tickets").get();
    const stats = {
      total: statsSnapshot.size,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      escalated: 0,
    };

    statsSnapshot.docs.forEach((doc) => {
      const status = doc.data().status;
      if (status === "open") stats.open++;
      else if (status === "in-progress") stats.inProgress++;
      else if (status === "resolved") stats.resolved++;
      else if (status === "closed") stats.closed++;
      else if (status === "escalated") stats.escalated++;
    });

    return NextResponse.json({
      success: true,
      data: tickets,
      stats,
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
    console.error("Error fetching admin tickets:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
