import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  testerChecklistItemRepository,
  testerChecklistResponseRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const response = await testerChecklistResponseRepository.findById(id);
      if (!response) return errorResponse("Tester feedback response not found", 404);
      if (response.answer !== "no") {
        return errorResponse('Only a "No" response can be marked as a confirmed bug', 400);
      }

      const item = await testerChecklistItemRepository.findById(response.checklistItemId);
      if (!item) return errorResponse("Checklist item not found", 404);
      if (item.bugConfirmed) return errorResponse("This case has already been confirmed as a bug", 409);

      const updatedItem = await testerChecklistItemRepository.confirmBug(
        response.checklistItemId,
        response.testerId,
        response.testerDisplayName,
      );
      await testerChecklistResponseRepository.markReviewed(id);

      return successResponse(
        { item: updatedItem },
        "Bug confirmed — case locked and credited to the reporting tester",
      );
    },
  }),
);
