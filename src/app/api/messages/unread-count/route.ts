import { withProviders } from "@/providers.config";
/**
 * GET /api/messages/unread-count — the nav badge's source when the inbox
 * itself is not mounted. Never a list query of its own beyond the one the
 * inbox already bounds to 50 threads (D9 spec: "not a second global poll").
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { getUnreadConversationCount } from "@mohasinac/appkit/server";
import { ROLES_AUTHENTICATED } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ user }) => {
      const unread = await getUnreadConversationCount(user!.uid);
      return successResponse({ unread });
    },
  }),
);
