import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  testerChecklistItemRepository,
  testerChecklistResponseRepository,
  userRepository,
  isEffectiveAdminUser,
} from "@mohasinac/appkit";

const upsertResponseSchema = z.object({
  answer: z.enum(["yes", "no"]).nullable().optional(),
  comment: z.string().max(2000).optional(),
  screenshotUrl: z.string().max(500).optional(),
});

export const PUT = withProviders(
  createRouteHandler<(typeof upsertResponseSchema)["_output"]>({
    auth: true,
    schema: upsertResponseSchema,
    handler: async ({ user, body, params }) => {
      // isTester/canTestAdmin are plain Firestore fields, never baked into the
      // session-cookie JWT (only `role` is) — must resolve them live.
      const profile = await userRepository.findById(user!.uid);
      const isAdminEligible = isEffectiveAdminUser(profile);
      if (!profile || (!profile.isTester && !isAdminEligible)) {
        return errorResponse("Tester access only", 403);
      }

      const checklistItemId = (params as { checklistItemId: string }).checklistItemId;
      const item = await testerChecklistItemRepository.findById(checklistItemId);
      if (!item) return errorResponse("Checklist item not found", 404);

      if (item.adminOnly && !isAdminEligible) {
        return errorResponse("Checklist item not found", 404);
      }

      const response = await testerChecklistResponseRepository.upsertResponse({
        testerId: user!.uid,
        testerDisplayName: user!.displayName ?? user!.email ?? user!.uid,
        checklistItemId,
        groupKey: item.groupKey,
        pageKey: item.pageKey,
        answer: body!.answer,
        comment: body!.comment,
        screenshotUrl: body!.screenshotUrl,
      });

      return successResponse(response, "Saved");
    },
  }),
);
