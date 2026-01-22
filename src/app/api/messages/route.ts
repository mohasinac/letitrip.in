/**
 * Messages API Routes
 *
 * Handle user messaging (seller inquiries, support).
 * Uses session for authentication.
 *
 * @route GET /api/messages - Get user messages
 * @route POST /api/messages - Send message (requires auth)
 *
 * @example
 * ```tsx
 * // Get messages
 * const response = await fetch('/api/messages?type=inbox');
 *
 * // Send message
 * const response = await fetch('/api/messages', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     recipientId: 'seller-id',
 *     subject: 'Product inquiry',
 *     message: 'Is this available?'
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface Message {
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: any;
  productSlug?: string;
  auctionSlug?: string;
  shopSlug?: string;
}

/**
 * GET - Get user messages (inbox/sent)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "inbox"; // inbox, sent
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    );
    const cursor = searchParams.get("cursor");

    // Build query
    const constraints: any[] = [];

    if (type === "inbox") {
      constraints.push(where("recipientId", "==", userId));
    } else if (type === "sent") {
      constraints.push(where("senderId", "==", userId));
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageLimit));

    if (cursor) {
      const cursorDoc = await getDocs(
        query(collection(db, "messages"), where("__name__", "==", cursor)),
      );
      if (!cursorDoc.empty) {
        constraints.push(startAfter(cursorDoc.docs[0]));
      }
    }

    // Execute query
    const messagesQuery = query(collection(db, "messages"), ...constraints);
    const querySnapshot = await getDocs(messagesQuery);

    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          messages,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
          type,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching messages:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch messages",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Send a message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const userName = session.name || session.email || "Anonymous";

    const body = await request.json();
    const {
      recipientId,
      recipientName,
      subject,
      message,
      productSlug,
      auctionSlug,
      shopSlug,
    } = body;

    // Validate required fields
    if (!recipientId || !subject || !message) {
      return NextResponse.json(
        { error: "Recipient, subject, and message are required" },
        { status: 400 },
      );
    }

    // Prevent sending to self
    if (recipientId === userId) {
      return NextResponse.json(
        { error: "Cannot send message to yourself" },
        { status: 400 },
      );
    }

    // Create message document
    const messageData: Message = {
      senderId: userId,
      senderName: userName,
      recipientId,
      recipientName: recipientName || "User",
      subject,
      message,
      isRead: false,
      createdAt: serverTimestamp(),
      ...(productSlug && { productSlug }),
      ...(auctionSlug && { auctionSlug }),
      ...(shopSlug && { shopSlug }),
    };

    const messageRef = await addDoc(collection(db, "messages"), messageData);

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        data: {
          id: messageRef.id,
          ...messageData,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error sending message:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
