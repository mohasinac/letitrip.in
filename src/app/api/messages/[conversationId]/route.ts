import { withProviders } from "@/providers.config";
/**
 * GET  /api/messages/[conversationId] — cursor-paginated message history.
 * POST /api/messages/[conversationId] — send a message into the thread.
 */

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { listMessagesForConversation, sendMessage } from "@mohasinac/appkit/server";
import { ROLES_AUTHENTICATED } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ request, params, user }) => {
      const { conversationId } = params as { conversationId: string };
      const url = new URL(request.url);
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30", 10) || 30, 50);
      const cursor = url.searchParams.get("cursor") ?? undefined;
      const result = await listMessagesForConversation(user!.uid, conversationId, { limit, cursor });
      return successResponse(result);
    },
  }),
);

const sendMessageSchema = z.object({
  body: z.string().min(1).max(2000),
  clientMessageId: z.string().min(1),
  attachments: z.array(z.string()).max(6).optional(),
  productId: z.string().optional(),
});

export const POST = withProviders(
  createRouteHandler<(typeof sendMessageSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    schema: sendMessageSchema,
    handler: async ({ request, params, user, body }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.CHAT);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const { conversationId } = params as { conversationId: string };
      const message = await sendMessage({
        conversationId,
        authorId: user!.uid,
        body: body!.body,
        clientMessageId: body!.clientMessageId,
        attachments: body!.attachments,
        productId: body!.productId,
      });
      return successResponse(message);
    },
  }),
);
