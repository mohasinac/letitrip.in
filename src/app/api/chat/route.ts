/**
 * GET  /api/chat   — list all chat rooms for the authenticated user
 * POST /api/chat   — create or return existing chat room (buyer ↔ seller for an order)
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import {
  chatRepository,
  orderRepository,
  userRepository,
} from "@/repositories";
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "@/lib/errors";
import { z } from "zod";

const createRoomSchema = z.object({
  orderId: z.string().min(1),
  sellerId: z.string().min(1),
});

/**
 * GET /api/chat
 * Returns all chat rooms the authenticated user is participating in.
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();
    const rooms = await chatRepository.listForUser(user.uid);
    return successResponse({ rooms });
  } catch (error) {
    serverLogger.error("GET /api/chat error", { error });
    return handleApiError(error);
  }
}

/**
 * POST /api/chat
 * Creates a chat room for a buyer↔seller conversation on an order.
 * Idempotent — returns the existing room if it already exists.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validation = createRoomSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.FAILED);
    }

    const { orderId, sellerId } = validation.data;

    // Verify the order exists and the user is the buyer
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);
    }
    if (order.userId !== user.uid && sellerId !== user.uid) {
      throw new AuthorizationError(ERROR_MESSAGES.CHAT.NOT_AUTHORIZED);
    }

    const buyerId = order.userId;

    // Idempotent: return existing room if it exists
    const existing = await chatRepository.findRoom(buyerId, sellerId, orderId);
    if (existing) {
      return successResponse({ room: existing });
    }

    // Resolve display names for both participants
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
    });

    // Seed RTDB metadata node (readable by both participants after token issue)
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
  } catch (error) {
    serverLogger.error("POST /api/chat error", { error });
    return handleApiError(error);
  }
}
