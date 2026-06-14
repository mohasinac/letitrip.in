"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Realtime Token Server Action ï¿½ thin entrypoint
 */

import { requireAuthUser } from "@mohasinac/appkit";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit";
import { AuthorizationError } from "@mohasinac/appkit";
import { issueRealtimeToken, type RealtimeTokenResult } from "@mohasinac/appkit";

export async function getRealtimeTokenAction(): Promise<ActionResult<RealtimeTokenResult>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      const rl = await rateLimitByIdentifier(`realtime:token:${user.uid}`, RateLimitPresets.STRICT);
      if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
      return issueRealtimeToken(user.uid, (user as any).role ?? "user");
  });
}

