"use server";

/**
 * RC Server Actions
 *
 * READ + WRITE actions for RC wallet, replacing the former
 * rcService → apiClient → API route chain (5 hops → 2 hops).
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { userRepository, rcRepository } from "@/repositories";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import type { SieveModel } from "@/lib/query";

export interface RCBalance {
  rcBalance: number;
  engagedRC: number;
}

export async function getRCBalanceAction(): Promise<RCBalance> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `rc:balance:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const userDoc = await userRepository.findById(user.uid);
  return {
    rcBalance: userDoc?.rcBalance ?? 0,
    engagedRC: userDoc?.engagedRC ?? 0,
  };
}

export async function getRCHistoryAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<import("@/lib/query").FirebaseSieveResult<unknown>> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `rc:history:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const model: SieveModel = {
    filters: params?.filters,
    sorts: params?.sorts ?? "-createdAt",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  };

  serverLogger.debug("getRCHistoryAction", { uid: user.uid });
  return rcRepository.listForUser(user.uid, model) as Promise<
    import("@/lib/query").FirebaseSieveResult<unknown>
  >;
}
