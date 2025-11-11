import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * POST /api/support/tickets/[id]/reply
 * Reply to a support ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ticketId } = await params;

    // Parse request
    const data = await request.json();
    const { message, attachments } = data;

    // Validation
    if (!message || message.trim().length < 1) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    // Database operation
    const db = getFirestoreAdmin();
    const ticketRef = db.collection("support_tickets").doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticketData = ticketDoc.data();

    // Ownership check
    if (ticketData?.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Add message to subcollection
    const now = new Date();
    const messageData = {
      ticketId,
      senderId: user.id,
      senderRole: user.role,
      message: message.trim(),
      attachments: attachments || [],
      isInternal: false,
      createdAt: now,
    };

    const messageRef = await ticketRef.collection("messages").add(messageData);

    // Update ticket status if it was resolved/closed
    if (ticketData?.status === "resolved" || ticketData?.status === "closed") {
      await ticketRef.update({
        status: "in-progress",
        updatedAt: now,
      });
    } else if (ticketData?.status === "open") {
      // Update to in-progress on first user reply after creation
      await ticketRef.update({
        status: "in-progress",
        updatedAt: now,
      });
    } else {
      // Just update timestamp
      await ticketRef.update({
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: messageRef.id,
        ...messageData,
      },
    });
  } catch (error: any) {
    console.error("Error posting reply:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
