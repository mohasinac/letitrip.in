"use server";

/**
 * Bid Server Actions — thin entrypoint
 *
 * Authenticates, rate-limits, validates, then delegates to
 * appkit bid domain functions. No business logic here.
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import {
  placeBid,
  listBidsByProduct,
  getBidById,
} from "@mohasinac/appkit/features/auctions/server";
import type {
  PlaceBidInput,
  PlaceBidResult,
} from "@mohasinac/appkit/features/auctions/server";
import type { BidDocument } from "@mohasinac/appkit/features/auctions";
import type { FirebaseSieveResult } from "@mohasinac/appkit/providers/db-firebase";

// ─── Validation schemas ────────────────────────────────────────────────────

const placeBidSchema = z.object({
  productId: z.string().min(1),
  bidAmount: z.number().positive(),
  autoMaxBid: z.number().positive().optional(),
});

// ─── Server Actions ────────────────────────────────────────────────────────

export async function placeBidAction(
  input: PlaceBidInput,
): Promise<PlaceBidResult> {
  const user = await requireAuthUser();

  const rl = await rateLimitByIdentifier(
    `bid:place:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = placeBidSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid bid data",
    );

  return placeBid(user.uid, user.email ?? "", parsed.data);
}

export async function listBidsByProductAction(
  productId: string,
  params?: { page?: number; pageSize?: number },
): Promise<FirebaseSieveResult<Omit<BidDocument, "userEmail">>> {
  return listBidsByProduct(productId, params);
}

export async function getBidByIdAction(
  id: string,
): Promise<BidDocument | null> {
  return getBidById(id);
}

