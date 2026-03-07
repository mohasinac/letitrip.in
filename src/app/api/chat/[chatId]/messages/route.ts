/**
 * POST /api/chat/[chatId]/messages
 *
 * Send a message in a chat room.
 * - Verifies the user is a participant (buyer or seller) of the given room.
 * - Writes the message to Firebase Realtime Database (Admin SDK — bypasses rules).
 * - Updates the lastMessage preview in Firestore.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { chatRepository } from "@/repositories";
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, FEATURE_FLAGS } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "@/lib/errors";
import { z } from "zod";

const MESSAGE_MAX_LENGTH = 1000;

const messageSchema = z.object({
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (!FEATURE_FLAGS.CHAT_ENABLED)
      return errorResponse("Chat is temporarily unavailable", 503);
    const user = await requireAuth();
    const { chatId } = await params;

    const body = await request.json();
    const validation = messageSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(ERROR_MESSAGES.CHAT.MESSAGE_TOO_LONG);
    }

    const { message } = validation.data;

    // Verify the room exists and the user is a participant
    const room = await chatRepository.findById(chatId);
    if (!room) {
      throw new NotFoundError(ERROR_MESSAGES.CHAT.FETCH_FAILED);
    }

    // Reject if the room was admin-deleted or the user has personally deleted it
    if (room.adminDeleted || (room.deletedBy ?? []).includes(user.uid)) {
      throw new NotFoundError(ERROR_MESSAGES.CHAT.FETCH_FAILED);
    }

    // Support both 1-1 (buyerId/sellerId) and group (participantIds) rooms
    const participantIds = room.participantIds?.length
      ? room.participantIds
      : [room.buyerId, room.sellerId];
    if (!participantIds.includes(user.uid)) {
      throw new AuthorizationError(ERROR_MESSAGES.CHAT.NOT_AUTHORIZED);
    }

    // Write message to RTDB via Admin SDK (bypasses database rules)
    const rtdb = getAdminRealtimeDb();
    const msgRef = rtdb.ref(`/chat/${chatId}/messages`).push();
    const messageId = msgRef.key as string;

    await msgRef.set({
      userId: user.uid,
      userName:
        user.uid === room.buyerId
          ? (room.buyerName ?? "Buyer")
          : user.uid === room.sellerId
            ? (room.sellerName ?? "Seller")
            : (room.buyerName ?? "Member"),
      message,
      timestamp: Date.now(),
    });

    // Update last message preview in Firestore (non-blocking)
    chatRepository.updateLastMessage(chatId, message).catch((err) => {
      serverLogger.warn("Failed to update chat lastMessage", { chatId, err });
    });

    serverLogger.info("Chat message sent", {
      chatId,
      messageId,
      uid: user.uid,
    });

    return successResponse(
      { messageId, timestamp: Date.now() },
      SUCCESS_MESSAGES.CHAT.MESSAGE_SENT,
      201,
    );
  } catch (error) {
    serverLogger.error("POST /api/chat/[chatId]/messages error", { error });
    return handleApiError(error);
  }
}
