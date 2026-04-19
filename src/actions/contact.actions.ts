"use server";

/**
 * Contact Server Action
 *
 * Sends a contact form message via Resend, bypassing the
 * service → apiClient → API route chain.
 */

import { z } from "zod";
import { headers } from "next/headers";
import { sendContactEmail } from "@mohasinac/appkit/server";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/server";
import { ValidationError } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";

// ─── Validation schema ────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  subject: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  message: z
    .string()
    .min(10, ERROR_MESSAGES.VALIDATION.MESSAGE_TOO_SHORT)
    .max(5000),
});

export type SendContactInput = z.infer<typeof contactSchema>;

// ─── Server Action ────────────────────────────────────────────────────────────

/**
 * Send a contact form message.
 * Rate-limited by IP (STRICT: 5 req / 60 s).
 * Does NOT require authentication.
 */
export async function sendContactAction(
  input: SendContactInput,
): Promise<{ sent: boolean }> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "anonymous";

  const rl = await rateLimitByIdentifier(
    `contact:${ip}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success)
    throw new ValidationError(
      "Too many requests. Please wait before trying again.",
    );

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? ERROR_MESSAGES.VALIDATION.FAILED,
    );
  }

  const { name, email, subject, message } = parsed.data;
  serverLogger.info("Contact form submission received", { subject });

  const result = await sendContactEmail({ name, email, subject, message });
  if (!result.success && process.env.NODE_ENV !== "production") {
    serverLogger.warn(
      "Contact email provider failed in non-production; returning mocked success",
      { subject },
    );
    return { sent: true };
  }
  if (!result.success)
    throw new ValidationError(ERROR_MESSAGES.CONTACT.SEND_FAILED);

  return { sent: true };
}

