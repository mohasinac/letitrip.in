import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

/**
 * POST /api/admin/tickets/[id]/reply
 * Admin reply to support ticket
 */
export async function POST(
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
    const { message, isInternal } = data;

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

    // Add message to subcollection
    const now = new Date();
    const messageData = {
      ticketId,
      senderId: user.id,
      senderRole: user.role,
      message: message.trim(),
      attachments: [],
      isInternal: isInternal || false,
      createdAt: now,
    };

    const messageRef = await ticketRef.collection("messages").add(messageData);

    // Update ticket status to in-progress if it was open
    const ticketData = ticketDoc.data();
    if (ticketData?.status === "open") {
      await ticketRef.update({
        status: "in-progress",
        updatedAt: now,
      });
    } else {
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
    console.error("Error posting admin reply:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
