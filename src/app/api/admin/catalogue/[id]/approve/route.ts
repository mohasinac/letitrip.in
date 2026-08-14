import { withProviders } from "@/providers.config";
import { createApiHandler as createRouteHandler, successResponse, errorResponse, approveCatalogueListingAction } from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:catalogue:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const result = await approveCatalogueListingAction(id);
      if (!result.ok) return errorResponse(result.error, 400);
      return successResponse(result.data, "Catalogue item approved and listed");
    },
  }),
);
