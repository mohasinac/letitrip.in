import { withProviders } from "@/providers.config";
import { isAdminUser, isSellerUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { catalogueRepository } from "@mohasinac/appkit/features/catalogue/repository/catalogue.repository";
import { createCatalogueItemSchema } from "@mohasinac/appkit/features/catalogue/schemas/validation";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { CatalogueOwnerRole } from "@mohasinac/appkit/features/catalogue/schemas/firestore";

function resolveOwnerRole(user: { role?: string }): CatalogueOwnerRole {
  if (isAdminUser(user)) return "admin";
  if (isSellerUser(user)) return "seller";
  return "user";
}

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
        ownerRole: resolveOwnerRole(user!),
      } as never);
      return successResponse(item, "Catalogue item created");
    },
  }),
);
