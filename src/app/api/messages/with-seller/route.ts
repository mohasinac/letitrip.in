import { withProviders } from "@/providers.config";
/**
 * POST /api/messages/with-seller — open (or create) a conversation with the
 * owner of a store. The product/store page knows the storeId (slug), never
 * the owner's uid; resolution happens server-side (D11 gap: the backend
 * had no UI entry point to start a conversation at all).
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { openConversationWithSeller } from "@mohasinac/appkit/server";
import { ROLES_AUTHENTICATED } from "@/constants";

const bodySchema = z.object({
  storeId: z.string().min(1),
});

export const POST = withProviders(
  createRouteHandler<(typeof bodySchema)["_output"]>({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    schema: bodySchema,
    handler: async ({ request, user, body }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.CHAT);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const conversation = await openConversationWithSeller(user!.uid, body!.storeId);
      return successResponse(conversation);
    },
  }),
);
