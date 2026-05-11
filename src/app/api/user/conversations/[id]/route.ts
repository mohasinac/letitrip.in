/**
 * GET /api/user/conversations/[id] — read a single conversation.
 *
 * Auth delegated to `resolveConversationRole` so all conversation routes
 * share one set of rules.
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  getConversation,
  ERROR_MESSAGES,
} from "@mohasinac/appkit";
import { resolveConversationRole } from "@/lib/conversations/authorise";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const conv = await getConversation(id);
      if (!conv)
        return errorResponse(ERROR_MESSAGES.CONVERSATIONS.NOT_FOUND, 404);

      const resolution = await resolveConversationRole(user!, conv);
      if (!resolution)
        return errorResponse(ERROR_MESSAGES.CONVERSATIONS.NOT_FOUND, 404);

      return successResponse(conv);
    },
  }),
);
