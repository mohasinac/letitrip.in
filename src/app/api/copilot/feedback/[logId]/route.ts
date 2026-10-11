import { withProviders } from "@/providers.config";
import { copilotLogRepository } from "@mohasinac/appkit/core/copilot-log.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { z } from "zod";
import { ROLES_ADMIN_MOD } from "@/constants";

const feedbackSchema = z.object({
  feedback: z.enum(["positive", "negative"]),
});

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