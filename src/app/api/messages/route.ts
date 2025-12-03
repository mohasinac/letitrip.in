/**
 * Messages API
 * Epic: E023 - Messaging System
 *
 * GET: List user conversations
 * POST: Create new conversation / send message
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

/**
 * Helper function to convert role to sender/recipient type
 */
function getUserType(role: string | null): "admin" | "seller" | "user" {
  if (role === "admin") return "admin";
  if (role === "seller") return "seller";
  return "user";
}

/**
 * GET /api/messages
 * List conversations for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status") || "active";

    const db = getFirestoreAdmin();
    const userId = auth.user.uid;

    // Get conversations where user is a participant
    // We query for conversations where sender or recipient is the user
    let query = db
      .collection(COLLECTIONS.CONVERSATIONS)
      .where("participantIds", "array-contains", userId)
      .orderBy("updatedAt", "desc");

    if (status !== "all") {
      query = query.where("status", "==", status);
    }

    // Get total count
    const countQuery = db
      .collection(COLLECTIONS.CONVERSATIONS)
      .where("participantIds", "array-contains", userId);
    const countSnapshot = await countQuery.count().get();
    const total = countSnapshot.data().count || 0;

    // Get paginated conversations
    const offset = (page - 1) * pageSize;
    const snapshot = await query.offset(offset).limit(pageSize).get();

    const conversations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        lastMessage: {
          ...data.lastMessage,
          sentAt:
            data.lastMessage?.sentAt?.toDate?.()?.toISOString() ||
            data.lastMessage?.sentAt,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasNext: offset + conversations.length < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/messages
 * Create new conversation or send message to existing conversation
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { conversationId, recipientId, type, subject, message, context } =
      body;

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();
    const userId = auth.user.uid;
    const userName = auth.user.name || auth.user.email || "User";
    const now = Timestamp.now();

    // If conversationId provided, add message to existing conversation
    if (conversationId) {
      const conversationRef = db
        .collection(COLLECTIONS.CONVERSATIONS)
        .doc(conversationId);
      const conversationDoc = await conversationRef.get();

      if (!conversationDoc.exists) {
        return NextResponse.json(
          { success: false, error: "Conversation not found" },
          { status: 404 },
        );
      }

      const conversationData = conversationDoc.data();
      if (!conversationData?.participantIds?.includes(userId)) {
        return NextResponse.json(
          {
            success: false,
            error: "Not authorized to access this conversation",
          },
          { status: 403 },
        );
      }

      // Create message
      const messageRef = db.collection(COLLECTIONS.MESSAGES).doc();
      const getSenderType = (role: string | null) => {
        if (role === "admin") return "admin";
        if (role === "seller") return "seller";
        return "user";
      };
      const messageData = {
        conversationId,
        senderId: userId,
        senderName: userName,
        senderType: getSenderType(auth.role),
        content: message.trim(),
        attachments: [],
        readBy: { [userId]: now },
        isDeleted: false,
        createdAt: now,
      };

      await messageRef.set(messageData);

      // Update conversation's last message and unread counts
      const otherParticipantId = conversationData.participantIds.find(
        (id: string) => id !== userId,
      );
      const currentUnreadCount = conversationData.unreadCount || {};

      await conversationRef.update({
        lastMessage: {
          content: message.trim(),
          senderId: userId,
          sentAt: now,
        },
        unreadCount: {
          ...currentUnreadCount,
          [otherParticipantId]:
            (currentUnreadCount[otherParticipantId] || 0) + 1,
        },
        updatedAt: now,
        status: "active",
      });

      return NextResponse.json({
        success: true,
        data: {
          messageId: messageRef.id,
          conversationId: conversationId,
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          senderType: messageData.senderType,
          content: messageData.content,
          attachments: messageData.attachments,
          createdAt: now.toDate().toISOString(),
        },
      });
    }

    // Create new conversation
    if (!recipientId) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipient ID is required for new conversations",
        },
        { status: 400 },
      );
    }

    // Get recipient info
    const recipientDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(recipientId)
      .get();
    if (!recipientDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Recipient not found" },
        { status: 404 },
      );
    }

    const recipientData = recipientDoc.data();
    const recipientName =
      recipientData?.displayName || recipientData?.email || "User";
    const recipientType = getUserType(recipientData?.role || "user");

    // Check for existing conversation between these users
    const existingQuery = await db
      .collection(COLLECTIONS.CONVERSATIONS)
      .where("participantIds", "array-contains", userId)
      .get();

    const existingConversation = existingQuery.docs.find((doc) => {
      const data = doc.data();
      return (
        data.participantIds?.includes(recipientId) &&
        data.type === (type || "buyer_seller")
      );
    });

    if (existingConversation) {
      // Add message to existing conversation
      const messageRef = db.collection(COLLECTIONS.MESSAGES).doc();
      const messageData = {
        conversationId: existingConversation.id,
        senderId: userId,
        senderName: userName,
        senderType: getUserType(auth.role),
        content: message.trim(),
        attachments: [],
        readBy: { [userId]: now },
        isDeleted: false,
        createdAt: now,
      };

      await messageRef.set(messageData);

      // Update conversation
      const currentUnreadCount = existingConversation.data().unreadCount || {};
      await existingConversation.ref.update({
        lastMessage: {
          content: message.trim(),
          senderId: userId,
          sentAt: now,
        },
        unreadCount: {
          ...currentUnreadCount,
          [recipientId]: (currentUnreadCount[recipientId] || 0) + 1,
        },
        updatedAt: now,
        status: "active",
      });

      return NextResponse.json({
        success: true,
        data: {
          messageId: messageRef.id,
          conversationId: existingConversation.id,
          isNewConversation: false,
        },
      });
    }

    // Create new conversation
    const conversationRef = db.collection(COLLECTIONS.CONVERSATIONS).doc();
    const conversationData = {
      type: type || "buyer_seller",
      participants: {
        sender: {
          id: userId,
          name: userName,
          type: getUserType(auth.role),
        },
        recipient: {
          id: recipientId,
          name: recipientName,
          type: recipientType,
        },
      },
      participantIds: [userId, recipientId],
      subject: subject || null,
      context: context || null,
      lastMessage: {
        content: message.trim(),
        senderId: userId,
        sentAt: now,
      },
      unreadCount: {
        [userId]: 0,
        [recipientId]: 1,
      },
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    await conversationRef.set(conversationData);

    // Create first message
    const messageRef = db.collection(COLLECTIONS.MESSAGES).doc();
    const messageData = {
      conversationId: conversationRef.id,
      senderId: userId,
      senderName: userName,
      senderType: getUserType(auth.role),
      content: message.trim(),
      attachments: [],
      readBy: { [userId]: now },
      isDeleted: false,
      createdAt: now,
    };

    await messageRef.set(messageData);

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversationRef.id,
        messageId: messageRef.id,
        isNewConversation: true,
      },
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 },
    );
  }
}
