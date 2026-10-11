import { withProviders } from "@/providers.config";
import { testerChecklistResponseRepository } from "@mohasinac/appkit/features/tester/repository/tester-checklist-response.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD } from "@/constants";

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await testerChecklistResponseRepository.findById(id);
      if (!existing) return errorResponse("Feedback not found", 404);
      const updated = await testerChecklistResponseRepository.markReviewed(id);
      return successResponse(updated, "Marked as reviewed");
    },
  }),
);
