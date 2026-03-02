/**
 * POST /api/realtime/token
 *
 * Issues a Firebase custom token for Realtime Database read-only subscriptions.
 * The token encodes chatIds so the client can subscribe to authorised chat rooms.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { chatRepository } from "@/repositories";
import { ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Resolve the chat rooms this user is a participant in
    let chatIds: Record<string, boolean> = {};
    try {
      const userChatIds = await chatRepository.getChatIdsForUser(user.uid);
      chatIds = Object.fromEntries(userChatIds.map((id) => [id, true]));
    } catch (err) {
      // Non-fatal: user may simply have no chats yet
      serverLogger.warn("Could not resolve chatIds for realtime token", {
        uid: user.uid,
        err,
      });
    }

    const customToken = await getAdminAuth().createCustomToken(user.uid, {
      role: (user as any).role ?? "user",
      chatIds,
    });

    const expiresAt = Date.now() + 3_600_000; // 1 hour

    serverLogger.info("Realtime DB custom token issued", {
      uid: user.uid,
      chatCount: Object.keys(chatIds).length,
    });

    return successResponse({ customToken, expiresAt });
  } catch (error) {
    serverLogger.error("POST /api/realtime/token error", { error });
    return handleApiError(error);
  }
}
