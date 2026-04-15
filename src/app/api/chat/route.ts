/**
 * GET  /api/chat   — list all chat rooms for the authenticated user
 * POST /api/chat   — create or return existing chat room (buyer ↔ seller for an order)
 */

import {
  chatRepository,
  orderRepository,
  userRepository,
} from "@/repositories";
import { getAdminRealtimeDb } from "@mohasinac/appkit/providers/db-firebase";
import { successResponse, errorResponse } from "@mohasinac/appkit/next";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, FEATURE_FLAGS } from "@/constants";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { NotFoundError, AuthorizationError } from "@mohasinac/appkit/errors";
import { z } from "zod";
import { createApiHandler } from "@mohasinac/appkit/http";

const createRoomSchema = z.object({
  orderId: z.string().min(1),
  sellerId: z.string().min(1),
});

const CHAT_DISABLED_RESPONSE = () =>
  errorResponse("Chat is temporarily unavailable", 503);

/**
 * GET /api/chat
 * Returns all chat rooms the authenticated user is participating in.
 */
export const GET = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    if (!FEATURE_FLAGS.CHAT_ENABLED) return CHAT_DISABLED_RESPONSE();
    const rooms = await chatRepository.listForUser(user!.uid);
    return successResponse({ rooms });
  },
});

/**
 * POST /api/chat
 * Creates a chat room for a buyer↔seller conversation on an order.
 * Idempotent — returns the existing room if it already exists.
 */
export const POST = createApiHandler<(typeof createRoomSchema)["_output"]>({
  auth: true,
  schema: createRoomSchema,
  handler: async ({ user, body }) => {
    if (!FEATURE_FLAGS.CHAT_ENABLED) return CHAT_DISABLED_RESPONSE();
    const { orderId, sellerId } = body!;
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);
    if (order.userId !== user!.uid && sellerId !== user!.uid) {
      throw new AuthorizationError(ERROR_MESSAGES.CHAT.NOT_AUTHORIZED);
    }
    const buyerId = order.userId;
    const existing = await chatRepository.findRoom(buyerId, sellerId, orderId);
    if (existing) {
      // Re-open the room for the user if they had previously soft-deleted it
      const deletedBy: string[] = existing.deletedBy ?? [];
      if (deletedBy.includes(user!.uid)) {
        const reopened = deletedBy.filter((id) => id !== user!.uid);
        await chatRepository.update(existing.id, { deletedBy: reopened });
        return successResponse({ room: { ...existing, deletedBy: reopened } });
      }
      return successResponse({ room: existing });
    }
    const [buyer, seller] = await Promise.all([
      userRepository.findById(buyerId),
      userRepository.findById(sellerId),
    ]);
    const room = await chatRepository.create({
      buyerId,
      sellerId,
      orderId,
      productId: (order as any).productId,
      productTitle: (order as any).productTitle,
      buyerName: buyer?.displayName ?? "Buyer",
      sellerName: seller?.displayName ?? "Seller",
      participantIds: [buyerId, sellerId],
      isGroup: false,
    });
    try {
      const rtdb = getAdminRealtimeDb();
      await rtdb.ref(`/chat/${room.id}/metadata`).set({
        chatId: room.id,
        orderId,
        buyerId,
        sellerId,
        createdAt: Date.now(),
      });
    } catch (err) {
      serverLogger.warn("Failed to write chat metadata to RTDB", {
        chatId: room.id,
        err,
      });
    }
    serverLogger.info("Chat room created", {
      chatId: room.id,
      buyerId,
      sellerId,
      orderId,
    });
    return successResponse({ room }, SUCCESS_MESSAGES.CHAT.ROOM_CREATED, 201);
  },
});

