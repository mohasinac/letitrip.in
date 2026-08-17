import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  testerChecklistItemRepository,
  testerChecklistResponseRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      if (user!.isTester !== true) {
        return errorResponse("Tester access only", 403);
      }

      const [items, responses] = await Promise.all([
        testerChecklistItemRepository.listActive(),
        testerChecklistResponseRepository.listForTester(user!.uid),
      ]);

      const responseByItemId = new Map(responses.map((r) => [r.checklistItemId, r]));

      const merged = items.map((item) => {
        const response = responseByItemId.get(item.id);
        return {
          ...item,
          answer: response?.answer ?? null,
          comment: response?.comment ?? undefined,
          screenshotUrl: response?.screenshotUrl ?? undefined,
        };
      });

      return successResponse({ items: merged });
    },
  }),
);
