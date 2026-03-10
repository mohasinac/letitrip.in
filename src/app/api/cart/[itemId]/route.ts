/**
 * Cart Item API Routes
 *
 * PATCH  /api/cart/[itemId]  — Update item quantity (auth required)
 * DELETE /api/cart/[itemId]  — Remove item from cart (auth required)
 */

import { z } from "zod";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { cartRepository } from "@/repositories";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "quantity must be at least 1").max(99),
});

/**
 * PATCH /api/cart/[itemId]
 *
 * Update the quantity of a cart item.
 */
export const PATCH = createApiHandler<
  (typeof updateCartItemSchema)["_output"],
  { itemId: string }
>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  schema: updateCartItemSchema,
  handler: async ({ user, body, params }) => {
    const { itemId } = params!;

    const cart = await cartRepository.updateItem(user!.uid, itemId, body!);

    return successResponse(
      {
        cart,
        itemCount: cartRepository.getItemCount(cart),
        subtotal: cartRepository.getSubtotal(cart),
      },
      SUCCESS_MESSAGES.CART.ITEM_UPDATED,
    );
  },
});

/**
 * DELETE /api/cart/[itemId]
 *
 * Remove a specific item from the user's cart.
 */
export const DELETE = createApiHandler<never, { itemId: string }>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
    const { itemId } = params!;

    const cart = await cartRepository.removeItem(user!.uid, itemId);

    return successResponse(
      {
        cart,
        itemCount: cartRepository.getItemCount(cart),
        subtotal: cartRepository.getSubtotal(cart),
      },
      SUCCESS_MESSAGES.CART.ITEM_REMOVED,
    );
  },
});
