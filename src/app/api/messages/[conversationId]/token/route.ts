import { withProviders } from "@/providers.config";
/**
 * POST /api/messages/[conversationId]/token — mint a per-conversation RTDB
 * custom token. Called by the route that OPENS a thread, matching the
 * auth_events / payment_events / bulk_events precedent: no broad token, ever.
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { mintChatEventToken } from "@mohasinac/appkit/server";
import { ROLES_AUTHENTICATED } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ request, params, user }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.AUTH);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const { conversationId } = params as { conversationId: string };
      const result = await mintChatEventToken(user!.uid, conversationId);
      return successResponse({ conversationId, ...result });
    },
  }),
);
