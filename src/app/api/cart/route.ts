/**
 * Cart API Routes
 *
 * GET  /api/cart          — Get current user's cart (auth required)
 * POST /api/cart          — Add item to cart (auth required)
 * DELETE /api/cart        — Clear entire cart (auth required)
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { cartRepository } from "@/repositories";
import { productRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

// Validation schema for adding to cart
const addToCartSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.number().int().min(1, "quantity must be at least 1").max(99),
});

/**
 * GET /api/cart
 *
 * Returns the authenticated user's cart.
 * Creates an empty cart if one doesn't exist.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const cart = await cartRepository.getOrCreate(user.uid);
    return successResponse({
      cart,
      itemCount: cartRepository.getItemCount(cart),
      subtotal: cartRepository.getSubtotal(cart),
    });
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.CART_GET_ERROR, { error });
    return handleApiError(error);
  }
}

/**
 * POST /api/cart
 *
 * Add a product to the user's cart.
 * If the product already exists, increments quantity.
 *
 * Body: { productId: string, quantity: number }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);

    // Parse body
    const body = await request.json();
    const validation = addToCartSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const { productId, quantity } = validation.data;

    // Validate product exists and is available
    const product = await productRepository.findById(productId);
    if (!product) {
      return ApiErrors.notFound(ERROR_MESSAGES.CART.PRODUCT_NOT_FOUND);
    }

    if (
      product.status === "out_of_stock" ||
      product.status === "discontinued" ||
      product.status === "sold" ||
      product.status === "draft"
    ) {
      return ApiErrors.badRequest(ERROR_MESSAGES.CART.OUT_OF_STOCK);
    }

    if (product.availableQuantity < quantity) {
      return ApiErrors.badRequest(ERROR_MESSAGES.CART.INSUFFICIENT_STOCK);
    }

    const cart = await cartRepository.addItem(user.uid, {
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
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.CART_POST_ERROR, { error });
    return handleApiError(error);
  }
}

/**
 * DELETE /api/cart
 *
 * Clear all items from the user's cart.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const cart = await cartRepository.clearCart(user.uid);
    return successResponse(
      { cart, itemCount: 0, subtotal: 0 },
      SUCCESS_MESSAGES.CART.CLEARED,
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.CART_GET_ERROR, { error });
    return handleApiError(error);
  }
}
