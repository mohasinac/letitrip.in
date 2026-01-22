/**
 * Individual Message API Route
 *
 * Handle message operations (mark as read, delete).
 *
 * @route PUT /api/messages/[id] - Mark message as read (requires auth)
 * @route DELETE /api/messages/[id] - Delete message (requires auth)
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT - Mark message as read
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const { id } = await context.params;

    // Get message
    const messageRef = doc(db, "messages", id);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const messageData = messageDoc.data();

    // Verify recipient
    if (messageData.recipientId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark as read
    await updateDoc(messageRef, {
      isRead: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message marked as read",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating message:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to update message",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Delete message
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const { id } = await context.params;

    // Get message
    const messageRef = doc(db, "messages", id);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const messageData = messageDoc.data();

    // Verify ownership (sender or recipient can delete)
    if (messageData.senderId !== userId && messageData.recipientId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete message
    await deleteDoc(messageRef);

    return NextResponse.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting message:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete message",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
