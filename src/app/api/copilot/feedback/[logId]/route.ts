import { withProviders } from "@/providers.config";
import {
  copilotLogRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { z } from "zod";

const feedbackSchema = z.object({
  feedback: z.enum(["positive", "negative"]),
});

export const PATCH = withProviders(
  createRouteHandler<(typeof feedbackSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: feedbackSchema,
    handler: async ({ body, params }) => {
      const logId = (params as { logId: string }).logId;
      await copilotLogRepository.update(logId, { feedback: body!.feedback } as any);
      return successResponse(null, "Feedback recorded");
    },
  }),
);
