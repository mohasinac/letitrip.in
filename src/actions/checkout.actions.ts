"use server";

/**
 * Checkout Server Actions
 *
 * Mutations for the checkout flow:
 *  - sendConsentOtpAction            — send checkout verification email OTP
 *  - verifyConsentOtpAction          — verify checkout verification email OTP
 *  - grantCheckoutConsentViaSmsAction — record verified consent after phone OTP
 *                                       (only valid when address phone == buyer's phone)
 *
 * stock-preflight and order placement go through service → apiClient (existing
 * pattern in checkoutService) so only true one-shot mutations live here.
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { rateLimitByIdentifier } from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { z } from "zod";
import { timingSafeEqual } from "crypto";
import { addressRepository, userRepository } from "@/repositories";
import { sendEmail } from "@mohasinac/appkit/features/contact";
import { resolveDate } from "@/utils";
import {
  CONSENT_OTP_EXPIRY_MS,
  CONSENT_OTP_MAX_ATTEMPTS,
  CONSENT_OTP_VERIFY_RATE_LIMIT,
  hashOtp,
  maskEmail,
  generateOtpCode,
  buildConsentOtpEmail,
  enforceConsentOtpRateLimit,
  saveConsentOtp,
  readConsentOtp,
  patchConsentOtp,
} from "@mohasinac/appkit/features/auth";

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

/**
 * Send a consent email OTP for third-party shipping.
 * Returns the masked email address so the UI can confirm which inbox to check.
 */
export async function sendConsentOtpAction(
  addressId: string,
): Promise<{ maskedEmail: string }> {
  const user = await requireAuth();

  const parsed = sendSchema.safeParse({ addressId });
  if (!parsed.success) throw new ValidationError("Invalid input");

  const email = user.email;
  if (!email) {
    throw new ValidationError(
      "Account email is required to send a consent OTP.",
    );
  }

  // Verify address ownership
  const address = await addressRepository.findById(user.uid, addressId);
  if (!address) throw new ValidationError("Address not found.");

  // 15-minute cooldown with bypass-credit exception — Firestore transaction
  // prevents TOCTOU races on concurrent requests.
  await enforceConsentOtpRateLimit(user.uid);

  // Generate and store OTP
  const code = generateOtpCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + CONSENT_OTP_EXPIRY_MS);

  await saveConsentOtp(user.uid, addressId, {
    codeHash,
    expiresAt,
    attempts: 0,
    verified: false,
    addressId,
    createdAt: new Date(),
  });

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LetItRip";
  const { subject, html } = buildConsentOtpEmail(
    address.fullName,
    code,
    siteName,
  );
  await sendEmail({ to: email, subject, html });

  serverLogger.info(
    `Consent OTP sent (action): uid=${user.uid} addressId=${addressId}`,
  );

  return { maskedEmail: maskEmail(email) };
}

/**
 * Verify the 6-digit consent OTP entered by the buyer.
 * Marks the Firestore record as verified so the checkout route can confirm consent.
 */
export async function verifyConsentOtpAction(
  addressId: string,
  code: string,
): Promise<void> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `consent:otp:verify:${user.uid}`,
    CONSENT_OTP_VERIFY_RATE_LIMIT,
  );
  if (!rl.success) {
    throw new AuthorizationError("Too many attempts. Please slow down.");
  }

  const parsed = verifySchema.safeParse({ addressId, code });
  if (!parsed.success) throw new ValidationError("Invalid input");

  const otpDoc = await readConsentOtp(user.uid, addressId);
  if (!otpDoc) {
    throw new ValidationError(
      "No consent OTP found. Please request a new code.",
    );
  }

  if (otpDoc.verified) return; // already verified

  if (otpDoc.attempts >= CONSENT_OTP_MAX_ATTEMPTS) {
    throw new ValidationError(
      "Too many failed attempts. Please request a new code.",
    );
  }

  if (Date.now() > (resolveDate(otpDoc.expiresAt)?.getTime() ?? 0)) {
    throw new ValidationError("Code expired. Please request a new one.");
  }

  const inputHash = hashOtp(code);
  if (
    !timingSafeEqual(
      Buffer.from(inputHash, "hex"),
      Buffer.from(otpDoc.codeHash, "hex"),
    )
  ) {
    await patchConsentOtp(user.uid, addressId, {
      attempts: otpDoc.attempts + 1,
    });
    throw new ValidationError("Invalid code. Please check and try again.");
  }

  await patchConsentOtp(user.uid, addressId, {
    verified: true,
    verifiedAt: new Date(),
  });

  serverLogger.info(
    `Consent OTP verified (action): uid=${user.uid} addressId=${addressId}`,
  );
}

/**
 * Grant checkout verification consent via phone SMS (OTP was verified client-side
 * via Firebase Phone Auth — re-authentication with the user's own registered number).
 *
 * This creates the same Firestore consent doc that the email OTP path creates, so the
 * checkout and payment-verify routes can check a single consistent path for ALL orders.
 *
 * Security: only writes the doc when the shipping address phone matches the buyer's
 * Firebase-registered phone.  A buyer cannot use this action to bypass email OTP for
 * a third-party address.
 */
export async function grantCheckoutConsentViaSmsAction(
  addressId: string,
): Promise<void> {
  const user = await requireAuth();

  const parsed = sendSchema.safeParse({ addressId });
  if (!parsed.success) throw new ValidationError("Invalid input");

  const profile = await userRepository.findById(user.uid);
  const userPhone = profile?.phoneNumber ?? user.phone_number;
  if (!userPhone) {
    throw new ValidationError("No phone number registered on your account.");
  }

  const address = await addressRepository.findById(user.uid, addressId);
  if (!address) throw new ValidationError("Address not found.");

  // Security: prevent calling this action for third-party phone numbers.
  const normalizePhone = (s: string) => s.replace(/[^0-9]/g, "").slice(-10);
  if (normalizePhone(address.phone) !== normalizePhone(userPhone)) {
    throw new ValidationError(
      "Phone number does not match the shipping address. Please use email verification for this address.",
    );
  }

  // Write a pre-verified consent doc — phone OTP re-auth already handled client-side.
  await saveConsentOtp(user.uid, addressId, {
    codeHash: "", // unused for SMS path
    expiresAt: new Date(Date.now() + CONSENT_OTP_EXPIRY_MS),
    attempts: 0,
    verified: true,
    verifiedVia: "sms",
    addressId,
    createdAt: new Date(),
  });

  serverLogger.info(
    `Checkout consent granted via SMS: uid=${user.uid} addressId=${addressId}`,
  );
}

