"use server";

/**
 * Realtime Token Server Action — thin entrypoint
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit/security";
import { AuthorizationError } from "@mohasinac/appkit/errors";
import { issueRealtimeToken, type RealtimeTokenResult } from "@mohasinac/appkit/features/auth";

export async function getRealtimeTokenAction(): Promise<RealtimeTokenResult> {
  const user = await requireAuth();
  const rl = await rateLimitByIdentifier(`realtime:token:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  return issueRealtimeToken(user.uid, (user as any).role ?? "user");
}

export type { RealtimeTokenResult };
