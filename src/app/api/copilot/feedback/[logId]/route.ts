import { withProviders } from "@/providers.config";
import {
  copilotLogRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { z } from "zod";
import { ROLES_ADMIN_MOD } from "@/constants";

const feedbackSchema = z.object({
  feedback: z.enum(["positive", "negative"]),
});

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const PATCH = withProviders(
  createRouteHandler<(typeof feedbackSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: feedbackSchema,
    handler: async ({ body, params }) => {
      const logId = (params as { logId: string }).logId;
      await copilotLogRepository.setFeedback(logId, body!.feedback as any);
      return successResponse(null, "Feedback recorded");
    },
  }),
);
