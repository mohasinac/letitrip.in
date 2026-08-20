/**
 * POST /api/user/change-password/otp/verify
 *
 * Step 2 of the password-change identity gate — see
 * appkit/src/features/auth/password-change-otp.ts. On success,
 * isPasswordChangeOtpVerified(uid) flips true, which
 * POST /api/user/change-password checks before actually applying the new
 * password.
 */
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  verifyPasswordChangeOtp,
  rateLimitByIdentifier,
  ValidationError,
  PASSWORD_CHANGE_OTP_VERIFY_RATE_LIMIT,
} from "@mohasinac/appkit";

const verifySchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/, "Must be 6 digits"),
});

export const POST = withProviders(
  createRouteHandler<(typeof verifySchema)["_output"]>({
    auth: true,
    schema: verifySchema,
    handler: async ({ user, body }) => {
      const rl = await rateLimitByIdentifier(
        `user:change-password:otp-verify:${user!.uid}`,
        PASSWORD_CHANGE_OTP_VERIFY_RATE_LIMIT,
      );
      if (!rl.success) {
        return errorResponse("Too many attempts. Please slow down.", 429);
      }

      try {
        await verifyPasswordChangeOtp(user!.uid, body!.code);
        return successResponse(undefined, "Code verified.");
      } catch (err) {
        if (err instanceof ValidationError) {
          return errorResponse(err.message, 400);
        }
        throw err;
      }
    },
  }),
);
