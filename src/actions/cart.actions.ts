"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
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
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
  getCart,
  updateCartItemShipping,
} from "@mohasinac/appkit";
import type { CartDocument } from "@mohasinac/appkit";
import { ERR_RATE_LIMIT } from "./_constants";

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
): Promise<ActionResult<CartDocument>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      const rl = await rateLimitByIdentifier(
        `cart:add:${user.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const parsed = addToCartSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid input",
        );
    
      return addItemToCart(user.uid, parsed.data) as Promise<CartDocument>;
  });
}


export async function updateCartItemAction(
  itemId: string,
  input: z.infer<typeof updateCartItemSchema>,
): Promise<ActionResult<CartDocument>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      const rl = await rateLimitByIdentifier(
        `cart:update:${user.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      if (!itemId || typeof itemId !== "string")
        throw new ValidationError("itemId is required");
    
      const parsed = updateCartItemSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid input",
        );
    
      return updateCartItem(user.uid, itemId, parsed.data) as Promise<CartDocument>;
  });
}

export async function removeFromCartAction(
  itemId: string,
): Promise<ActionResult<CartDocument>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      const rl = await rateLimitByIdentifier(
        `cart:remove:${user.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      if (!itemId || typeof itemId !== "string")
        throw new ValidationError("itemId is required");
    
      return removeCartItem(user.uid, itemId) as Promise<CartDocument>;
  });
}

export async function clearCartAction(): Promise<ActionResult<CartDocument>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return clearCart(user.uid) as Promise<CartDocument>;
  });
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

export async function updateCartItemShippingAction(
  itemId: string,
  providerId: string,
  feeInPaise: number,
): Promise<ActionResult<CartDocument>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      const rl = await rateLimitByIdentifier(`cart:shipping:${user.uid}`, RateLimitPresets.API);
      if (!rl.success) throw new AuthorizationError(ERR_RATE_LIMIT);
      return updateCartItemShipping(user.uid, itemId, providerId, feeInPaise) as Promise<CartDocument>;
  });
}

// --- Read Actions -------------------------------------------------------------

export async function getCartAction(): Promise<ActionResult<CartDocument | null>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
      return getCart(user.uid) as Promise<CartDocument | null>;
  });
}

