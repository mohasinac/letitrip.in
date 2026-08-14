import { withProviders } from "@/providers.config";
import { createApiHandler as createRouteHandler, successResponse, errorResponse, catalogueRepository, userRepository } from "@mohasinac/appkit";

/**
 * Public catalogue — GET /api/catalogue/[ownerSlug]
 * `visibility:"public"` only, no auth required. Backs the "Catalogue" tab
 * on a user's public profile page.
 *
 * Two-step lookup (public `user-` slug → internal Auth uid), mirroring the
 * storeId=storeSlug / ownerId=Auth-UID split already used for stores —
 * `CatalogueItemDocument.ownerId` is the Auth uid, not the public slug.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ params }) => {
      const ownerSlug = (params as { ownerSlug: string }).ownerSlug;
      const owner = await userRepository.findById(ownerSlug);
      if (!owner) return errorResponse("User not found", 404);
      const items = await catalogueRepository.listPublicByOwner(owner.uid);
      return successResponse({
        owner: { displayName: owner.displayName, photoURL: owner.photoURL },
        items,
      });
    },
  }),
);
