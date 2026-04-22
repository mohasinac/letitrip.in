import { withProviders } from "@/providers.config";
/**
 * Cart API Routes
 *
 * GET  /api/cart          — Get current user's cart (auth required)
 * POST /api/cart          — Add item to cart (auth required)
 * DELETE /api/cart        — Clear entire cart (auth required)
 */

import { z } from "zod";
import { handleApiError } from "@mohasinac/appkit";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { cartRepository } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { ProductStatusValues } from "@mohasinac/appkit";

// Validation schema for adding to cart
const addToCartSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.number().int().min(1, "quantity must be at least 1").max(99),
});

export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const cart = await cartRepository.getOrCreate(user!.uid);
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
      product.status === ProductStatusValues.OUT_OF_STOCK ||
      product.status === ProductStatusValues.DISCONTINUED ||
      product.status === ProductStatusValues.SOLD ||
      product.status === ProductStatusValues.DRAFT
    ) {
      return ApiErrors.badRequest(ERROR_MESSAGES.CART.OUT_OF_STOCK);
    }

    if (product.availableQuantity < quantity) {
      return ApiErrors.badRequest(ERROR_MESSAGES.CART.INSUFFICIENT_STOCK);
    }

    const cart = await cartRepository.addItem(user!.uid, {
      productId: product.id,
      productTitle: product.title,
      productImage: product.mainImage,
      price: product.price,
      currency: product.currency,
      quantity,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      isAuction: product.isAuction ?? false,
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

