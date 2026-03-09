"use server";

/**
 * Seller Server Actions
 *
 * Mutations for seller role application — calls the repository directly,
 * bypassing the service → apiClient → API route chain.
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { userRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError } from "@/lib/errors";
import type { UserDocument } from "@/db/schema";

export interface BecomeSellerActionResult {
  storeStatus: "pending" | "approved" | "rejected";
  alreadySeller?: boolean;
}

/**
 * Apply to become a seller.
 *
 * - Auth required (must be a regular user, not already a seller/admin)
 * - Sets role="seller", storeStatus="pending" on the user document
 * - Returns `alreadySeller: true` if the user is already a seller/admin
 * - Rate-limited by uid (STRICT: 5 req/60 s)
 */
export async function becomeSellerAction(): Promise<BecomeSellerActionResult> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `become-seller:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (user.role === "seller" || user.role === "admin") {
    return {
      alreadySeller: true,
      storeStatus:
        (user.storeStatus as "pending" | "approved" | "rejected") ?? "pending",
    };
  }

  await userRepository.update(user.uid, {
    role: "seller",
    storeStatus: "pending",
  } as Partial<UserDocument>);

  serverLogger.info("becomeSellerAction: application submitted", {
    uid: user.uid,
  });

  return { storeStatus: "pending" };
}
