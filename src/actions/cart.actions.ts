"use server";

/**
 * Cart Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { ValidationError, AuthorizationError } from "@mohasinac/appkit";
import {
  addItemToCart,
  addBundleToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
  getCart,
} from "@mohasinac/appkit";
import type { CartDocument } from "@mohasinac/appkit";

// --- Validation schemas ----------------------------------------------------

const addToCartSchema = z.object({
  productId: z.string().min(1),
  productTitle: z.string().min(1),
  productImage: z.string(),
  price: z.number().positive(),
  currency: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  storeId: z.string().min(1),
  storeName: z.string().min(1),
  // SB1-G Phase 4 — canonical listing-kind snapshot.
  // SB-UNI-D — "bundle" removed; bundles are a categoryType, not listingType.
  // SB-UNI-F 2026-05-13 — Phase 2 union extension (classified/digital-code/live).
  // appkit's addItemToCart enforces canAddToCart via capabilityFor so
  // classified+live are rejected at the action layer; the zod enum accepts
  // them so generic add-to-cart calls don't 422 before the capability gate.
  listingType: z.enum([
    "standard",
    "auction",
    "pre-order",
    "prize-draw",
    "classified",
    "digital-code",
    "live",
  ]),
  /** Set when item originates from an accepted Make-an-Offer */
  offerId: z.string().optional(),
  /** Locked offer price — used in verify route at checkout */
  lockedPrice: z.number().positive().optional(),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

const mergeGuestCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

// --- Server Actions --------------------------------------------------------

export async function addToCartAction(
  input: z.infer<typeof addToCartSchema>,
): Promise<CartDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `cart:add:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  return addItemToCart(user.uid, parsed.data) as Promise<CartDocument>;
}

// SB-UNI-5 2026-05-13 — bundle add-to-cart wrapper. Foundation lived in
// appkit since S-SBUNI-4; this is the consumer-side server action with
// auth + rate-limit. Per-member stock decrement at order paid is wired in
// _internal/server/features/checkout/actions.ts (same session).
const addBundleToCartSchema = z.object({
  bundleSlug: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(10).default(1),
});

export async function addBundleToCartAction(
  input: z.infer<typeof addBundleToCartSchema>,
): Promise<CartDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `cart:add-bundle:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = addBundleToCartSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  return addBundleToCart(
    user.uid,
    parsed.data.bundleSlug,
    parsed.data.quantity,
  ) as Promise<CartDocument>;
}

export async function updateCartItemAction(
  itemId: string,
  input: z.infer<typeof updateCartItemSchema>,
): Promise<CartDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `cart:update:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!itemId || typeof itemId !== "string")
    throw new ValidationError("itemId is required");

  const parsed = updateCartItemSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  return updateCartItem(user.uid, itemId, parsed.data) as Promise<CartDocument>;
}

export async function removeFromCartAction(
  itemId: string,
): Promise<CartDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `cart:remove:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!itemId || typeof itemId !== "string")
    throw new ValidationError("itemId is required");

  return removeCartItem(user.uid, itemId) as Promise<CartDocument>;
}

export async function clearCartAction(): Promise<CartDocument> {
  const user = await requireAuthUser();
  return clearCart(user.uid) as Promise<CartDocument>;
}

export async function mergeGuestCartAction(
  items: Array<{ productId: string; quantity: number }>,
): Promise<void> {
  const user = await requireAuthUser();
  const parsed = mergeGuestCartSchema.safeParse({ items });
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid items",
    );

  return mergeGuestCart(user.uid, parsed.data.items);
}

// --- Read Actions -------------------------------------------------------------

export async function getCartAction(): Promise<CartDocument | null> {
  const user = await requireAuthUser();
  return getCart(user.uid) as Promise<CartDocument | null>;
}

