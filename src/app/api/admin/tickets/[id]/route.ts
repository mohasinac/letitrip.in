import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * GET /admin/tickets/[id]
 * Get ticket details (admin can see all tickets)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticketId = params.id;

    // Database query
    const db = getFirestoreAdmin();
    const ticketRef = db.collection("support_tickets").doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticketData = ticketDoc.data();

    // Get conversation messages
    const messagesSnapshot = await db
      .collection("support_tickets")
      .doc(ticketId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      };
    });

    // Get user details
    const userDoc = await db.collection("users").doc(ticketData?.userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    return NextResponse.json({
      success: true,
      data: {
        id: ticketDoc.id,
        ...ticketData,
        createdAt: ticketData?.createdAt?.toDate?.() || ticketData?.createdAt,
        updatedAt: ticketData?.updatedAt?.toDate?.() || ticketData?.updatedAt,
        resolvedAt:
          ticketData?.resolvedAt?.toDate?.() || ticketData?.resolvedAt,
        messages,
        user: userData
          ? {
              id: userDoc.id,
              name: userData.name,
              email: userData.email,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin ticket details:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /admin/tickets/[id]
 * Update ticket (assign, change status, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticketId = params.id;

    // Parse request
    const data = await request.json();
    const { status, assignedTo, priority } = data;

    // Database operation
    const db = getFirestoreAdmin();
    const ticketRef = db.collection("support_tickets").doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date(),
    };

    if (status) updates.status = status;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (priority) updates.priority = priority;

    if (status === "resolved" || status === "closed") {
      updates.resolvedAt = new Date();
    }

    await ticketRef.update(updates);

    return NextResponse.json({
      success: true,
      data: {
        id: ticketId,
        ...updates,
      },
    });
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
