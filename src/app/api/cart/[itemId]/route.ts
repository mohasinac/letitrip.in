/**
 * Cart Item API Routes
 *
 * PATCH  /api/cart/[itemId]  — Update a cart line (auth required). Two shapes:
 *                                { quantity }     — copies of this line
 *                                { groupMembers } — a grouped line's per-member
 *                                                   quantities, WHOLE array
 * DELETE /api/cart/[itemId]  — Remove a cart line (auth required)
 *
 * `itemId` is `CartItem.itemId` (see cartRepository.updateItem/removeItem),
 * not the productId — matches what CartRouteClient sends via
 * `item.itemId ?? item.id`.
 *
 * The member edit sends the whole array rather than a per-member delta, and
 * has no route of its own: the cart is ONE Firestore document written with
 * `set()`, so N per-member writes would be both a Rule #6 cost and a real
 * lost-update race on a fast double-click. One request, one atomic write.
 */
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  successResponse,
  createRouteHandler,
  cartRepository,
  updateCartGroupMembers,
  GROUP_LINE_MAX_MEMBERS,
  errorResponse,
  productRepository,
} from "@mohasinac/appkit";

const updateCartItemSchema = z.union([
  z.object({
    quantity: z.number().int().min(1, "quantity must be at least 1").max(99),
  }),
  z.object({
    // 0 is allowed and MEANS "drop this member"; the repository removes the
    // whole line when the last member goes.
    groupMembers: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(0).max(99),
        }),
      )
      .min(1)
      .max(GROUP_LINE_MAX_MEMBERS),
  }),
]);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateCartItemSchema)["_output"]>({
    auth: true,
    schema: updateCartItemSchema,
    handler: async ({ user, body, params }) => {
      const itemId = (params as { itemId: string }).itemId;

      /*
       * 🛑 CAP THE QUANTITY AT THE LISTING'S REAL STOCK, SERVER-SIDE.
       *
       * Nothing in this path consulted the product: the schema's `.max(99)` is a
       * sanity bound, not an inventory check, and neither the route nor
       * `cartRepository.updateItem` ever read `stockQuantity`. A buyer could
       * raise a 10-in-stock line to 99 and only discover the problem at payment,
       * where `outOfStockPolicy` would silently skip or cancel — long after they
       * believed the order was real.
       *
       * The check belongs HERE rather than in the stepper: a `max` prop is a
       * courtesy the client can forget or a caller can bypass, while this is the
       * boundary every path crosses. The UI still gets a usable answer, because
       * 409 + the message below is what the cart's existing error toast renders.
       *
       * Only the plain-quantity branch needs it. A grouped line pins `quantity`
       * to 1 and carries its demand in `groupMembers`, which
       * `updateCartGroupMembers` validates on its own.
       */
      if (!("groupMembers" in body!)) {
        const existing = await cartRepository.findByUserId(user!.uid);
        // Keyed on `itemId`, not `id` — see this file's header.
        const line = existing?.items?.find((i) => i.itemId === itemId);
        if (line?.productId) {
          const product = await productRepository.findById(line.productId);
          const stock = product?.stockQuantity;
          if (typeof stock === "number" && body!.quantity > stock) {
            return errorResponse(
              stock > 0
                ? `Only ${stock} left in stock. Lower the quantity to ${stock} or fewer.`
                : "This item is now out of stock.",
              409,
              { code: "INSUFFICIENT_STOCK" },
            );
          }
        }
      }

      // Which branch was sent decides which repository method runs; each one
      // rejects being pointed at the wrong kind of line, so a `{quantity}` on a
      // grouped line (which would silently become a copies multiplier on top of
      // the member quantities) can't get through.
      const cart =
        "groupMembers" in body!
          ? await updateCartGroupMembers(user!.uid, itemId, {
              groupMembers: body!.groupMembers,
            })
          : await cartRepository.updateItem(user!.uid, itemId, {
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
