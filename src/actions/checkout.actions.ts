"use server";

/**
 * Checkout Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic or OTP logic here.
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import {
  rateLimitByIdentifier,
} from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import { z } from "zod";
import {
  sendCheckoutConsentOtp,
  verifyCheckoutConsentOtp,
  grantCheckoutConsentViaSms,
  userRepository,
} from "@mohasinac/appkit/features/checkout";
import { CONSENT_OTP_VERIFY_RATE_LIMIT } from "@mohasinac/appkit/features/auth";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const sendSchema = z.object({
  addressId: z.string().min(1),
});

const verifySchema = z.object({
  addressId: z.string().min(1),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, "Must be 6 digits"),
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function sendConsentOtpAction(
  addressId: string,
): Promise<{ maskedEmail: string }> {
  const user = await requireAuth();

  const parsed = sendSchema.safeParse({ addressId });
  if (!parsed.success) throw new ValidationError("Invalid input");

  const email = user.email;
  if (!email)
    throw new ValidationError(
      "Account email is required to send a consent OTP.",
    );

  return sendCheckoutConsentOtp(user.uid, email, parsed.data.addressId);
}

export async function verifyConsentOtpAction(
  addressId: string,
  code: string,
): Promise<void> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `consent:otp:verify:${user.uid}`,
    CONSENT_OTP_VERIFY_RATE_LIMIT,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many attempts. Please slow down.");

  const parsed = verifySchema.safeParse({ addressId, code });
  if (!parsed.success) throw new ValidationError("Invalid input");

  return verifyCheckoutConsentOtp(user.uid, parsed.data.addressId, parsed.data.code);
}

export async function grantCheckoutConsentViaSmsAction(
  addressId: string,
): Promise<void> {
  const user = await requireAuth();

  const parsed = sendSchema.safeParse({ addressId });
  if (!parsed.success) throw new ValidationError("Invalid input");

  const profile = await userRepository.findById(user.uid);
  const userPhone = profile?.phoneNumber ?? user.phone_number;

  return grantCheckoutConsentViaSms(user.uid, userPhone, parsed.data.addressId);
}

