/**
 * Consent OTP — Verify
 *
 * POST /api/checkout/consent-otp/verify
 *
 * Validates the 6-digit code the user entered.
 * On success, marks the Firestore record as verified (used by the checkout
 * route to confirm third-party consent was obtained).
 *
 * Error cases:
 *  - 400 code invalid or expired
 *  - 429 max 5 attempts per OTP document
 */

import { z } from "zod";
import { timingSafeEqual } from "crypto";
import { successResponse } from "@/lib/api-response";
import { ApiError, ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security";
import { getAdminDb } from "@/lib/firebase/admin";
import { resolveDate } from "@/utils";
import {
  CONSENT_OTP_MAX_ATTEMPTS,
  hashOtp,
  consentOtpRef,
} from "@/lib/consent-otp";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  addressId: z.string().min(1),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

export const POST = createApiHandler<(typeof schema)["_output"]>({
  auth: true,
  schema,
  rateLimit: RateLimitPresets.STRICT,
  handler: async ({ user, body }) => {
    const { addressId, code } = body!;
    const uid = user!.uid;

    const db = getAdminDb();
    const otpRef = consentOtpRef(db, uid, addressId);

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

    // Already verified
    if (data.verified) {
      return successResponse({ verified: true });
    }

    // Max attempts check
    if (data.attempts >= CONSENT_OTP_MAX_ATTEMPTS) {
      throw new ApiError(
        429,
        "Too many failed attempts. Please request a new code.",
      );
    }

    // Expiry check
    const expiresAt = resolveDate(data.expiresAt);
    if (!expiresAt || Date.now() > expiresAt.getTime()) {
      throw new ValidationError("Code expired. Please request a new one.");
    }

    // Code verification (constant-time compare via hashes)
    const inputHash = hashOtp(code);
    const isValid = timingSafeEqual(
      Buffer.from(inputHash, "hex"),
      Buffer.from(data.codeHash, "hex"),
    );

    if (!isValid) {
      await otpRef.update({ attempts: data.attempts + 1 });
      const attemptsLeft = CONSENT_OTP_MAX_ATTEMPTS - (data.attempts + 1);
      serverLogger.warn(
        `Consent OTP invalid: uid=${uid} addressId=${addressId} attemptsLeft=${attemptsLeft}`,
      );
      throw new ValidationError("Invalid code. Please check and try again.");
    }

    // Mark as verified
    await otpRef.update({ verified: true, verifiedAt: new Date() });

    serverLogger.info(
      `Consent OTP verified: uid=${uid} addressId=${addressId}`,
    );

    return successResponse({ verified: true });
  },
});
