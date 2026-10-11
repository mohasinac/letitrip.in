import { withProviders } from "@/providers.config";
/**
 * Reset Password API Route
 * PUT /api/auth/reset-password
 *
 * Reset user password using Firebase password reset token.
 * Note: Firebase Admin SDK cannot verify reset tokens directly;
 * client must call confirmPasswordReset() first, then call this
 * endpoint to log/acknowledge the change.
 */


import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { resetPasswordSchema } from "@mohasinac/appkit/validation/schemas";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { errorResponse } from "@mohasinac/appkit/next/api/api-response";

export const PUT = withProviders(createRouteHandler<(typeof resetPasswordSchema)["_output"]>({
  schema: resetPasswordSchema,
  handler: async ({ body, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.PASSWORD_RESET);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { newPassword } = body!;

    // Firebase Admin SDK: token is verified client-side via confirmPasswordReset().
    // This endpoint is called post-reset to update the password server-side if needed.
    serverLogger.info("Password reset acknowledged via API");
    void newPassword; // token + newPassword validated by schema; Firebase handles actual reset

    return successResponse(undefined, SUCCESS_MESSAGES.USER.PASSWORD_CHANGED);
  },
}));
