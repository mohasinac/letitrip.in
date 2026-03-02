/**
 * Newsletter Subscribe API Route
 * POST /api/newsletter/subscribe — Subscribe an email to the newsletter
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { newsletterRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, UI_LABELS } from "@/constants";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { serverLogger } from "@/lib/server-logger";
import { NEWSLETTER_SUBSCRIBER_FIELDS } from "@/db/schema";

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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — prevent subscription spam
    const rateLimitResult = await applyRateLimit(
      request,
      RateLimitPresets.STRICT,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: UI_LABELS.AUTH.RATE_LIMIT_EXCEEDED },
        { status: 429 },
      );
    }

    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const { email, source } = validation.data;

    // Resolve IP for audit
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      undefined;

    // Check for existing subscription
    const existing = await newsletterRepository.findByEmail(email);

    if (existing) {
      if (
        existing.status === NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.ACTIVE
      ) {
        // Already subscribed — return success silently (don't expose whether email exists)
        return successResponse(
          { subscribed: true },
          SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED,
        );
      }

      // Previously unsubscribed — re-activate
      await newsletterRepository.resubscribe(existing.id);
      serverLogger.info("Newsletter re-subscription", { email });
      return successResponse(
        { subscribed: true },
        SUCCESS_MESSAGES.NEWSLETTER.RESUBSCRIBED,
      );
    }

    // New subscription
    await newsletterRepository.subscribe({ email, source, ipAddress });
    serverLogger.info("New newsletter subscription", { email, source });

    return successResponse(
      { subscribed: true },
      SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
