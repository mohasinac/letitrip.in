import "@/providers.config";
/**
 * POST /api/realtime/token
 *
 * Issues a Firebase custom token for Realtime Database read-only subscriptions.
 */

import { getAdminAuth } from "@mohasinac/appkit/providers/db-firebase";
import { successResponse } from "@mohasinac/appkit/next";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { chatRepository } from "@/repositories";
import { createRouteHandler } from "@mohasinac/appkit/next";

export const POST = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    let chatIds: Record<string, boolean> = {};
    try {
      const userChatIds = await chatRepository.getChatIdsForUser(user!.uid);
      chatIds = Object.fromEntries(userChatIds.map((id) => [id, true]));
    } catch (err) {
      serverLogger.warn("Could not resolve chatIds for realtime token", {
        uid: user!.uid,
        err,
      });
    }

    const customToken = await getAdminAuth().createCustomToken(user!.uid, {
      role: (user as any).role ?? "user",
      chatIds,
    });

    serverLogger.info("Realtime DB custom token issued", {
      uid: user!.uid,
      chatCount: Object.keys(chatIds).length,
    });

    return successResponse({ customToken, expiresAt: Date.now() + 3_600_000 });
  },
});
