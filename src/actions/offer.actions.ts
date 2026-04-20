"use server";

/**
 * Offer Server Actions � thin entrypoint
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
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
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
): Promise<OfferDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(`offer:make:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = makeOfferSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid offer data");
  return makeOffer(user.uid, user.email ?? "", parsed.data as MakeOfferInput);
}

export async function respondToOfferAction(
  input: RespondToOfferInput,
): Promise<OfferDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(`offer:respond:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = respondToOfferSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  return respondToOffer(user.uid, parsed.data as RespondToOfferInput);
}

export async function acceptCounterOfferAction(
  input: z.infer<typeof acceptCounterSchema>,
): Promise<OfferDocument> {
  const user = await requireAuthUser();
  const parsed = acceptCounterSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError("Invalid input");
  return acceptCounterOffer(user.uid, parsed.data.offerId);
}

export async function counterOfferByBuyerAction(
  input: BuyerCounterInput,
): Promise<OfferDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(`offer:buyer-counter:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  const parsed = buyerCounterSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid counter offer data");
  return counterOfferByBuyer(user.uid, user.email ?? "", parsed.data as BuyerCounterInput);
}

export async function withdrawOfferAction(
  input: z.infer<typeof withdrawOfferSchema>,
): Promise<void> {
  const user = await requireAuthUser();
  const parsed = withdrawOfferSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError("Invalid input");
  return withdrawOffer(user.uid, parsed.data.offerId);
}

export async function listBuyerOffersAction(): Promise<OfferDocument[]> {
  const user = await requireAuthUser();
  return listBuyerOffers(user.uid);
}

export async function listSellerOffersAction(): Promise<OfferDocument[]> {
  const user = await requireAuthUser();
  return listSellerOffers(user.uid);
}

export async function checkoutOfferAction(
  offerId: string,
): Promise<CartDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(`offer:checkout:${user.uid}`, RateLimitPresets.STRICT);
  if (!rl.success) throw new AuthorizationError("Too many requests. Please slow down.");
  return checkoutOffer(user.uid, offerId);
}

export type { MakeOfferInput, RespondToOfferInput, BuyerCounterInput };
