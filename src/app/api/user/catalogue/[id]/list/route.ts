import { withProviders } from "@/providers.config";
import { createApiHandler as createRouteHandler, successResponse, errorResponse, listFromCatalogueAction } from "@mohasinac/appkit";

/** POST /api/user/catalogue/[id]/list — direct listing, no approval queue. Sellers list under their own store; admins (who have no personal seller store) list under the platform's consignment store. */
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["seller", "admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const result = await listFromCatalogueAction(id);
      if (!result.ok) return errorResponse(result.error, 400);
      return successResponse(result.data, "Item listed");
    },
  }),
);
