import { withProviders } from "@/providers.config";
/**
 * Change Password API Route
 * POST /api/user/change-password
 *
 * Allows authenticated users to update their Firebase Auth password —
 * gated behind a server-verified email OTP (see
 * appkit/src/features/auth/password-change-otp.ts). Root-caused
 * 2026-08-20: this handler used to trust `currentPassword`'s presence in
 * the request body without ever checking it, and the only real check
 * (Firebase client-SDK reauthentication) happened in the browser and was
 * trivially bypassed by calling this route directly with a stolen session
 * cookie. isPasswordChangeOtpVerified() is the actual server-side identity
 * gate now — POST /api/user/change-password/otp/request +
 * .../otp/verify must both succeed first.
 */

import { getAdminAuth } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { changePasswordSchema } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { isPasswordChangeOtpVerified, consumePasswordChangeOtp } from "@mohasinac/appkit";

export const POST = withProviders(createRouteHandler<
  (typeof changePasswordSchema)["_output"]
>({
  auth: true,
  schema: changePasswordSchema,
  handler: async ({ user, body }) => {
    const { newPassword } = body!;

    if (!(await isPasswordChangeOtpVerified(user!.uid))) {
      return errorResponse("Please verify the emailed code before changing your password.", 403);
    }

    // Firebase Admin SDK: update password server-side, only after the OTP gate above.
    await getAdminAuth().updateUser(user!.uid, { password: newPassword });
    // One-time use — the next password change needs a fresh OTP.
    await consumePasswordChangeOtp(user!.uid);

    return successResponse(undefined, SUCCESS_MESSAGES.USER.PASSWORD_CHANGED);
  },
}));
