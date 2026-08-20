import { withProviders } from "@/providers.config";
import { createApiHandler as createRouteHandler, successResponse, errorResponse, catalogueRepository, userRepository, productRepository, pluginFor } from "@mohasinac/appkit";

/**
 * Public catalogue item — GET /api/catalogue/[ownerSlug]/[itemId]
 * `visibility:"public"` only, no auth required. Backs the per-item detail
 * page — the public catalogue grid previously had no per-item route to link to.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ params }) => {
      const { ownerSlug, itemId } = params as { ownerSlug: string; itemId: string };
      const owner = await userRepository.findById(ownerSlug);
      if (!owner) return errorResponse("User not found", 404);

      const item = await catalogueRepository.findById(itemId);
      if (!item || item.ownerId !== owner.uid || item.visibility !== "public") {
        return errorResponse("Catalogue item not found", 404);
      }

      // Resolve the linked product's real listing-type route server-side —
      // the client has no listingType field to work with otherwise.
      let linkedProductHref: string | null = null;
      if (item.linkedProductId) {
        const linkedProduct = await productRepository.findById(item.linkedProductId).catch(() => null);
        if (linkedProduct) {
          linkedProductHref = pluginFor(linkedProduct.listingType ?? "standard").detailRoute(linkedProduct.slug ?? linkedProduct.id);
        }
      }

      return successResponse({
        owner: { displayName: owner.displayName, photoURL: owner.photoURL },
        item,
        linkedProductHref,
      });
    },
  }),
);
