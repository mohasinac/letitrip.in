import { withProviders } from "@/providers.config";
import { submitCatalogueItemForApprovalAction } from "@mohasinac/appkit/features/catalogue/actions/submit-for-approval";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

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
