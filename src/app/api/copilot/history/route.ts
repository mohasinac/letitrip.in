/**
 * GET /api/copilot/history
 *
 * Returns conversation history for a given conversationId.
 * Staff-only.
 */

import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { copilotLogRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { AppError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get("conversationId");

    if (!conversationId) {
      throw new AppError(
        400,
        "conversationId query parameter is required",
        "VALIDATION_ERROR",
      );
    }

    try {
      const logs = await copilotLogRepository.findByConversation(
        conversationId,
        100,
      );
      return successResponse({ messages: logs });
    } catch (error) {
      serverLogger.error("copilot.history", {
        error: error instanceof Error ? error.message : String(error),
        conversationId,
      });
      throw new AppError(
        500,
        ERROR_MESSAGES.COPILOT.HISTORY_FAILED,
        "HISTORY_FAILED",
      );
    }
  },
});
