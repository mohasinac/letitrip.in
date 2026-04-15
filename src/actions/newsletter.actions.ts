"use server";

/**
 * Newsletter Server Actions
 *
 * Subscribe an email to the newsletter, bypassing the
 * service → apiClient → API route chain.
 */

import { z } from "zod";
import { headers } from "next/headers";
import { newsletterRepository } from "@/repositories";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { ValidationError } from "@mohasinac/appkit/errors";
import { ERROR_MESSAGES } from "@/constants";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { NEWSLETTER_SUBSCRIBER_FIELDS } from "@/db/schema";

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
  type SupportedNewsletterSource = "footer" | "homepage" | "checkout" | "popup";
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

  const existing = await newsletterRepository.findByEmail(email);
  if (existing) {
    if (existing.status === NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.ACTIVE) {
      return { subscribed: true };
    }
    await newsletterRepository.resubscribe(existing.id);
    serverLogger.info("Newsletter re-subscription");
    return { subscribed: true };
  }

  await newsletterRepository.subscribe({
    email,
    source: normalizedSource,
    ipAddress,
  });
  serverLogger.info("New newsletter subscription", {
    source: normalizedSource,
  });
  return { subscribed: true };
}

