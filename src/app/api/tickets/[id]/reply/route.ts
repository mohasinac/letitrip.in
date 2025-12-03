import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { canReadResource } from "@/lib/rbac-permissions";
import { ValidationError } from "@/lib/api-errors";
import { COLLECTIONS } from "@/constants/database";

/**
 * POST /api/tickets/[id]/reply
 * Reply to a support ticket
 * - Owner: Can reply to own tickets
 * - Seller: Can reply to shop-related tickets
 * - Admin: Can reply to any ticket (with internal message option)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user!;

    const { id: ticketId } = await params;

    const data = await request.json();
    const { message, isInternal, attachments } = data;

    // Validation
    if (!message || message.trim().length < 1) {
      throw new ValidationError("Validation failed", {
        message: "Message cannot be empty",
      });
    }

    const db = getFirestoreAdmin();
    const ticketRef = db.collection(COLLECTIONS.SUPPORT_TICKETS).doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticketData = ticketDoc.data();

    // Check permissions
    if (!canReadResource(user, "tickets", ticketData)) {
      return NextResponse.json(
        { error: "You don't have permission to reply to this ticket" },
        { status: 403 }
      );
    }

    // Only admins can send internal messages
    const messageIsInternal = isInternal === true && user.role === "admin";

    // Add message to subcollection
    const now = new Date();
    const messageData = {
      ticketId,
      senderId: user.uid,
      senderRole: user.role,
      message: message.trim(),
      attachments: attachments || [],
      isInternal: messageIsInternal,
      createdAt: now,
    };

    const messageRef = await ticketRef.collection("messages").add(messageData);

    // Update ticket status
    const ticketStatus = ticketData?.status;
    const updates: any = { updatedAt: now };

    if (ticketStatus === "open" && user.role !== "user") {
      // Admin or seller responding to open ticket -> set to in-progress
      updates.status = "in-progress";
    } else if (ticketStatus === "resolved" || ticketStatus === "closed") {
      // User responding to resolved/closed ticket -> reopen
      if (user.role === "user") {
        updates.status = "open";
        updates.resolvedAt = null;
      }
    }

    await ticketRef.update(updates);

    return NextResponse.json({
      success: true,
      data: {
        id: messageRef.id,
        ...messageData,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error posting reply:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
