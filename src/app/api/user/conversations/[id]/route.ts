/**
 * GET /api/user/conversations/[id] — read a single conversation.
 *
 * Authorises against both buyerId and storeOwnerId (when the requester owns
 * the store on the other side of the thread). 404s when the caller has no
 * claim to the conversation.
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  getConversation,
  storeRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const conv = await getConversation(id);
      if (!conv) return errorResponse("Conversation not found", 404);

      if (conv.buyerId === user!.uid) {
        return successResponse(conv);
      }
      // Allow the store owner of the counterparty store to read.
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (store?.id && store.id === conv.storeId) {
        return successResponse(conv);
      }
      if (user!.role === "admin") {
        return successResponse(conv);
      }
      return errorResponse("Conversation not found", 404);
    },
  }),
);
