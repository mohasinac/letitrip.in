/**
 * POST /api/user/change-password/otp/request
 *
 * Step 1 of the password-change identity gate — see
 * appkit/src/features/auth/password-change-otp.ts. The client has already
 * called reauthenticateOnly(currentPassword) via the Firebase client SDK
 * before hitting this route (proves current-password knowledge); this
 * route emails a 6-digit code that /otp/verify then checks server-side.
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  sendPasswordChangeOtp,
  AuthorizationError,
} from "@mohasinac/appkit";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      if (!user!.email) {
        return errorResponse("Account email is required to send a verification code.", 400);
      }
      try {
        const { maskedEmail } = await sendPasswordChangeOtp(user!.uid, user!.email);
        return successResponse({ maskedEmail }, "Verification code sent.");
      } catch (err) {
        if (err instanceof AuthorizationError) {
          return errorResponse("Please wait before requesting another code.", 429);
        }
        throw err;
      }
    },
  }),
);
