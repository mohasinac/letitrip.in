"use server";

/**
 * Checkout Server Actions
 *
 * Mutations for the checkout flow:
 *  - sendConsentOtpAction   — send third-party consent email OTP
 *  - verifyConsentOtpAction — verify third-party consent email OTP
 *
 * stock-preflight and order placement go through service → apiClient (existing
 * pattern in checkoutService) so only true one-shot mutations live here.
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { rateLimitByIdentifier } from "@/lib/security";
import { AuthorizationError, ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { z } from "zod";
import { timingSafeEqual } from "crypto";
import { addressRepository } from "@/repositories";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email";
import { resolveDate } from "@/utils";
import {
  CONSENT_OTP_EXPIRY_MS,
  CONSENT_OTP_COOLDOWN_MS,
  CONSENT_OTP_MAX_ATTEMPTS,
  CONSENT_OTP_VERIFY_RATE_LIMIT,
  hashOtp,
  maskEmail,
  generateOtpCode,
  buildConsentOtpEmail,
  consentOtpRef,
  consentOtpRateLimitRef,
} from "@/lib/consent-otp";

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

  const db = getAdminDb();

  // 15-minute cooldown with bypass-credit exception — wrapped in a Firestore
  // transaction to prevent TOCTOU races on concurrent requests.
  const metaRef = consentOtpRateLimitRef(db, user.uid);

  await db.runTransaction(async (tx) => {
    const metaSnap = await tx.get(metaRef);
    const meta = metaSnap.exists
      ? (metaSnap.data() as {
          lastSentAt?: FirebaseFirestore.Timestamp;
          bypassCredits?: number;
        })
      : null;

    const lastSentMs = resolveDate(meta?.lastSentAt)?.getTime() ?? 0;
    const bypassCredits = meta?.bypassCredits ?? 0;
    const elapsed = Date.now() - lastSentMs;

    if (elapsed < CONSENT_OTP_COOLDOWN_MS) {
      if (bypassCredits <= 0) {
        throw new AuthorizationError("consentOtpRateLimit");
      }
      tx.set(
        metaRef,
        { lastSentAt: new Date(), bypassCredits: bypassCredits - 1 },
        { merge: true },
      );
    } else {
      tx.set(metaRef, { lastSentAt: new Date() }, { merge: true });
    }
  });

  // Generate and store OTP
  const code = generateOtpCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + CONSENT_OTP_EXPIRY_MS);

  await consentOtpRef(db, user.uid, addressId).set({
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

  const db = getAdminDb();
  const otpRef = consentOtpRef(db, user.uid, addressId);

  const snap = await otpRef.get();
  if (!snap.exists) {
    throw new ValidationError(
      "No consent OTP found. Please request a new code.",
    );
  }

  const data = snap.data() as {
    codeHash: string;
    expiresAt: FirebaseFirestore.Timestamp;
    attempts: number;
    verified: boolean;
  };

  if (data.verified) return; // already verified

  if (data.attempts >= CONSENT_OTP_MAX_ATTEMPTS) {
    throw new ValidationError(
      "Too many failed attempts. Please request a new code.",
    );
  }

  if (Date.now() > (resolveDate(data.expiresAt)?.getTime() ?? 0)) {
    throw new ValidationError("Code expired. Please request a new one.");
  }

  const inputHash = hashOtp(code);
  if (
    !timingSafeEqual(
      Buffer.from(inputHash, "hex"),
      Buffer.from(data.codeHash, "hex"),
    )
  ) {
    await otpRef.update({ attempts: data.attempts + 1 });
    throw new ValidationError("Invalid code. Please check and try again.");
  }

  await otpRef.update({ verified: true, verifiedAt: new Date() });

  serverLogger.info(
    `Consent OTP verified (action): uid=${user.uid} addressId=${addressId}`,
  );
}
