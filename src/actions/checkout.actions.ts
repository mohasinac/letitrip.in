"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Checkout Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic or OTP logic here.
 */

import { requireAuthUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import { z } from "zod";
import {
  sendCheckoutValueOtp,
  verifyCheckoutValueOtp,
} from "@mohasinac/appkit";
import { CHECKOUT_VALUE_OTP_VERIFY_RATE_LIMIT } from "@mohasinac/appkit";

// --- Tier PP: high-value checkout OTP ---

const valueOtpVerifySchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/, "Must be 6 digits"),
});

export async function sendCheckoutValueOtpAction(
  channel: "email" | "whatsapp" = "email",
  addressId?: string,
): Promise<ActionResult<{ maskedEmail?: string; maskedPhone?: string; skipped?: boolean }>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
    const email = user.email;
    if (!email) {
      throw new ValidationError("Account email is required to send a verification code.");
    }
    return sendCheckoutValueOtp(user.uid, email, channel, addressId);
  });
}

export async function verifyCheckoutValueOtpAction(code: string): Promise<void> {
  const user = await requireAuthUser();

  const rl = await rateLimitByIdentifier(
    `checkout:value-otp:verify:${user.uid}`,
    CHECKOUT_VALUE_OTP_VERIFY_RATE_LIMIT,
  );
  if (!rl.success) {
    throw new AuthorizationError("Too many attempts. Please slow down.");
  }

  const parsed = valueOtpVerifySchema.safeParse({ code });
  if (!parsed.success) throw new ValidationError("Invalid input");

  return verifyCheckoutValueOtp(user.uid, parsed.data.code);
}

