"use server";

import { wrapAction } from "@mohasinac/appkit/server";
/**
 * Offer Server Actions — thin entrypoint
 *
 * Authenticates, rate-limits, validates, then delegates to
 * appkit offer domain functions. No business logic here.
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import {
  makeOffer,
  respondToOffer,
  acceptCounterOffer,
  counterOfferByBuyer,
  withdrawOffer,
  listBuyerOffers,
  listSellerOffers,
  checkoutOffer,
  type MakeOfferInput,
  type RespondToOfferInput,
  type BuyerCounterInput,
} from "@mohasinac/appkit";
import type { CartDocument } from "@mohasinac/appkit";
import type { OfferDocument } from "@mohasinac/appkit";
import type { ActionResult } from "@mohasinac/appkit";
import { ERR_RATE_LIMIT } from "./_constants";

// --- Validation schemas ----------------------------------------------------

const makeOfferSchema = z.object({
  productId: z.string().min(1),
  offerAmount: z.number().positive().int(),
  buyerNote: z.string().max(300).optional(),
});

const respondToOfferSchema = z.object({
  offerId: z.string().min(1),
  action: z.enum(["accept", "decline", "counter"]),
  counterAmount: z.number().positive().int().optional(),
  sellerNote: z.string().max(300).optional(),
});

const acceptCounterSchema = z.object({
  offerId: z.string().min(1),
});

const withdrawOfferSchema = z.object({
  offerId: z.string().min(1),
});

const buyerCounterSchema = z.object({
  offerId: z.string().min(1),
  counterAmount: z.number().positive().int(),
  buyerNote: z.string().max(300).optional(),
});

// --- Server Actions --------------------------------------------------------

export async function makeOfferAction(
  input: MakeOfferInput,
): Promise<ActionResult<OfferDocument>> {
  try {
    const user = await requireAuthUser();
    const rl = await rateLimitByIdentifier(`offer:make:${user.uid}`, RateLimitPresets.STRICT);
    if (!rl.success) return { ok: false, error: ERR_RATE_LIMIT };
    const parsed = makeOfferSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid offer data" };
    const data = await makeOffer(user.uid, user.email ?? "", parsed.data as MakeOfferInput);
    return { ok: true, data };
  } catch (err) {
    // Log unexpected failures so Vercel's digest-only prod errors are debuggable.
    if (err instanceof Error && err.message) {
      // eslint-disable-next-line no-console
      console.error("[makeOfferAction]", {
        productId: input?.productId,
        offerAmount: input?.offerAmount,
        message: err.message,
        stack: err.stack,
      });
      return { ok: false, error: err.message };
    }
    // eslint-disable-next-line no-console
    console.error("[makeOfferAction] non-Error throw", { input, err });
    return { ok: false, error: "Failed to submit offer. Please try again." };
  }
}

export async function respondToOfferAction(
  input: RespondToOfferInput,
): Promise<ActionResult<OfferDocument>> {
  try {
    const user = await requireAuthUser();
    const rl = await rateLimitByIdentifier(`offer:respond:${user.uid}`, RateLimitPresets.STRICT);
    if (!rl.success) return { ok: false, error: ERR_RATE_LIMIT };
    const parsed = respondToOfferSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    const data = await respondToOffer(user.uid, parsed.data as RespondToOfferInput);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof Error && err.message) return { ok: false, error: err.message };
    return { ok: false, error: "Failed to respond to offer. Please try again." };
  }
}

export async function acceptCounterOfferAction(
  input: z.infer<typeof acceptCounterSchema>,
): Promise<ActionResult<OfferDocument>> {
  try {
    const user = await requireAuthUser();
    const parsed = acceptCounterSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid input" };
    const data = await acceptCounterOffer(user.uid, parsed.data.offerId);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof Error && err.message) return { ok: false, error: err.message };
    return { ok: false, error: "Failed to accept counter offer. Please try again." };
  }
}

export async function counterOfferByBuyerAction(
  input: BuyerCounterInput,
): Promise<ActionResult<OfferDocument>> {
  try {
    const user = await requireAuthUser();
    const rl = await rateLimitByIdentifier(`offer:buyer-counter:${user.uid}`, RateLimitPresets.STRICT);
    if (!rl.success) return { ok: false, error: ERR_RATE_LIMIT };
    const parsed = buyerCounterSchema.safeParse(input);
    if (!parsed.success)
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid counter offer data" };
    const data = await counterOfferByBuyer(user.uid, user.email ?? "", parsed.data as BuyerCounterInput);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof Error && err.message) return { ok: false, error: err.message };
    return { ok: false, error: "Failed to submit counter offer. Please try again." };
  }
}

export async function withdrawOfferAction(
  input: z.infer<typeof withdrawOfferSchema>,
): Promise<ActionResult<void>> {
  try {
    const user = await requireAuthUser();
    const parsed = withdrawOfferSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid input" };
    await withdrawOffer(user.uid, parsed.data.offerId);
    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message) return { ok: false, error: err.message };
    return { ok: false, error: "Failed to withdraw offer. Please try again." };
  }
}

export async function listBuyerOffersAction(): Promise<ActionResult<OfferDocument[]>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return listBuyerOffers(user.uid);
  });
}

export async function listSellerOffersAction(): Promise<ActionResult<OfferDocument[]>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return listSellerOffers(user.uid);
  });
}

export async function checkoutOfferAction(
  offerId: string,
): Promise<ActionResult<CartDocument>> {
  try {
    const user = await requireAuthUser();
    const rl = await rateLimitByIdentifier(`offer:checkout:${user.uid}`, RateLimitPresets.STRICT);
    if (!rl.success) return { ok: false, error: ERR_RATE_LIMIT };
    const data = await checkoutOffer(user.uid, offerId);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof Error && err.message) return { ok: false, error: err.message };
    return { ok: false, error: "Failed to checkout offer. Please try again." };
  }
}
