import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
/**
 * POST /api/realtime/token
 *
 * Issues a Firebase custom token for Realtime Database read-only subscriptions.
 *
 * 🛑 Firebase custom claims are capped at **1000 bytes total**. Both id maps
 * below are therefore bounded. They used to be unbounded: `chatIds` was built
 * from every chat room the user had ever participated in, so a high-volume
 * account would blow the cap, `createCustomToken` would throw, and — because
 * that call sat OUTSIDE the try/catch below — the whole route 500'd and admin
 * chat died for exactly the users who used it most.
 */

import { getAdminAuth } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { conversationsRepository } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";

/** Per-map entry cap. See the byte-budget note above. */
const MAX_CLAIM_IDS = 25;

function toClaimMap(ids: readonly string[]): Record<string, boolean> {
  return Object.fromEntries(ids.slice(0, MAX_CLAIM_IDS).map((id) => [id, true]));
}

export const POST = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    let conversationIds: Record<string, boolean> = {};

    try {
      // The user's own store, so seller-side conversations are reachable too.
      // A buyer owns none and this resolves to null.
      const ownStore = await storeRepository
        .findByOwnerId(user!.uid)
        .catch((err: unknown) => {
          void normalizeError(err);
          serverLogger.warn("realtime token: store lookup failed", {
            uid: user!.uid,
            err,
          });
          return null;
        });
      const storeIds = ownStore ? [ownStore.id] : [];

      /*
       * Only `conversationIds` now. The `chatIds` claim served the `chatRooms`
       * collection, which was deleted 2026-08-30: it had been gated off by
       * `FEATURE_FLAGS.CHAT_ENABLED: false` — a `const` literal — so nothing
       * could reach it at runtime, and it had no UI at all.
       *
       * The comment that stood here recorded the related bug: the
       * `chats/$conversationId` rule requires `auth.token.conversationIds[...]`
       * and for a long time nothing issued that claim, because `chatIds` came
       * from the OTHER collection. That is fixed; this removes the half that
       * was pointing at nothing.
       */
      const userConversationIds = await conversationsRepository.getConversationIdsForUser(
        user!.uid,
        storeIds,
        MAX_CLAIM_IDS,
      );

      conversationIds = toClaimMap(userConversationIds);
    } catch (err) {
      void normalizeError(err);
      serverLogger.warn("Could not resolve realtime ids for token", {
        uid: user!.uid,
        err,
      });
    }

    // Inside the handler's own error path by construction: createRouteHandler
    // catches, maps and records anything thrown here. Previously this line sat
    // after a narrower try/catch that covered only the id lookup, so a claim
    // that exceeded the byte budget produced an unhandled 500.
    const customToken = await getAdminAuth().createCustomToken(user!.uid, {
      role: (user as { role?: string }).role ?? "user",
      conversationIds,
    });

    serverLogger.info("Realtime DB custom token issued", {
      uid: user!.uid,
      conversationCount: Object.keys(conversationIds).length,
    });

    return successResponse({ customToken, expiresAt: Date.now() + 3_600_000 });
  },
}));
