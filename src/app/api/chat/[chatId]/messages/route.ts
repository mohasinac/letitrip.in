/**
 * POST /api/chat/[chatId]/messages
 *
 * Send a message in a chat room.
 * - Verifies the user is a participant (buyer or seller) of the given room.
 * - Writes the message to Firebase Realtime Database (Admin SDK — bypasses rules).
 * - Updates the lastMessage preview in Firestore.
 */

import { z } from "zod";
import { chatRepository } from "@/repositories";
import { getAdminRealtimeDb } from "@mohasinac/appkit/providers/db-firebase";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, FEATURE_FLAGS } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { NotFoundError, AuthorizationError } from "@mohasinac/appkit/errors";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@mohasinac/appkit/security";

const MESSAGE_MAX_LENGTH = 1000;

const messageSchema = z.object({
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});

type ChatIdParams = { chatId: string };

export const POST = createApiHandler<
  (typeof messageSchema)["_output"],
  ChatIdParams
>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  schema: messageSchema,
  handler: async ({ user, body, params, request }) => {
    if (!FEATURE_FLAGS.CHAT_ENABLED)
      return errorResponse("Chat is temporarily unavailable", 503);

    const { chatId } = params!;
    const { message } = body!;

    // Verify the room exists and the user is a participant
    const room = await chatRepository.findById(chatId);
    if (!room) throw new NotFoundError(ERROR_MESSAGES.CHAT.FETCH_FAILED);

    if (room.adminDeleted || (room.deletedBy ?? []).includes(user!.uid)) {
      throw new NotFoundError(ERROR_MESSAGES.CHAT.FETCH_FAILED);
    }

    const participantIds = room.participantIds?.length
      ? room.participantIds
      : [room.buyerId, room.sellerId];
    if (!participantIds.includes(user!.uid)) {
      throw new AuthorizationError(ERROR_MESSAGES.CHAT.NOT_AUTHORIZED);
    }

    // Write message to RTDB via Admin SDK (bypasses database rules)
    const rtdb = getAdminRealtimeDb();
    const msgRef = rtdb.ref(`/chat/${chatId}/messages`).push();
    const messageId = msgRef.key as string;

    await msgRef.set({
      userId: user!.uid,
      userName:
        user!.uid === room.buyerId
          ? (room.buyerName ?? "Buyer")
          : user!.uid === room.sellerId
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
      uid: user!.uid,
    });

    return successResponse(
      { messageId, timestamp: Date.now() },
      SUCCESS_MESSAGES.CHAT.MESSAGE_SENT,
      201,
    );
  },
});
