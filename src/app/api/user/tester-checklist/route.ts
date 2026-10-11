import { withProviders } from "@/providers.config";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { isEffectiveAdminUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { testerChecklistItemRepository } from "@mohasinac/appkit/features/tester/repository/tester-checklist-item.repository";
import { testerChecklistResponseRepository } from "@mohasinac/appkit/features/tester/repository/tester-checklist-response.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      // isTester/canTestAdmin are plain Firestore fields, never baked into the
      // session-cookie JWT (only `role` is) — must resolve them live.
      const profile = await userRepository.findById(user!.uid);
      const isAdminEligible = isEffectiveAdminUser(profile);
      if (!profile || (!profile.isTester && !isAdminEligible)) {
        return errorResponse("Tester access only", 403);
      }

      const [items, responses] = await Promise.all([
        testerChecklistItemRepository.listActive(),
        testerChecklistResponseRepository.listForTester(user!.uid),
      ]);

      const visibleItems = isAdminEligible ? items : items.filter((item) => !item.adminOnly);

      const responseByItemId = new Map(responses.map((r) => [r.checklistItemId, r]));

      const merged = visibleItems.map((item) => {
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
