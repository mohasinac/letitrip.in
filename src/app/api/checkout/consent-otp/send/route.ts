/**
 * Consent OTP — Send
 *
 * POST /api/checkout/consent-otp/send
 *
 * When a buyer ships to a third-party address (different name from account),
 * they must verify their consent via email OTP before placing the order.
 *
 * This endpoint:
 *  1. Verifies the address belongs to the authenticated user
 *  2. Enforces a 15-minute cooldown per user per send request.
 *     Exception: if the user has "bypass credits" (granted by the server when a
 *     partial order is placed for a third-party address), they may bypass the
 *     cooldown — up to MAX_BYPASS_CREDITS (3) times.  After all credits are used
 *     the standard 15-minute wait applies again.
 *  3. Generates a random 6-digit OTP (stored as HMAC-SHA256 hash)
 *  4. Sends the OTP to the user's account email via Resend
 *  5. Returns { sent: true, maskedEmail }
 *
 * Rate-limit document:  users/{uid}/consentOtpRateLimit/meta
 *   { lastSentAt: Timestamp, bypassCredits: number }
 *
 * OTP document:         users/{uid}/consentOtps/{addressId}
 */

import { z } from "zod";
import { successResponse } from "@/lib/api-response";
import { ApiError, NotFoundError, ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security";
import { addressRepository } from "@/repositories";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email";
import { resolveDate } from "@/utils";
import {
  CONSENT_OTP_EXPIRY_MS,
  CONSENT_OTP_COOLDOWN_MS,
  hashOtp,
  maskEmail,
  generateOtpCode,
  buildConsentOtpEmail,
  consentOtpRef,
  consentOtpRateLimitRef,
} from "@/lib/consent-otp";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  addressId: z.string().min(1, "addressId is required"),
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

export const POST = createApiHandler<(typeof schema)["_output"]>({
  auth: true,
  schema,
  rateLimit: RateLimitPresets.STRICT,
  handler: async ({ user, body }) => {
    const { addressId } = body!;
    const uid = user!.uid;
    const email = user!.email;

    if (!email) {
      throw new ValidationError(
        "Account email is required to send a consent OTP.",
      );
    }

    // 1. Verify address belongs to this user
    const address = await addressRepository.findById(uid, addressId);
    if (!address) {
      throw new NotFoundError("Address not found.");
    }

    // 2. Cooldown + bypass-credit rate limiting — wrapped in a Firestore transaction
    //    to prevent TOCTOU races where two simultaneous requests both see credits > 0.
    const db = getAdminDb();
    const metaRef = consentOtpRateLimitRef(db, uid);

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
        // Within the 15-min cooldown window
        if (bypassCredits <= 0) {
          // No bypass credits left — enforce full cooldown
          throw new ApiError(429, "consentOtpRateLimit");
        }
        // Consume one bypass credit and reset the cooldown
        tx.set(
          metaRef,
          { lastSentAt: new Date(), bypassCredits: bypassCredits - 1 },
          { merge: true },
        );
      } else {
        // Outside cooldown — allow freely; preserve any remaining credits
        tx.set(metaRef, { lastSentAt: new Date() }, { merge: true });
      }
    });

    // 3. Generate 6-digit code and store its hash
    const code = generateOtpCode();
    const codeHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + CONSENT_OTP_EXPIRY_MS);

    await consentOtpRef(db, uid, addressId).set({
      codeHash,
      expiresAt,
      attempts: 0,
      verified: false,
      addressId,
      createdAt: new Date(),
    });

    // 4. Send email
    const recipientName = address.fullName;
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LetItRip";
    const { subject, html } = buildConsentOtpEmail(
      recipientName,
      code,
      siteName,
    );
    await sendEmail({ to: email, subject, html });

    serverLogger.info(`Consent OTP sent: uid=${uid} addressId=${addressId}`);

    return successResponse({
      sent: true,
      maskedEmail: maskEmail(email),
    });
  },
});
