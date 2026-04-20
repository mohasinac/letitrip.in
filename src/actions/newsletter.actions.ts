"use server";

/**
 * Newsletter Server Action — thin wrapper
 *
 * Business logic lives in @mohasinac/appkit/core (subscribeNewsletter).
 * This wrapper adds ZOD validation, rate-limiting, and Next.js specifics.
 */

import { z } from "zod";
import { headers } from "next/headers";
import {
  subscribeNewsletter,
  NEWSLETTER_SUBSCRIBER_FIELDS,
} from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { ValidationError } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import type { SupportedNewsletterSource } from "@mohasinac/appkit";

// ─── Validation schema ────────────────────────────────────────────────────────

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

export type SubscribeNewsletterInput = z.infer<typeof subscribeSchema>;

// ─── Server Action ────────────────────────────────────────────────────────────

/**
 * Subscribe an email to the newsletter.
 * Rate-limited by IP (STRICT: 5 req / 60 s).
 * Does NOT require authentication.
 */
export async function subscribeNewsletterAction(
  input: SubscribeNewsletterInput,
): Promise<{ subscribed: boolean }> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "anonymous";

  const rl = await rateLimitByIdentifier(
    `newsletter:${ip}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new ValidationError(
      "Too many requests. Please wait before trying again.",
    );

  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? ERROR_MESSAGES.VALIDATION.FAILED,
    );
  }

  const { email, source } = parsed.data;
  const ipAddress = ip !== "anonymous" ? ip : undefined;
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

  return subscribeNewsletter({ email, source: normalizedSource, ipAddress });
}

