/**
 * PATCH /api/copilot/feedback/[logId]
 *
 * Record positive/negative feedback on a copilot response.
 * Staff-only.
 */

import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { copilotLogRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { AppError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

const feedbackSchema = z.object({
  feedback: z.enum(["positive", "negative"]),
});

export const PATCH = createApiHandler<
  (typeof feedbackSchema)["_output"],
  { logId: string }
>({
  auth: true,
  roles: ["admin", "moderator"],
  schema: feedbackSchema,
  handler: async ({ body, params }) => {
    const { logId } = params!;
    try {
      await copilotLogRepository.setFeedback(logId, body!.feedback);
      return successResponse(null, SUCCESS_MESSAGES.COPILOT.FEEDBACK_SAVED);
    } catch (error) {
      serverLogger.error("copilot.feedback", {
        error: error instanceof Error ? error.message : String(error),
        logId,
      });
      throw new AppError(ERROR_MESSAGES.COPILOT.FEEDBACK_FAILED, 500);
    }
  },
});
