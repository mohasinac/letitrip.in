import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
/**
 * GET /api/copilot/history
 *
 * Returns conversation history for a given conversationId.
 * Staff-only.
 */


import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { copilotLogRepository } from "@mohasinac/appkit/core/copilot-log.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { AppError } from "@mohasinac/appkit/errors/base-error";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
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
      void normalizeError(error);
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
}));
