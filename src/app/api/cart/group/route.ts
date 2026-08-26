import { withProviders } from "@/providers.config";
/**
 * Cart — add a grouped selection as ONE line
 *
 * POST /api/cart/group
 *
 * Deliberately separate from `POST /api/cart`. That route is the hot path
 * behind every product card's Add-to-cart button and its schema is
 * `{productId, quantity}`; turning it into a discriminated union would put this
 * feature's blast radius on the single most-called cart endpoint.
 *
 * Body carries IDS AND QUANTITIES ONLY. Prices, titles and images are
 * re-resolved from Firestore inside `addGroupLineToCart` — accepting them from
 * the client would be a price-manipulation hole.
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { cartRepository } from "@mohasinac/appkit";
import { addGroupLineToCart, GROUP_LINE_MAX_MEMBERS } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";

const addGroupLineSchema = z.object({
  groupId: z.string().min(1),
  groupSource: z.enum(["product-group", "grouped-listing"]),
  members: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(GROUP_LINE_MAX_MEMBERS),
});

export const POST = withProviders(
  createRouteHandler<(typeof addGroupLineSchema)["_output"]>({
    auth: true,
    schema: addGroupLineSchema,
    handler: async ({ user, body }) => {
      // Every eligibility rule (published / not sold / cart-eligible /
      // membership / single-store / stock, plus the cart lane gate and the
      // distinct-items cap) lives in the action, so the SSR page and this route
      // cannot drift apart on what a valid selection is.
      const cart = await addGroupLineToCart(user!.uid, body!);

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
  }),
);
