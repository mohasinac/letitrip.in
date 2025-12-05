/**
 * @fileoverview TypeScript Module
 * @module src/app/api/messages/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
/**
 * Retrieves user type
 *
 * @param {string | null} role - The role
 *
 * @returns {string} The usertype result
 */

/**
 * Retrieves user type
 *
 * @param {string | null} role - The role
 *
 * @returns {string} The usertype result
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
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
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
    /**
     * Performs offset operation
     *
     * @param {any} [page - 1) * pageSize;
    const snapshot] - The page - 1) * page size;
    const snapshot
     *
     * @returns {any} The offset result
     */

    /**
     * Performs offset operation
     *
     * @param {any} [page - 1) * pageSize;
    const snapshot] - The page - 1) * page size;
    const snapshot
     *
     * @returns {any} The offset result
     */

    const offset = (page - 1) * pageSize;
    const snapshot = await query.offset(offset).limit(pageSize).get();

    /**
 * Performs conversations operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The conversations result
 *
 */
const conversations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        /** Id */
        id: doc.id,
        ...data,
        /** Created At */
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        /** Updated At */
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        /** Last Message */
        lastMessage: {
          ...data.lastMessage,
          /** Sent At */
          sentAt:
            data.lastMessage?.sentAt?.toDate?.()?.toISOString() ||
            data.lastMessage?.sentAt,
        },
      };
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        conversations,
        /** Pagination */
        pagination: {
          page,
          pageSize,
          total,
          /** Total Pages */
          totalPages: Math.ceil(total / pageSize),
          /** Has Next */
          hasNext: offset + conversations.length < total,
          /** Has Prev */
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
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
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
            /** Success */
            success: false,
            /** Error */
            error: "Not authorized to access this conversation",
          },
          { status: 403 },
        );
      }

      // Create message
      const messageRef = db.collection(COLLECTIONS.MESSAGES).doc();
      /**
       * Retrieves sender type
       *
       * @param {string | null} role - The role
       *
       * @returns {string} The sendertype result
       */

      /**
       * Retrieves sender type
       *
       * @param {string | null} role - The role
       *
       * @returns {string} The sendertype result
       */

      const getSenderType = (role: string | null) => {
        if (role === "admin") return "admin";
        if (role === "seller") return "seller";
        return "user";
      };
      const messageData = {
        conversationId,
        /** Sender Id */
        senderId: userId,
        /** Sender Name */
        senderName: userName,
        /** Sender Type */
        senderType: getSenderType(auth.role),
        /** Content */
        content: message.trim(),
        /** Attachments */
        attachments: [],
        /** Read By */
        readBy: { [userId]: now },
        /** Is Deleted */
        isDeleted: false,
        /** Created At */
        createdAt: now/**
 * Performs other participant id operation
 *
 * @param {string} (id - The (id
 *
 * @returns {any} The otherparticipantid result
 *
 */
,
      };

      await messageRef.set(messageData);

      // Update conversation's last message and unread counts
      const otherParticipantId = conversationData.participantIds.find(
        (id: string) => id !== userId,
      );
      const currentUnreadCount = conversationData.unreadCount || {};

      await conversationRef.update({
        /** Last Message */
        lastMessage: {
          /** Content */
          content: message.trim(),
          /** Sender Id */
          senderId: userId,
          /** Sent At */
          sentAt: now,
        },
        /** Unread Count */
        unreadCount: {
          ...currentUnreadCount,
          [otherParticipantId]:
            (currentUnreadCount[otherParticipantId] || 0) + 1,
        },
        /** Updated At */
        updatedAt: now,
        /** Status */
        status: "active",
      });

      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: {
          /** Message Id */
          messageId: messageRef.id,
          /** Conversation Id */
          conversationId: conversationId,
          /** Sender Id */
          senderId: messageData.senderId,
          /** Sender Name */
          senderName: messageData.senderName,
          /** Sender Type */
          senderType: messageData.senderType,
          /** Content */
          content: messageData.content,
          /** Attachments */
          attachments: messageData.attachments,
          /** Created At */
          createdAt: now.toDate().toISOString(),
        },
      });
    }

    // Create new conversation
    if (!recipientId) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
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
    const recipientType =/**
 * Performs existing conversation operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The existingconversation result
 *
 */
 getUserType(recipientData?.role || "user");

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
        /** Conversation Id */
        conversationId: existingConversation.id,
        /** Sender Id */
        senderId: userId,
        /** Sender Name */
        senderName: userName,
        /** Sender Type */
        senderType: getUserType(auth.role),
        /** Content */
        content: message.trim(),
        /** Attachments */
        attachments: [],
        /** Read By */
        readBy: { [userId]: now },
        /** Is Deleted */
        isDeleted: false,
        /** Created At */
        createdAt: now,
      };

      await messageRef.set(messageData);

      // Update conversation
      const currentUnreadCount = existingConversation.data().unreadCount || {};
      await existingConversation.ref.update({
        /** Last Message */
        lastMessage: {
          /** Content */
          content: message.trim(),
          /** Sender Id */
          senderId: userId,
          /** Sent At */
          sentAt: now,
        },
        /** Unread Count */
        unreadCount: {
          ...currentUnreadCount,
          [recipientId]: (currentUnreadCount[recipientId] || 0) + 1,
        },
        /** Updated At */
        updatedAt: now,
        /** Status */
        status: "active",
      });

      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: {
          /** Message Id */
          messageId: messageRef.id,
          /** Conversation Id */
          conversationId: existingConversation.id,
          /** Is New Conversation */
          isNewConversation: false,
        },
      });
    }

    // Create new conversation
    const conversationRef = db.collection(COLLECTIONS.CONVERSATIONS).doc();
    const conversationData = {
      /** Type */
      type: type || "buyer_seller",
      /** Participants */
      participants: {
        /** Sender */
        sender: {
          /** Id */
          id: userId,
          /** Name */
          name: userName,
          /** Type */
          type: getUserType(auth.role),
        },
        /** Recipient */
        recipient: {
          /** Id */
          id: recipientId,
          /** Name */
          name: recipientName,
          /** Type */
          type: recipientType,
        },
      },
      /** Participant Ids */
      participantIds: [userId, recipientId],
      /** Subject */
      subject: subject || null,
      /** Context */
      context: context || null,
      /** Last Message */
      lastMessage: {
        /** Content */
        content: message.trim(),
        /** Sender Id */
        senderId: userId,
        /** Sent At */
        sentAt: now,
      },
      /** Unread Count */
      unreadCount: {
        [userId]: 0,
        [recipientId]: 1,
      },
      /** Status */
      status: "active",
      /** Created At */
      createdAt: now,
      /** Updated At */
      updatedAt: now,
    };

    await conversationRef.set(conversationData);

    // Create first message
    const messageRef = db.collection(COLLECTIONS.MESSAGES).doc();
    const messageData = {
      /** Conversation Id */
      conversationId: conversationRef.id,
      /** Sender Id */
      senderId: userId,
      /** Sender Name */
      senderName: userName,
      /** Sender Type */
      senderType: getUserType(auth.role),
      /** Content */
      content: message.trim(),
      /** Attachments */
      attachments: [],
      /** Read By */
      readBy: { [userId]: now },
      /** Is Deleted */
      isDeleted: false,
      /** Created At */
      createdAt: now,
    };

    await messageRef.set(messageData);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Conversation Id */
        conversationId: conversationRef.id,
        /** Message Id */
        messageId: messageRef.id,
        /** Is New Conversation */
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
