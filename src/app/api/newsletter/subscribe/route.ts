/**
 * Newsletter Subscribe API Route
 * POST /api/newsletter/subscribe — Subscribe an email to the newsletter
 */

import { z } from "zod";
import { newsletterRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { serverLogger } from "@/lib/server-logger";
import { NEWSLETTER_SUBSCRIBER_FIELDS } from "@/db/schema";
import { createRouteHandler } from "@mohasinac/next";

const subscribeSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  source: z
    .enum([
      NEWSLETTER_SUBSCRIBER_FIELDS.SOURCE_VALUES.FOOTER,
      NEWSLETTER_SUBSCRIBER_FIELDS.SOURCE_VALUES.HOMEPAGE,
      NEWSLETTER_SUBSCRIBER_FIELDS.SOURCE_VALUES.CHECKOUT,
      NEWSLETTER_SUBSCRIBER_FIELDS.SOURCE_VALUES.POPUP,
    ])
    .optional(),
});

export const POST = createRouteHandler<(typeof subscribeSchema)["_output"]>({
  schema: subscribeSchema,
  handler: async ({ request, body }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { email, source } = body!;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      undefined;
    const existing = await newsletterRepository.findByEmail(email);
    if (existing) {
      if (
        existing.status === NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.ACTIVE
      ) {
        return successResponse(
          { subscribed: true },
          SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED,
        );
      }
      await newsletterRepository.resubscribe(existing.id);
      serverLogger.info("Newsletter re-subscription");
      return successResponse(
        { subscribed: true },
        SUCCESS_MESSAGES.NEWSLETTER.RESUBSCRIBED,
      );
    }
    await newsletterRepository.subscribe({ email, source, ipAddress });
    serverLogger.info("New newsletter subscription", { source });
    return successResponse(
      { subscribed: true },
      SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED,
    );
  },
});
