/**
 * POST /api/store/reviews/[id]/reply
 * Adds or updates a seller reply on a review they received.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { AuthorizationError } from "@mohasinac/appkit/errors/authorization-error";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { reviewRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const replySchema = z.object({
  reply: z.string().min(1).max(1000),
});

export const POST = withProviders(createApiHandler<{ reply: string }>({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  schema: replySchema,
  handler: async ({ params, body, user }) => {
    const reviewId = (params as Record<string, string>).id;
    const review = await reviewRepository.findById(reviewId);
    if (!review) return new Response(JSON.stringify({ error: "Review not found" }), { status: 404 });

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store || store.id !== review.storeId) {
      throw new AuthorizationError("Not authorized to reply to this review.");
    }

    await reviewRepository.update(reviewId, {
      sellerReply: body!.reply,
      sellerRepliedAt: new Date(),
    });

    return successResponse({ message: "Reply saved." });
  },
}));