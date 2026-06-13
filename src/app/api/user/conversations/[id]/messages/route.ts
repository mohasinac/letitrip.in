/**
 * POST /api/user/conversations/[id]/messages — send a message.
 *
 * Delegates auth (role + seller-owner resolution) to `resolveConversationRole`,
 * persistence to `sendMessage`, and RTDB fan-out to `pingConversationRtdb`.
 * No business logic in this route — it's a thin auth + glue layer.
 *
 * 404 covers both "no such conversation" and "caller has no claim" so we
 * never leak conversation existence.
 */
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  getConversation,
  sendMessage,
  pingConversationRtdb,
  MESSAGE_MAX_LENGTH,
  ERROR_MESSAGES,
} from "@mohasinac/appkit";
import { resolveConversationRole } from "@/lib/conversations/authorise";

const sendSchema = z.object({
  body: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const POST = withProviders(
  createRouteHandler<(typeof sendSchema)["_output"]>({
    auth: true,
    schema: sendSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const conv = await getConversation(id);
      if (!conv)
        return errorResponse(ERROR_MESSAGES.CONVERSATIONS.NOT_FOUND, 404);

      const resolution = await resolveConversationRole(user!, conv);
      if (!resolution)
        return errorResponse(ERROR_MESSAGES.CONVERSATIONS.NOT_FOUND, 404);

      const updated = await sendMessage({
        conversationId: id,
        senderId: user!.uid,
        senderRole: resolution.role,
        body: body!.body,
      });

      await pingConversationRtdb({
        conversationId: id,
        buyerId: conv.buyerId,
        sellerOwnerId: resolution.sellerOwnerId,
      });

      return successResponse(updated, "Message sent");
    },
  }),
);
