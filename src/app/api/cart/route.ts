import { withProviders } from "@/providers.config";
/**
 * Cart API Routes
 *
 * GET  /api/cart          — Get current user's cart (auth required)
 * POST /api/cart          — Add item to cart (auth required)
 * DELETE /api/cart        — Clear entire cart (auth required)
 */

import { z } from "zod";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { cartRepository, storeRepository } from "@mohasinac/appkit";
import { productRepository, normalizeListingType } from "@mohasinac/appkit";

import { createRouteHandler } from "@mohasinac/appkit";
import { ProductStatusValues } from "@mohasinac/appkit";
import { CART_MAX_ITEMS } from "@mohasinac/appkit";
import { errorResponse } from "@mohasinac/appkit";
import { getListingRule } from "@mohasinac/appkit";

// Validation schema for adding to cart
const addToCartSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.number().int().min(1, "quantity must be at least 1").max(99),
});

export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const cart = await cartRepository.getOrCreate(user!.uid);

    // Hydrate any cart line missing its `storeName` snapshot from the canonical
    // store doc. One findById per distinct storeId — bounded by distinct stores
    // (typically ≤5) and only fires when the product snapshot lacks it.
    const missing = new Set<string>();
    for (const it of cart.items) {
      if (it.storeId && !it.storeName) missing.add(it.storeId);
    }
    if (missing.size > 0) {
      const entries = await Promise.all(
        Array.from(missing).map(async (sid) => {
          const store = await storeRepository.findById(sid).catch(() => null);
          return [sid, store?.storeName ?? ""] as const;
        }),
      );
      const lookup = new Map(entries);
      cart.items = cart.items.map((it) =>
        it.storeId && !it.storeName
          ? { ...it, storeName: lookup.get(it.storeId) || it.storeName }
          : it,
      );
    }

    return successResponse({
      cart,
      itemCount: cartRepository.getItemCount(cart),
      subtotal: cartRepository.getSubtotal(cart),
    });
  },
}));

export const POST = withProviders(createRouteHandler<(typeof addToCartSchema)["_output"]>({
  auth: true,
  schema: addToCartSchema,
  handler: async ({ user, body }) => {
    const { productId, quantity } = body!;

    // Validate product exists and is available
    const product = await productRepository.findById(productId);
    if (!product) {
      return ApiErrors.notFound(ERROR_MESSAGES.CART.PRODUCT_NOT_FOUND);
    }

    if (
      product.status !== ProductStatusValues.PUBLISHED ||
      product.isSold ||
      (product.availableQuantity !== undefined && product.availableQuantity <= 0)
    ) {
      return ApiErrors.badRequest(ERROR_MESSAGES.CART.OUT_OF_STOCK);
    }

    const listingType = normalizeListingType(product);
    const rule = getListingRule(listingType);
    if (!rule.cartEligible) {
      const hint =
        listingType === "auction"
          ? "Place a bid on the auction page instead."
          : listingType === "classified"
            ? 'Use "Contact Seller" to arrange a meetup.'
            : listingType === "live"
              ? "Jurisdiction check required — buy from the listing page."
              : "This listing type cannot be added to the cart.";
      return ApiErrors.badRequest(
        `Listings of type "${listingType}" cannot be added to the cart. ${hint}`,
      );
    }

    if (product.availableQuantity < quantity) {
      return ApiErrors.badRequest(ERROR_MESSAGES.CART.INSUFFICIENT_STOCK);
    }

    // Cart 50-distinct-items hard cap. Quantity bumps to an existing item are unrestricted.
    const existing = await cartRepository.getOrCreate(user!.uid);
    const alreadyInCart = existing.items.some((i) => i.productId === product.id);
    if (!alreadyInCart && existing.items.length >= CART_MAX_ITEMS) {
      return errorResponse(
        `Cart full (${existing.items.length}/${CART_MAX_ITEMS}). Remove items to add new ones.`,
        409,
        { code: "CART_FULL", limit: CART_MAX_ITEMS, current: existing.items.length },
      );
    }

    // Hydrate storeName from the canonical store doc when the denormalised
    // product snapshot lacks it — prevents the cart UI from falling back to
    // the storeId slug for the group header.
    let storeName = product.storeName ?? "";
    if (!storeName && product.storeId) {
      const store = await storeRepository.findById(product.storeId).catch(() => null);
      storeName = store?.storeName ?? "";
    }

    const cart = await cartRepository.addItem(user!.uid, {
      productId: product.id,
      productTitle: product.title,
      productImage: product.mainImage,
      price: product.price,
      currency: product.currency,
      quantity,
      storeId: product.storeId,
      storeName,
      listingType: normalizeListingType(product),
    });

    return successResponse(
      {
        cart,
        itemCount: cartRepository.getItemCount(cart),
        subtotal: cartRepository.getSubtotal(cart),
      },
      SUCCESS_MESSAGES.CART.ITEM_ADDED,
      201,
    );
  },
}));

export const DELETE = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const cart = await cartRepository.clearCart(user!.uid);
    return successResponse(
      { cart, itemCount: 0, subtotal: 0 },
      SUCCESS_MESSAGES.CART.CLEARED,
    );
  },
}));

