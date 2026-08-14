import { withProviders } from "@/providers.config";
import { createApiHandler as createRouteHandler, successResponse, errorResponse, submitCatalogueItemForApprovalAction } from "@mohasinac/appkit";

/** POST /api/user/catalogue/[id]/submit — buyer path, requests admin listing. */
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const result = await submitCatalogueItemForApprovalAction(id);
      if (!result.ok) return errorResponse(result.error, 400);
      return successResponse({ id }, "Submitted for admin approval");
    },
  }),
);
