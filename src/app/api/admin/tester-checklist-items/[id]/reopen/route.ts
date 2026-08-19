import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, errorResponse, testerChecklistItemRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await testerChecklistItemRepository.findById(id);
      if (!existing) return errorResponse("Checklist item not found", 404);
      if (!existing.bugConfirmed) {
        return errorResponse("Only a bug-confirmed case can be reopened for retest", 400);
      }
      if (existing.supersededByItemId) {
        return errorResponse("This case has already been reopened", 409);
      }

      const newItem = await testerChecklistItemRepository.reopenAsNewVersion(id);
      return successResponse({ item: newItem }, "Case reopened as a new version for retest");
    },
  }),
);
