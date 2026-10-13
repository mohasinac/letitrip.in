import { withProviders } from "@/providers.config";
/** POST /api/messages/[conversationId]/block — block the OTHER participant from sending further messages into this thread. A per-user block list, the one genuinely new build this feature needed beyond its D9 (historical) reference. */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { blockConversationParticipant } from "@mohasinac/appkit/server";
import { ROLES_AUTHENTICATED } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ params, user }) => {
      const { conversationId } = params as { conversationId: string };
      await blockConversationParticipant(user!.uid, conversationId);
      return successResponse({ ok: true });
    },
  }),
);
