import { withProviders } from "@/providers.config";
import { rejectCatalogueListingAction } from "@mohasinac/appkit/features/catalogue/actions/approve-catalogue-listing";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

const rejectSchema = z.object({ reason: z.string().min(1, "A rejection reason is required") });

export const POST = withProviders(
  createRouteHandler<(typeof rejectSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:catalogue:write",
    schema: rejectSchema,
    handler: async ({ params, body }) => {
      const id = (params as { id: string }).id;
      const result = await rejectCatalogueListingAction(id, body!.reason);
      if (!result.ok) return errorResponse(result.error, 400);
      return successResponse({ id }, "Catalogue item rejected");
    },
  }),
);
