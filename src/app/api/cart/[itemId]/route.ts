/**
 * Cart Item API Routes
 *
 * PATCH  /api/cart/[itemId]  — Update a cart line's quantity (auth required)
 * DELETE /api/cart/[itemId]  — Remove a cart line (auth required)
 *
 * `itemId` is `CartItem.itemId` (see cartRepository.updateItem/removeItem),
 * not the productId — matches what CartRouteClient sends via
 * `item.itemId ?? item.id`.
 */
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  successResponse,
  createRouteHandler,
  cartRepository,
} from "@mohasinac/appkit";

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "quantity must be at least 1").max(99),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof updateCartItemSchema)["_output"]>({
    auth: true,
    schema: updateCartItemSchema,
    handler: async ({ user, body, params }) => {
      const itemId = (params as { itemId: string }).itemId;
      const cart = await cartRepository.updateItem(user!.uid, itemId, {
        quantity: body!.quantity,
      });
      return successResponse({
        cart,
        itemCount: cartRepository.getItemCount(cart),
        subtotal: cartRepository.getSubtotal(cart),
      });
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const itemId = (params as { itemId: string }).itemId;
      const cart = await cartRepository.removeItem(user!.uid, itemId);
      return successResponse({
        cart,
        itemCount: cartRepository.getItemCount(cart),
        subtotal: cartRepository.getSubtotal(cart),
      });
    },
  }),
);
