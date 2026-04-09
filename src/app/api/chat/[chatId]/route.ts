/**
 * DELETE /api/chat/[chatId]
 *
 * Deletes (or hides) a chat room for the authenticated user.
 *
 * Semantics:
 * - 1-1 room / regular user: soft-delete (hides room from this user).
 *   When BOTH participants have deleted, the room is permanently purged.
 * - Group room + admin: hard-delete — sets adminDeleted=true and purges RTDB.
 *   All participants instantly lose access.
 *
 * Authorization:
 * - User must be a participant in the room, OR
 * - User must be admin (to hard-delete group chats).
 */

import { chatRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, FEATURE_FLAGS } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { NotFoundError, AuthorizationError } from "@mohasinac/appkit/errors";
import { createApiHandler } from "@/lib/api/api-handler";

export const DELETE = createApiHandler<never, { chatId: string }>({
  auth: true,
  handler: async ({ user, params }) => {
    if (!FEATURE_FLAGS.CHAT_ENABLED)
      return errorResponse("Chat is temporarily unavailable", 503);
    const { chatId } = params!;

    const room = await chatRepository.findById(chatId);
    if (!room) throw new NotFoundError(ERROR_MESSAGES.CHAT.FETCH_FAILED);

    const isAdmin = user!.role === "admin";
    const participantIds = room.participantIds?.length
      ? room.participantIds
      : [room.buyerId, room.sellerId];
    const isParticipant = participantIds.includes(user!.uid);

    if (!isParticipant && !isAdmin) {
      throw new AuthorizationError(ERROR_MESSAGES.CHAT.NOT_AUTHORIZED);
    }

    // Already admin-deleted — nothing to do
    if (room.adminDeleted) {
      return successResponse(
        { deleted: true },
        SUCCESS_MESSAGES.CHAT.ROOM_DELETED,
      );
    }

    if (isAdmin && room.isGroup) {
      await chatRepository.adminHardDelete(chatId);
      serverLogger.info("Admin hard-deleted group chat", {
        chatId,
        adminUid: user!.uid,
      });
    } else {
      const result = await chatRepository.softDeleteForUser(chatId, user!.uid);
      serverLogger.info("Chat soft-deleted for user", {
        chatId,
        uid: user!.uid,
        purged: result === "deleted",
      });
    }

    return successResponse(
      { deleted: true },
      SUCCESS_MESSAGES.CHAT.ROOM_DELETED,
    );
  },
});
