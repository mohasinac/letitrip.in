import { withProviders } from "@/providers.config";
import {
  updateCartItem,
  removeCartItem,
  cartRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { z } from "zod";

const updateSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof updateSchema)["_output"]>({
    auth: true,
    schema: updateSchema,
    handler: async ({ user, body, params }) => {
      const itemId = (params as { itemId: string }).itemId;
      const cart = await updateCartItem(user!.uid, itemId, { quantity: body!.quantity });
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
      const cart = await removeCartItem(user!.uid, itemId);
      return successResponse({
        cart,
        itemCount: cartRepository.getItemCount(cart),
        subtotal: cartRepository.getSubtotal(cart),
      });
    },
  }),
);
