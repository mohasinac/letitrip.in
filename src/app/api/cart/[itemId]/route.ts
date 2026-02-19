/**
 * Cart Item API Routes
 *
 * PATCH  /api/cart/[itemId]  — Update item quantity (auth required)
 * DELETE /api/cart/[itemId]  — Remove item from cart (auth required)
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { cartRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

// Validation schema for updating cart item
const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "quantity must be at least 1").max(99),
});

/**
 * PATCH /api/cart/[itemId]
 *
 * Update the quantity of a cart item.
 * Body: { quantity: number }
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { itemId } = await context.params;

    const body = await request.json();
    const validation = updateCartItemSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const cart = await cartRepository.updateItem(
      user.uid,
      itemId,
      validation.data,
    );

    return successResponse(
      {
        cart,
        itemCount: cartRepository.getItemCount(cart),
        subtotal: cartRepository.getSubtotal(cart),
      },
      SUCCESS_MESSAGES.CART.ITEM_UPDATED,
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.CART_ITEM_PATCH_ERROR, { error });
    return handleApiError(error);
  }
}

/**
 * DELETE /api/cart/[itemId]
 *
 * Remove a specific item from the user's cart.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { itemId } = await context.params;

    const cart = await cartRepository.removeItem(user.uid, itemId);

    return successResponse(
      {
        cart,
        itemCount: cartRepository.getItemCount(cart),
        subtotal: cartRepository.getSubtotal(cart),
      },
      SUCCESS_MESSAGES.CART.ITEM_REMOVED,
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.CART_ITEM_DELETE_ERROR, { error });
    return handleApiError(error);
  }
}
