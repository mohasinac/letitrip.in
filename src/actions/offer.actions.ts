"use server";

/**
 * Offer Server Actions
 *
 * Make an Offer feature — buyer and seller lifecycle mutations.
 * Calls repositories directly (no HTTP hop).
 */

import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import {
  offerRepository,
  productRepository,
  notificationRepository,
  userRepository,
  cartRepository,
} from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from "@mohasinac/appkit/errors";
import { ERROR_MESSAGES } from "@/constants";
import type { CartDocument, OfferDocument } from "@/db/schema";
import { maskOfferForSeller } from "@/lib/pii";

// ─── Validation schemas ────────────────────────────────────────────────────

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

export type MakeOfferInput = z.infer<typeof makeOfferSchema>;
export type RespondToOfferInput = z.infer<typeof respondToOfferSchema>;
export type BuyerCounterInput = z.infer<typeof buyerCounterSchema>;

// ─── Buyer: Make an Offer ──────────────────────────────────────────────────

export async function makeOfferAction(
  input: MakeOfferInput,
): Promise<OfferDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `offer:make:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = makeOfferSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid offer data",
    );

  const { productId, offerAmount, buyerNote } = parsed.data;

  // Validate product exists and allows offers
  const product = await productRepository.findById(productId);
  if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
  if (!product.allowOffers)
    throw new ValidationError("This product does not accept offers.");

  const minAllowed = Math.ceil(
    product.price * ((product.minOfferPercent ?? 70) / 100),
  );
  if (offerAmount < minAllowed)
    throw new ValidationError(
      `Minimum offer is ₹${minAllowed} (${product.minOfferPercent ?? 70}% of listing price).`,
    );
  if (offerAmount >= product.price)
    throw new ValidationError(
      "Your offer must be below the listed price. Use Add to Cart instead.",
    );

  // ── Enforce 3-offer limit per product (resets when product.updatedAt advances) ─
  const offerCount = await offerRepository.countByBuyerAndProduct(
    user.uid,
    productId,
    product.updatedAt,
  );
  if (offerCount >= 3)
    throw new ValidationError(ERROR_MESSAGES.OFFER.LIMIT_REACHED);

  // ── Prevent duplicate active offers on the same product ──────────────────
  const alreadyActive = await offerRepository.hasActiveOffer(
    user.uid,
    productId,
  );
  if (alreadyActive)
    throw new ValidationError(ERROR_MESSAGES.OFFER.ACTIVE_OFFER_EXISTS);

  const profile = await userRepository.findById(user.uid);
  const buyerDisplayName = profile?.displayName ?? "Buyer";

  const offer = await offerRepository.create({
    productId,
    productTitle: product.title,
    productSlug: product.slug,
    productImageUrl: product.mainImage,
    buyerUid: user.uid,
    buyerName: buyerDisplayName,
    buyerEmail: profile?.email ?? user.email ?? "",
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    offerAmount,
    listedPrice: product.price,
    currency: product.currency,
    buyerNote,
  });

  // Notify seller
  await notificationRepository.create({
    userId: product.sellerId,
    type: "offer_received",
    priority: "normal",
    title: "New offer received",
    message: `${buyerDisplayName === "Buyer" ? "A buyer" : buyerDisplayName} offered ₹${offerAmount} on "${product.title}"`,
    relatedId: offer.id,
    relatedType: "offer",
  });

  serverLogger.info("Offer created", {
    offerId: offer.id,
    buyerUid: user.uid,
    productId,
    offerAmount,
  });

  return offer;
}

// ─── Seller: Respond (accept / decline / counter) ─────────────────────────

export async function respondToOfferAction(
  input: RespondToOfferInput,
): Promise<OfferDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `offer:respond:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = respondToOfferSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const { offerId, action, counterAmount, sellerNote } = parsed.data;

  const offer = await offerRepository.findById(offerId);
  if (!offer) throw new NotFoundError("Offer not found.");
  if (offer.sellerId !== user.uid)
    throw new AuthorizationError("Not authorised to respond to this offer.");
  if (offer.status !== "pending")
    throw new ValidationError(
      `Offer is already ${offer.status}. No further action is possible.`,
    );
  if (new Date() > offer.expiresAt)
    throw new ValidationError(ERROR_MESSAGES.OFFER.EXPIRED);

  let updated: OfferDocument;

  if (action === "accept") {
    updated = await offerRepository.accept(
      offerId,
      offer.offerAmount,
      sellerNote,
    );
  } else if (action === "decline") {
    updated = await offerRepository.decline(offerId, sellerNote);
  } else {
    if (!counterAmount)
      throw new ValidationError("Counter amount is required when countering.");
    if (counterAmount >= offer.listedPrice)
      throw new ValidationError("Counter must be below the listed price.");
    if (counterAmount === offer.offerAmount)
      throw new ValidationError(
        "Counter amount must differ from the buyer's offer. Accept it instead.",
      );
    updated = await offerRepository.counter(offerId, counterAmount, sellerNote);
  }

  // Notify buyer
  const notifMessage =
    action === "accept"
      ? `Your offer of ₹${offer.offerAmount} on "${offer.productTitle}" was accepted! Complete checkout now.`
      : action === "decline"
        ? `Your offer on "${offer.productTitle}" was declined.`
        : `${offer.sellerName} countered with ₹${counterAmount} on "${offer.productTitle}".`;

  await notificationRepository.create({
    userId: offer.buyerUid,
    type: "offer_responded",
    priority: action === "accept" ? "high" : "normal",
    title:
      action === "accept"
        ? "Offer accepted!"
        : action === "decline"
          ? "Offer declined"
          : "Counter offer received",
    message: notifMessage,
    relatedId: offerId,
    relatedType: "offer",
  });

  serverLogger.info(`Offer ${action}d by seller`, {
    offerId,
    sellerUid: user.uid,
    action,
  });

  return updated;
}

