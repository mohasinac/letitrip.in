import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  catalogueRepository,
  createCatalogueItemSchema,
  isSellerUser,
} from "@mohasinac/appkit";

/**
 * Personal Catalogue (Feature B) — owner's own items.
 *
 * GET  /api/user/catalogue — list own items (public + private)
 * POST /api/user/catalogue — create
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const items = await catalogueRepository.listByOwner(user!.uid);
      return successResponse({ items });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createCatalogueItemSchema)["_output"]>({
    auth: true,
    schema: createCatalogueItemSchema,
    handler: async ({ user, body }) => {
      const item = await catalogueRepository.create({
        ...body!,
        ownerId: user!.uid,
        ownerRole: isSellerUser(user) ? "seller" : "user",
      } as never);
      return successResponse(item, "Catalogue item created");
    },
  }),
);
