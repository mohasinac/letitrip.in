import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  testerChecklistResponseRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:tester-feedback:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await testerChecklistResponseRepository.findById(id);
      if (!existing) return errorResponse("Feedback not found", 404);
      const updated = await testerChecklistResponseRepository.markReviewed(id);
      return successResponse(updated, "Marked as reviewed");
    },
  }),
);
