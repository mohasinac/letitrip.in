"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Bid Server Actions — thin entrypoint
 *
 * Authenticates, rate-limits, validates, then delegates to
 * appkit bid domain functions. No business logic here.
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { ApiError, ValidationError } from "@mohasinac/appkit";
import {
  placeBid,
  buyNowAuction,
  listBidsByProduct,
  getBidById,
} from "@mohasinac/appkit";
import type {
  PlaceBidInput,
  PlaceBidResult,
  BuyNowAuctionResult,
} from "@mohasinac/appkit";
import type { BidDocument } from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";

// --- Validation schemas ----------------------------------------------------

const placeBidSchema = z.object({
  productId: z.string().min(1),
  bidAmount: z.number().positive(),
  autoMaxBid: z.number().positive().optional(),
});

// --- Server Actions --------------------------------------------------------

/**
 * 🛑 ONE envelope, produced by `wrapAction`. Never add a second.
 *
 * Both actions in this file used to `return { ok, data }` from INSIDE
 * `wrapAction`, so the value on the wire was
 * `{ ok: true, data: { ok: false, error: "AUCTION_ENDED" } }` — the outer `ok`
 * was `true` for every possible outcome, including every failure.
 * `PlaceBidFormClient` reads the outer `ok`, so success, `BUY_NOW_UNAVAILABLE`,
 * rate-limits and "please sign in" all took the same branch, and the buyout's
 * `checkoutUrl` (read one level too shallow) was always `undefined`. Buy Now
 * placed a real bid and a real locked cart line and then told the buyer
 * nothing — the reported "just for show" bug.
 *
 * Throw instead of returning a failure shape: `wrapAction` maps every AppError
 * subclass to `{ ok: false, code, error }` via `mapToHttpError`, which is
 * strictly more information than the hand-rolled catch produced.
 */
export async function placeBidAction(
  input: PlaceBidInput,
): Promise<ActionResult<PlaceBidResult>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();

    const rl = await rateLimitByIdentifier(
      `bid:place:${user.uid}`,
      RateLimitPresets.STRICT,
    );
    if (!rl.success)
      throw new ApiError(429, "Too many requests. Please slow down.");

    const parsed = placeBidSchema.safeParse(input);
    if (!parsed.success)
      throw new ValidationError(
        parsed.error.issues[0]?.message ?? "Invalid bid data",
        parsed.error,
      );

    return placeBid(user.uid, user.email ?? "", parsed.data);
  });
}

export async function listBidsByProductAction(
  productId: string,
  params?: { page?: number; pageSize?: number },
): Promise<ActionResult<FirebaseSieveResult<Omit<BidDocument, "userEmail">>>> {
  return wrapAction(async () => {
    return listBidsByProduct(productId, params);
  });
}

export async function getBidByIdAction(
  id: string,
): Promise<ActionResult<BidDocument | null>> {
  return wrapAction(async () => {
    return getBidById(id);
  });
}

/** See the note on `placeBidAction` — single envelope, throw to fail. */
export async function buyNowAction(
  productId: string,
): Promise<ActionResult<BuyNowAuctionResult>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();

    const rl = await rateLimitByIdentifier(
      `auction:buynow:${user.uid}`,
      RateLimitPresets.STRICT,
    );
    if (!rl.success)
      throw new ApiError(429, "Too many requests. Please slow down.");

    // `AuthPayload` carries the provider display name as `name`, NOT
    // `displayName`. This read used to be `(user as any).displayName`, which is
    // always undefined — so every buyout recorded the buyer's raw email as
    // their public bidder name. The cast is what hid it (Root Cause #45).
    return buyNowAuction(
      user.uid,
      user.name ?? user.email ?? "Unknown User",
      user.email ?? "",
      { productId },
    );
  });
}

