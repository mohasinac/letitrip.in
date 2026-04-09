"use server";

/**
 * Cart Server Actions
 *
 * Mutations for the shopping cart that call the repository directly,
 * bypassing the service → apiClient → API route chain.
 *
 * Can be imported directly in components or feature hooks:
 *   import { addToCartAction } from "@/actions";
 */

import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import { cartRepository, productRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { ValidationError, AuthorizationError } from "@mohasinac/appkit/errors";
import type { CartDocument } from "@/db/schema";

// ─── Validation schemas ────────────────────────────────────────────────────

const addToCartSchema = z.object({
  productId: z.string().min(1),
  productTitle: z.string().min(1),
  productImage: z.string(),
  price: z.number().positive(),
  currency: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
  isAuction: z.boolean().optional(),
  isPreOrder: z.boolean().optional(),
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

// ─── Server Actions ────────────────────────────────────────────────────────

/**
 * Add an item to the authenticated user's cart.
 * Called by `useAddToCart` for authenticated sessions.
 */
export async function addToCartAction(
  input: z.infer<typeof addToCartSchema>,
): Promise<CartDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `cart:add:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  serverLogger.debug("addToCartAction", {
    uid: user.uid,
    productId: parsed.data.productId,
  });
  return cartRepository.addItem(user.uid, parsed.data);
}

/**
 * Update an item's quantity in the authenticated user's cart.
 */
export async function updateCartItemAction(
  itemId: string,
  input: z.infer<typeof updateCartItemSchema>,
): Promise<CartDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `cart:update:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!itemId || typeof itemId !== "string") {
    throw new ValidationError("itemId is required");
  }

  const parsed = updateCartItemSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  return cartRepository.updateItem(user.uid, itemId, parsed.data);
}

/**
 * Remove an item from the authenticated user's cart.
 */
export async function removeFromCartAction(
  itemId: string,
): Promise<CartDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `cart:remove:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!itemId || typeof itemId !== "string") {
    throw new ValidationError("itemId is required");
  }

  return cartRepository.removeItem(user.uid, itemId);
}

/**
 * Clear all items from the authenticated user's cart.
 */
export async function clearCartAction(): Promise<CartDocument> {
  const user = await requireAuth();
  return cartRepository.clearCart(user.uid);
}

/**
 * Merge guest (localStorage) cart items into the authenticated user's server cart.
 * Called by `useGuestCartMerge` immediately after login.
 * Skips products that are unavailable or out of stock.
 */
export async function mergeGuestCartAction(
  items: Array<{ productId: string; quantity: number }>,
): Promise<void> {
  const user = await requireAuth();

  const parsed = mergeGuestCartSchema.safeParse({ items });
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid items",
    );
  }

  await cartRepository.getOrCreate(user.uid);

  for (const item of parsed.data.items) {
    const product = await productRepository.findById(item.productId);
    if (!product || product.status !== "published") continue;
    if (product.availableQuantity < 1) continue;

    const safeQty = Math.min(item.quantity, product.availableQuantity);

    await cartRepository.addItem(user.uid, {
      productId: product.id,
      productTitle: product.title,
      productImage: product.images?.[0] ?? "",
      price: product.price,
      currency: product.currency ?? "INR",
      quantity: safeQty,
      sellerId: product.sellerId,
      sellerName: product.sellerName ?? "",
      isAuction: product.isAuction ?? false,
    });
  }

  serverLogger.info("Guest cart merged via Server Action", {
    uid: user.uid,
    itemCount: parsed.data.items.length,
  });
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function getCartAction(): Promise<CartDocument | null> {
  const user = await requireAuth();
  return cartRepository.findByUserId(user.uid);
}
