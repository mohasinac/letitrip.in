import { withProviders } from "@/providers.config";
import { z } from "zod";
import { cartRepository, createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";

/**
 * Cart Add-ons API
 *
 * PUT /api/cart/addons — set one store's paid add-on selections.
 *
 * Add-on fees have always been billed per order group (= per store) by the
 * checkout server actions, so the selection is stored the same way. This is the
 * single source of truth for what gets charged: neither /api/checkout/pricing-preview
 * nor /api/payment/create-order accepts add-on booleans in its request body any
 * more, precisely so the same charge can't be answered from two places.
 */
const addonsSchema = z.object({
  /** Canonical store identifier (= store slug), the key order groups use. */
  storeId: z.string().min(1),
  whatsappNotifyAddon: z.boolean().optional(),
  giftWrapAddon: z.boolean().optional(),
  giftWrapMessage: z.string().max(500).optional(),
  shipmentProtectionAddon: z.boolean().optional(),
});

export const PUT = withProviders(
  createRouteHandler<(typeof addonsSchema)["_output"]>({
    auth: true,
    schema: addonsSchema,
    handler: async ({ user, body }) => {
      const { storeId, ...addons } = body!;

      // A store the buyer isn't buying from must never get an entry — otherwise
      // the map could be seeded for an arbitrary storeId and quietly start
      // charging the moment an item from that store entered the cart.
      const cart = await cartRepository.findByUserId(user!.uid);
      const hasItemFromStore = (cart?.items ?? []).some((item) => item.storeId === storeId);
      if (!hasItemFromStore) {
        throw ApiErrors.badRequest("No items from that store are in your cart.");
      }

      await cartRepository.setStoreAddons(user!.uid, storeId, {
        ...addons,
        // A gift message without gift wrap is meaningless — drop it rather than
        // storing an orphan that would resurface if wrap were re-enabled later.
        giftWrapMessage: addons.giftWrapAddon ? addons.giftWrapMessage : undefined,
      });

      return successResponse({ storeId, ...addons });
    },
  }),
);
