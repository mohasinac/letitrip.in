/**
 * Conversation Detail API
 * Epic: E023 - Messaging System
 *
 * GET: Get messages in a conversation
 * PATCH: Mark conversation as read / archive
 * DELETE: Delete/archive conversation
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { Timestamp } from "firebase-admin/firestore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/messages/[id]
 * Get messages in a conversation
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const db = getFirestoreAdmin();
    const userId = auth.user.uid;

    // Get conversation
    const conversationRef = db.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    const conversationData = conversationDoc.data();
    if (!conversationData?.participantIds?.includes(userId)) {
      return NextResponse.json(
        { success: false, error: "Not authorized to access this conversation" },
        { status: 403 }
      );
    }

    // Get messages
    const messagesQuery = db
      .collection(COLLECTIONS.MESSAGES)
      .where("conversationId", "==", conversationId)
      .where("isDeleted", "==", false)
      .orderBy("createdAt", "desc");

    // Get total count
    const countSnapshot = await db
      .collection(COLLECTIONS.MESSAGES)
      .where("conversationId", "==", conversationId)
      .where("isDeleted", "==", false)
      .count()
      .get();
    const total = countSnapshot.data().count || 0;

    // Get paginated messages
    const offset = (page - 1) * pageSize;
    const snapshot = await messagesQuery.offset(offset).limit(pageSize).get();

    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        readBy: Object.fromEntries(
          Object.entries(data.readBy || {}).map(([key, value]) => [
            key,
            (value as any)?.toDate?.()?.toISOString() || value,
          ])
        ),
      };
    });

    // Mark messages as read
    const now = Timestamp.now();
    const batch = db.batch();
    let markedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!data.readBy?.[userId]) {
        batch.update(doc.ref, {
          [`readBy.${userId}`]: now,
        });
        markedCount++;
      }
    }

    // Reset unread count for this user
    if (markedCount > 0 || conversationData.unreadCount?.[userId] > 0) {
      batch.update(conversationRef, {
        [`unreadCount.${userId}`]: 0,
      });
    }

    await batch.commit();

    // Format conversation
    const conversation = {
      id: conversationDoc.id,
      ...conversationData,
      createdAt: conversationData.createdAt?.toDate?.()?.toISOString() || conversationData.createdAt,
      updatedAt: conversationData.updatedAt?.toDate?.()?.toISOString() || conversationData.updatedAt,
      lastMessage: {
        ...conversationData.lastMessage,
        sentAt: conversationData.lastMessage?.sentAt?.toDate?.()?.toISOString() || conversationData.lastMessage?.sentAt,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasNext: offset + messages.length < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/messages/[id]
 * Update conversation (mark as read, archive, etc.)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const body = await request.json();
    const { action } = body;

    const db = getFirestoreAdmin();
    const userId = auth.user.uid;

    const conversationRef = db.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    const conversationData = conversationDoc.data();
    if (!conversationData?.participantIds?.includes(userId)) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    const now = Timestamp.now();

    switch (action) {
      case "markRead":
        // Mark all messages as read
        const unreadMessages = await db
          .collection(COLLECTIONS.MESSAGES)
          .where("conversationId", "==", conversationId)
          .get();

        const batch = db.batch();
        unreadMessages.docs.forEach((doc) => {
          if (!doc.data().readBy?.[userId]) {
            batch.update(doc.ref, {
              [`readBy.${userId}`]: now,
            });
          }
        });

        batch.update(conversationRef, {
          [`unreadCount.${userId}`]: 0,
        });

        await batch.commit();
        break;

      case "archive":
        await conversationRef.update({
          status: "archived",
          updatedAt: now,
        });
        break;

      case "unarchive":
        await conversationRef.update({
          status: "active",
          updatedAt: now,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: { action, conversationId },
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages/[id]
 * Archive/delete conversation
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    const db = getFirestoreAdmin();
    const userId = auth.user.uid;

    const conversationRef = db.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    const conversationData = conversationDoc.data();
    if (!conversationData?.participantIds?.includes(userId)) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    // Archive instead of delete (soft delete)
    await conversationRef.update({
      status: "archived",
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      data: { archived: true },
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
