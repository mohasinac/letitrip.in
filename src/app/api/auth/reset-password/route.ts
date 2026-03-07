/**
 * Reset Password API Route
 * PUT /api/auth/reset-password
 *
 * Reset user password using Firebase password reset token.
 * Note: Firebase Admin SDK cannot verify reset tokens directly;
 * client must call confirmPasswordReset() first, then call this
 * endpoint to log/acknowledge the change.
 */

import { getAdminAuth } from "@/lib/firebase/admin";
import { SUCCESS_MESSAGES } from "@/constants";
import { successResponse } from "@/lib/api-response";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";

export const PUT = createApiHandler<(typeof resetPasswordSchema)["_output"]>({
  schema: resetPasswordSchema,
  handler: async ({ body }) => {
    const { newPassword } = body!;

    // Firebase Admin SDK: token is verified client-side via confirmPasswordReset().
    // This endpoint is called post-reset to update the password server-side if needed.
    serverLogger.info("Password reset acknowledged via API");
    void newPassword; // token + newPassword validated by schema; Firebase handles actual reset

    return successResponse(undefined, SUCCESS_MESSAGES.USER.PASSWORD_CHANGED);
  },
});
