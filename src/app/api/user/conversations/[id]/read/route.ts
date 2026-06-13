/**
 * POST /api/user/conversations/[id]/read — zero out the caller's unread
 * counter and flip `isRead` on inbound messages. Same auth + RTDB ping
 * fan-out as the send-message route.
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  getConversation,
  markConversationRead,
  pingConversationRtdb,
  ERROR_MESSAGES,
} from "@mohasinac/appkit";
import { resolveConversationRole } from "@/lib/conversations/authorise";

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const POST = withProviders(
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

      await markConversationRead(id, resolution.role);
      await pingConversationRtdb({
        conversationId: id,
        buyerId: conv.buyerId,
        sellerOwnerId: resolution.sellerOwnerId,
      });

      return successResponse({ ok: true });
    },
  }),
);
