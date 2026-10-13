import { withProviders } from "@/providers.config";
/**
 * GET  /api/messages — list the signed-in user's conversations, cursor-paginated.
 * POST /api/messages — open (or create) a conversation with another user.
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import {
  listConversationsForUser,
  createOrOpenConversation,
} from "@mohasinac/appkit/server";
import { ROLES_AUTHENTICATED } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ request, user }) => {
      const url = new URL(request.url);
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 50);
      const cursor = url.searchParams.get("cursor") ?? undefined;
      const result = await listConversationsForUser(user!.uid, { limit, cursor });
      return successResponse(result);
    },
  }),
);

const createConversationSchema = z.object({
  otherUserId: z.string().min(1),
});

export const POST = withProviders(
  createRouteHandler<(typeof createConversationSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    schema: createConversationSchema,
    handler: async ({ request, user, body }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.CHAT);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const conversation = await createOrOpenConversation(user!.uid, body!.otherUserId);
      return successResponse(conversation);
    },
  }),
);
