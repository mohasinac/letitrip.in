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

import { successResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";
import { smsCounterRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";

/** Return today's date string (YYYY-MM-DD) in IST (UTC+5:30). */
function getTodayIST(): string {
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().split("T")[0];
}

export const POST = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    const dateStr = getTodayIST();

    const { allowed, count } =
      await smsCounterRepository.checkAndIncrement(dateStr);

    if (!allowed) {
      serverLogger.warn(
        `OTP daily limit reached for ${dateStr} — request by uid ${user!.uid}`,
      );
      throw new ApiError(429, ERROR_MESSAGES.CHECKOUT.OTP_DAILY_LIMIT);
    }

    serverLogger.info(
      `OTP grant issued: uid=${user!.uid} date=${dateStr} count=${count}`,
    );

    return successResponse({ allowed: true, count });
  },
});
