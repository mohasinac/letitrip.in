"use server";

/**
 * Chat Server Actions � thin entrypoint
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import {
  getChatRooms,
  createOrGetChatRoom,
  sendChatMessage,
  deleteChatRoom,
} from "@mohasinac/appkit/features/admin/server";
import type {
  ChatRoomsResult,
  CreateRoomResult,
} from "@mohasinac/appkit/features/admin/server";
import { FEATURE_FLAGS } from "@mohasinac/appkit/core";

const createRoomSchema = z.object({
  orderId: z.string().min(1),
  sellerId: z.string().min(1),
});

export async function getChatRoomsAction(): Promise<ChatRoomsResult> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(`chat:list:${user.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  return getChatRooms(user.uid, FEATURE_FLAGS.CHAT_ENABLED);
}

export async function createOrGetChatRoomAction(input: { orderId: string; sellerId: string }): Promise<CreateRoomResult> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(`chat:create:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = createRoomSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  return createOrGetChatRoom(user.uid, FEATURE_FLAGS.CHAT_ENABLED, parsed.data);
}

export async function sendChatMessageAction(chatId: string, message: string): Promise<{ messageId: string; timestamp: number }> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(`chat:send:${user.uid}`, RateLimitPresets.API);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  return sendChatMessage(user.uid, chatId, message);
}

export async function deleteChatRoomAction(chatId: string): Promise<{ deleted: boolean }> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(`chat:delete:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  return deleteChatRoom(user.uid, chatId);
}