// ─── Buyer: Accept counter ─────────────────────────────────────────────────

export async function acceptCounterOfferAction(
  input: z.infer<typeof acceptCounterSchema>,
): Promise<OfferDocument> {
  const user = await requireAuth();

  const parsed = acceptCounterSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError("Invalid input");

  const offer = await offerRepository.findById(parsed.data.offerId);
  if (!offer) throw new NotFoundError("Offer not found.");
  if (offer.buyerUid !== user.uid)
    throw new AuthorizationError("Not authorised.");
  if (offer.status !== "countered")
    throw new ValidationError("No counter to accept.");
  if (new Date() > offer.expiresAt)
    throw new ValidationError(ERROR_MESSAGES.OFFER.EXPIRED);

  const counterAmount = offer.counterAmount ?? offer.offerAmount;

  const updated = await offerRepository.acceptCounter(parsed.data.offerId);

  await notificationRepository.create({
    userId: offer.sellerId,
    type: "offer_counter_accepted",
    priority: "high",
    title: "Counter offer accepted",
    message: `Buyer accepted your counter of ₹${offer.counterAmount} on "${offer.productTitle}". They can now checkout.`,
    relatedId: parsed.data.offerId,
    relatedType: "offer",
  });

  return updated;
}

// ─── Buyer: Counter the seller's counter ──────────────────────────────────

/**
 * Called when a buyer wants to counter back after a seller issued a counter offer.
 *
 * Rules enforced:
 *  1. `counterAmount` must be within ±20 % of the seller's counterAmount.
 *  2. Buyer may submit at most 3 offer documents per product since
 *     the product was last updated — tracked purely by document count.
 *
 * The previous `countered` offer is closed (withdrawn) and a fresh
 * offer document is created at the buyer's new price.
 */
