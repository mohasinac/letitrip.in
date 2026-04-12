import "@/providers.config";
/**
 * GET /api/copilot/history
 *
 * Returns conversation history for a given conversationId.
 * Staff-only.
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { copilotLogRepository } from "@/repositories";
import { successResponse } from "@mohasinac/appkit/next";
import { ERROR_MESSAGES } from "@/constants";
import { AppError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@/lib/server-logger";

export const GET = createRouteHandler({
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
