"use server";

/**
 * Chat Server Actions
 *
 * READ + WRITE actions for buyer↔seller chat, replacing the former
 * chatService → apiClient → API route chain (5 hops → 2 hops).
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import {
  chatRepository,
  orderRepository,
  userRepository,
} from "@/repositories";
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
const _getAdminRealtimeDb = () =>
  ((module as any).require("@mohasinac/appkit/providers/db-firebase") as typeof import("@mohasinac/appkit/providers/db-firebase")).getAdminRealtimeDb;
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import { FEATURE_FLAGS, ERROR_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { z } from "zod";
import type { ChatRoomDocument } from "@/repositories";

export interface ChatRoomsResult {
  rooms: ChatRoomDocument[];
}

export async function getChatRoomsAction(): Promise<ChatRoomsResult> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `chat:list:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!FEATURE_FLAGS.CHAT_ENABLED)
    throw new AuthorizationError("Chat is temporarily unavailable.");

  const rooms = await chatRepository.listForUser(user.uid);
  return { rooms };
}

const createRoomSchema = z.object({
  orderId: z.string().min(1),
  sellerId: z.string().min(1),
});

export interface CreateRoomResult {
  room: ChatRoomDocument;
}

export async function createOrGetChatRoomAction(input: {
  orderId: string;
  sellerId: string;
}): Promise<CreateRoomResult> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `chat:create:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!FEATURE_FLAGS.CHAT_ENABLED)
    throw new AuthorizationError("Chat is temporarily unavailable.");

  const parsed = createRoomSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const { orderId, sellerId } = parsed.data;
  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);
  if (order.userId !== user.uid && sellerId !== user.uid)
    throw new AuthorizationError(ERROR_MESSAGES.CHAT.NOT_AUTHORIZED);

  const buyerId = order.userId;
  const existing = await chatRepository.findRoom(buyerId, sellerId, orderId);
  if (existing) {
    const deletedBy: string[] = existing.deletedBy ?? [];
    if (deletedBy.includes(user.uid)) {
      const reopened = deletedBy.filter((id) => id !== user.uid);
      await chatRepository.update(existing.id, { deletedBy: reopened });
      return { room: { ...existing, deletedBy: reopened } };
    }
    return { room: existing };
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
  } as any);

  serverLogger.info("createOrGetChatRoomAction: room created", {
    uid: user.uid,
    orderId,
  });

  return { room };
}

export async function sendChatMessageAction(
  chatId: string,
  message: string,
): Promise<{ messageId: string; timestamp: number }> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `chat:send:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!chatId?.trim()) throw new ValidationError("chatId is required");
  if (!message?.trim()) throw new ValidationError("message is required");

  const room = await chatRepository.findById(chatId);
  if (!room) throw new NotFoundError("Chat room not found");
  if (!(room.participantIds ?? []).includes(user.uid))
    throw new AuthorizationError("Not a participant of this chat");

  const messageId = await (async () => {
    const rtdb = _getAdminRealtimeDb()();
    const msgRef = rtdb.ref(`/chat/${chatId}/messages`).push();
    const id = msgRef.key as string;
    const userName =
      user.uid === room.buyerId
        ? (room.buyerName ?? "Buyer")
        : user.uid === room.sellerId
          ? (room.sellerName ?? "Seller")
          : (room.buyerName ?? "Member");
    await msgRef.set({
      userId: user.uid,
      userName,
      message,
      timestamp: Date.now(),
    });
    chatRepository.updateLastMessage(chatId, message).catch((err) => {
      serverLogger.warn("Failed to update chat lastMessage", { chatId, err });
    });
    return id;
  })();

  serverLogger.debug("sendChatMessageAction", { uid: user.uid, chatId });
  return { messageId, timestamp: Date.now() };
}

export async function deleteChatRoomAction(
  chatId: string,
): Promise<{ deleted: boolean }> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `chat:delete:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!chatId?.trim()) throw new ValidationError("chatId is required");

  const room = await chatRepository.findById(chatId);
  if (!room) throw new NotFoundError("Chat room not found");

  const deletedBy: string[] = room.deletedBy ?? [];
  if (!deletedBy.includes(user.uid)) {
    await chatRepository.update(chatId, {
      deletedBy: [...deletedBy, user.uid],
    });
  }

  serverLogger.info("deleteChatRoomAction: soft-deleted", {
    uid: user.uid,
    chatId,
  });
  return { deleted: true };
}