export async function counterOfferByBuyerAction(
  input: BuyerCounterInput,
): Promise<OfferDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `offer:buyer-counter:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = buyerCounterSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid counter offer data",
    );

  const { offerId, counterAmount, buyerNote } = parsed.data;

  // Load the offer that is currently in `countered` state
  const offer = await offerRepository.findById(offerId);
  if (!offer) throw new NotFoundError("Offer not found.");
  if (offer.buyerUid !== user.uid)
    throw new AuthorizationError("Not authorised.");
  if (offer.status !== "countered")
    throw new ValidationError(ERROR_MESSAGES.OFFER.NOT_COUNTERED);
  if (new Date() > offer.expiresAt)
    throw new ValidationError(ERROR_MESSAGES.OFFER.EXPIRED);

  const sellerCounter = offer.counterAmount!;

  // ── ±20 % range check against seller's counter ───────────────────────────
  const minAllowed = Math.floor(sellerCounter * 0.8);
  const maxAllowed = Math.ceil(sellerCounter * 1.2);
  if (counterAmount < minAllowed || counterAmount > maxAllowed)
    throw new ValidationError(
      `${ERROR_MESSAGES.OFFER.COUNTER_RANGE} Allowed: ₹${minAllowed}–₹${maxAllowed}.`,
    );

  // Must stay below listed price even if buyer counters above seller's counter
  if (counterAmount >= offer.listedPrice)
    throw new ValidationError(
      "Counter offer cannot reach or exceed the listed price. Accept the seller's counter instead.",
    );

  // ── Load product to get updatedAt for document-count limit ───────────────
  const product = await productRepository.findById(offer.productId);
  if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);

  const offerCount = await offerRepository.countByBuyerAndProduct(
    user.uid,
    offer.productId,
    product.updatedAt,
  );
  if (offerCount >= 3)
    throw new ValidationError(ERROR_MESSAGES.OFFER.LIMIT_REACHED);

  // ── Close old offer ───────────────────────────────────────────────────────
  await offerRepository.withdraw(offerId);

  // ── Create fresh offer doc at buyer's counter price ───────────────────────
  const newOffer = await offerRepository.create({
    productId: offer.productId,
    productTitle: offer.productTitle,
    productSlug: offer.productSlug,
    productImageUrl: offer.productImageUrl,
    buyerUid: user.uid,
    buyerName: offer.buyerName,
    buyerEmail: offer.buyerEmail,
    sellerId: offer.sellerId,
    sellerName: offer.sellerName,
    offerAmount: counterAmount,
    listedPrice: offer.listedPrice,
    currency: offer.currency,
    buyerNote,
  });

  // ── Notify seller ─────────────────────────────────────────────────────────
  await notificationRepository.create({
    userId: offer.sellerId,
    type: "offer_received",
    priority: "normal",
    title: "Buyer counter offer",
    message: `${offer.buyerName} countered with ₹${counterAmount} on "${offer.productTitle}".`,
    relatedId: newOffer.id,
    relatedType: "offer",
  });

  serverLogger.info("Buyer counter offer created", {
    previousOfferId: offerId,
    newOfferId: newOffer.id,
    buyerUid: user.uid,
    productId: offer.productId,
    counterAmount,
  });

  return newOffer;
}

// ─── Buyer: Withdraw offer ─────────────────────────────────────────────────

export async function withdrawOfferAction(
  input: z.infer<typeof withdrawOfferSchema>,
): Promise<void> {
  const user = await requireAuth();

  const parsed = withdrawOfferSchema.safeParse(input);
  if (!parsed.success) throw new ValidationError("Invalid input");

  const offer = await offerRepository.findById(parsed.data.offerId);
  if (!offer) throw new NotFoundError("Offer not found.");
  if (offer.buyerUid !== user.uid)
    throw new AuthorizationError("Not authorised.");
  if (offer.status === "expired")
    throw new ValidationError("This offer has already expired.");
  if (!["pending", "countered"].includes(offer.status))
    throw new ValidationError("Offer cannot be withdrawn at this stage.");

  await offerRepository.withdraw(parsed.data.offerId);

  serverLogger.info("Offer withdrawn by buyer", {
    offerId: parsed.data.offerId,
    buyerUid: user.uid,
  });
}

// ─── Read helpers ──────────────────────────────────────────────────────────

export async function listBuyerOffersAction(): Promise<OfferDocument[]> {
  const user = await requireAuth();
  const result = await offerRepository.findByBuyer(user.uid);
  return result.items;
}

export async function listSellerOffersAction(): Promise<OfferDocument[]> {
  const user = await requireAuth();
  const result = await offerRepository.findBySeller(user.uid);
  return result.items.map(maskOfferForSeller);
}

// ─── Buyer: Checkout accepted offer ────────────────────────────────────────

/**
 * Add an accepted offer item to the cart at the locked price.
 */
export async function checkoutOfferAction(
  offerId: string,
): Promise<CartDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `offer:checkout:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const offer = await offerRepository.findById(offerId);
  if (!offer) throw new NotFoundError("Offer not found.");
  if (offer.buyerUid !== user.uid)
    throw new AuthorizationError("Not authorised.");
  if (offer.status !== "accepted")
    throw new ValidationError(
      "Only accepted offers can be checked out. Check your offers page.",
    );
  if (!offer.lockedPrice)
    throw new ValidationError("Offer price not confirmed. Contact support.");

  const product = await productRepository.findById(offer.productId);
  if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
  if (
    (product.availableQuantity ?? 0) <= 0 ||
    product.status === "discontinued" ||
    product.status === "sold"
  )
    throw new ValidationError(ERROR_MESSAGES.OFFER.PRODUCT_UNAVAILABLE);

  serverLogger.info("checkoutOfferAction — adding to cart", {
    offerId,
    buyerUid: user.uid,
    lockedPrice: offer.lockedPrice,
  });

  return cartRepository.addItem(user.uid, {
    productId: offer.productId,
    productTitle: offer.productTitle,
    productImage: offer.productImageUrl ?? product.mainImage ?? "",
    price: offer.lockedPrice,
    currency: offer.currency,
    quantity: 1,
    sellerId: offer.sellerId,
    sellerName: offer.sellerName,
    isAuction: false,
    isPreOrder: false,
    isOffer: true,
    offerId: offer.id,
    lockedPrice: offer.lockedPrice,
  });
}
