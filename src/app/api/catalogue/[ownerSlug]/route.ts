import { withProviders } from "@/providers.config";
import { createApiHandler as createRouteHandler, successResponse, catalogueRepository } from "@mohasinac/appkit";

/**
 * Public catalogue — GET /api/catalogue/[ownerSlug]
 * `visibility:"public"` only, no auth required. Backs the "Catalogue" tab
 * on a user's public profile page.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ params }) => {
      const ownerSlug = (params as { ownerSlug: string }).ownerSlug;
      const items = await catalogueRepository.listPublicByOwner(ownerSlug);
      return successResponse({ items });
    },
  }),
);
