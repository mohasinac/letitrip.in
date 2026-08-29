import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
/**
 * Payment OTP - Request Gate
 *
 * POST /api/payment/otp/request
 *
 * Server-side gate that enforces the Firebase free-tier daily OTP limit (1 000/day IST).
 * The client MUST call this endpoint before invoking signInWithPhoneNumber on the Firebase
 * client SDK.  If allowed, it atomically increments the Firestore daily counter and returns
 * { allowed: true }.  When the cap is reached it returns 429.
 *
 * Auth required: yes (payments are only for logged-in users).
 */

import { successResponse } from "@mohasinac/appkit";
import { ApiError } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { smsCounterRepository } from "@mohasinac/appkit";
import { siteSettingsRepository } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";

/** Return today's date string (YYYY-MM-DD) in IST (UTC+5:30). */
function getTodayIST(): string {
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().split("T")[0];
}

const __POST__g = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    // 0. Admin-controlled kill switch — when smsVerification is off, skip the
    // gate entirely regardless of any per-user phoneVerified state. Toggling
    // it back on resets all users' phoneVerified + clears rate-limit state
    // via the resetOtpVerification job (see PATCH /api/site-settings).
    const settings = await siteSettingsRepository.getSingleton();
    if (settings.payment?.smsVerification !== true) {
      return successResponse({ allowed: false, count: 0 }, "SMS verification is currently disabled.");
    }

    // 1. Per-user 15-minute cooldown â€” checked via Firestore so it persists across
    //    devices and server restarts (in-memory rate limiting is insufficient here).
    const cooldown = await smsCounterRepository.checkAndSetUserCooldown(
      user!.uid,
    );
    if (!cooldown.allowed) {
      const minutesLeft = Math.ceil(cooldown.retryAfterSeconds / 60);
      serverLogger.warn(
        `OTP cooldown active for uid ${user!.uid} â€” retry in ${cooldown.retryAfterSeconds}s`,
      );
      throw new ApiError(
        429,
        `Please wait ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""} before requesting another OTP.`,
      );
    }

    // 2. Daily global cap â€” protects the Firebase free-tier SMS quota (1 000/day IST).
    const dateStr = getTodayIST();
    const { allowed, count } =
      await smsCounterRepository.checkAndIncrement(dateStr);

    if (!allowed) {
      serverLogger.warn(
        `OTP daily limit reached for ${dateStr} â€” request by uid ${user!.uid}`,
      );
      throw new ApiError(429, ERROR_MESSAGES.CHECKOUT.OTP_DAILY_LIMIT);
    }

    serverLogger.info(
      `OTP grant issued: uid=${user!.uid} date=${dateStr} count=${count}`,
    );

    return successResponse({ allowed: true, count });
  },
}));

export const POST = withFeatureGuard("RAZORPAY", __POST__g);
