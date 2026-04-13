"use server";

/**
 * Realtime Token Server Action
 *
 * Issues a Firebase custom token for Realtime Database read-only subscriptions,
 * replacing the former realtimeTokenService → apiClient → /api/realtime/token
 * chain (5 hops → 2 hops).
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { chatRepository } from "@/repositories";
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
const _getAdminAuth = () =>
  ((module as any).require("@mohasinac/appkit/providers/db-firebase") as typeof import("@mohasinac/appkit/providers/db-firebase")).getAdminAuth;
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@/lib/server-logger";

export interface RealtimeTokenResult {
  customToken: string;
  expiresAt: number;
}

export async function getRealtimeTokenAction(): Promise<RealtimeTokenResult> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `realtime:token:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  let chatIds: Record<string, boolean> = {};
  try {
    const userChatIds = await chatRepository.getChatIdsForUser(user.uid);
    chatIds = Object.fromEntries(userChatIds.map((id) => [id, true]));
  } catch (err) {
    serverLogger.warn("Could not resolve chatIds for realtime token", {
      uid: user.uid,
      err,
    });
  }

  const customToken = await _getAdminAuth()().createCustomToken(user.uid, {
    role: (user as any).role ?? "user",
    chatIds,
  });

  serverLogger.info("getRealtimeTokenAction: token issued", {
    uid: user.uid,
    chatCount: Object.keys(chatIds).length,
  });

  return { customToken, expiresAt: Date.now() + 3_600_000 };
}
