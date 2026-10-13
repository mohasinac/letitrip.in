import { withProviders } from "@/providers.config";
/** POST /api/messages/[conversationId]/read — mark the thread read (resets the unread counter and bumps lastReadAt for the caller). */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { markConversationRead } from "@mohasinac/appkit/server";
import { ROLES_AUTHENTICATED } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ params, user }) => {
      const { conversationId } = params as { conversationId: string };
      await markConversationRead(user!.uid, conversationId);
      return successResponse({ ok: true });
    },
  }),
);
