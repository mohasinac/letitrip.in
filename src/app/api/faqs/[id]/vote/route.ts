/**
 * FAQ Vote API Route
 *
 * Handle helpful / not-helpful voting for FAQs.
 */

import { faqsRepository } from "@/repositories";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { successResponse } from "@/lib/api-response";
import { faqVoteSchema } from "@/lib/validation/schemas";
import { NotFoundError } from "@mohasinac/appkit/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

type IdParams = { id: string };

/**
 * POST /api/faqs/[id]/vote
 * Requires authentication — vote helpful or not-helpful on a FAQ.
 */
export const POST = createRouteHandler<
  (typeof faqVoteSchema)["_output"],
  IdParams
>({
  auth: true,
  schema: faqVoteSchema,
  handler: async ({ params, body }) => {
    const { id } = params!;
    const { vote } = body!;

    const faq = await faqsRepository.findById(id);
    if (!faq) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);

    const helpful = vote === "helpful";
    const stats = faq.stats || { views: 0, helpful: 0, notHelpful: 0 };

    const updatedFAQ = await faqsRepository.update(id, {
      stats: {
        ...stats,
        helpful: helpful ? (stats.helpful || 0) + 1 : stats.helpful || 0,
        notHelpful: !helpful
          ? (stats.notHelpful || 0) + 1
          : stats.notHelpful || 0,
      },
    });

    return successResponse(
      {
        helpful: updatedFAQ.stats?.helpful || 0,
        notHelpful: updatedFAQ.stats?.notHelpful || 0,
      },
      helpful
        ? SUCCESS_MESSAGES.FAQ.VOTE_HELPFUL
        : SUCCESS_MESSAGES.FAQ.VOTE_NOT_HELPFUL,
    );
  },
});
