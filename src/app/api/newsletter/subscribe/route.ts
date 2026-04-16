import "@/providers.config";
/**
 * Newsletter Subscribe API Route
 * POST /api/newsletter/subscribe — Subscribe an email to the newsletter
 */

import { z } from "zod";
import { newsletterRepository } from "@mohasinac/appkit/repositories";
import { successResponse, errorResponse } from "@mohasinac/appkit/next";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { NEWSLETTER_SUBSCRIBER_FIELDS } from "@/db/schema";
import { createRouteHandler } from "@mohasinac/appkit/next";

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
    type SupportedNewsletterSource = "footer" | "homepage" | "checkout" | "popup";
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
    const normalizedSource: SupportedNewsletterSource | undefined =
      source === NEWSLETTER_SUBSCRIBER_FIELDS.SOURCE_VALUES.FOOTER
        ? "footer"
        : source === NEWSLETTER_SUBSCRIBER_FIELDS.SOURCE_VALUES.HOMEPAGE
          ? "homepage"
          : source === NEWSLETTER_SUBSCRIBER_FIELDS.SOURCE_VALUES.CHECKOUT
            ? "checkout"
            : source === NEWSLETTER_SUBSCRIBER_FIELDS.SOURCE_VALUES.POPUP ||
                source === "admin" ||
                source === "import"
              ? "popup"
              : undefined;
    await newsletterRepository.subscribe({
      email,
      source: normalizedSource,
      ipAddress,
    });
    serverLogger.info("New newsletter subscription", { source });
    return successResponse(
      { subscribed: true },
      SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED,
    );
  },
});

