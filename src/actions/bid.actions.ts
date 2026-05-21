"use server";

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
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
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

export type PlaceBidActionResult =
  | { ok: true; data: PlaceBidResult }
  | { ok: false; error: string; code?: string };

export async function placeBidAction(
  input: PlaceBidInput,
): Promise<PlaceBidActionResult> {
  try {
    const user = await requireAuthUser();

    const rl = await rateLimitByIdentifier(
      `bid:place:${user.uid}`,
      RateLimitPresets.STRICT,
    );
    if (!rl.success)
      return { ok: false, error: "Too many requests. Please slow down." };

    const parsed = placeBidSchema.safeParse(input);
    if (!parsed.success)
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid bid data",
      };

    const data = await placeBid(user.uid, user.email ?? "", parsed.data);
    return { ok: true, data };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError)
      return { ok: false, error: "Please sign in to place a bid." };
    if (err instanceof ValidationError) {
      const veData = "data" in err ? (err as { data?: unknown }).data : undefined;
      return {
        ok: false,
        error: err.message,
        code: (veData as { code?: string } | undefined)?.code,
      };
    }
    if (err instanceof Error && err.message)
      return { ok: false, error: err.message };
    return { ok: false, error: "Failed to place bid. Please try again." };
  }
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

export type BuyNowActionResult =
  | { ok: true; data: BuyNowAuctionResult }
  | { ok: false; error: string; code?: string };

export async function buyNowAction(
  productId: string,
): Promise<BuyNowActionResult> {
  try {
    const user = await requireAuthUser();

    const rl = await rateLimitByIdentifier(
      `auction:buynow:${user.uid}`,
      RateLimitPresets.STRICT,
    );
    if (!rl.success)
      return { ok: false, error: "Too many requests. Please slow down." };

    const data = await buyNowAuction(
      user.uid,
      (user as any).displayName ?? user.email ?? "Unknown User",
      user.email ?? "",
      { productId },
    );
    return { ok: true, data };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError)
      return { ok: false, error: "Please sign in to purchase." };
    if (err instanceof ValidationError) {
      const veData = "data" in err ? (err as { data?: unknown }).data : undefined;
      return {
        ok: false,
        error: err.message,
        code: (veData as { code?: string } | undefined)?.code,
      };
    }
    if (err instanceof Error && err.message)
      return { ok: false, error: err.message };
    return { ok: false, error: "Buy Now failed. Please try again." };
  }
}

