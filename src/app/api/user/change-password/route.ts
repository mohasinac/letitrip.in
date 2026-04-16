import "@/providers.config";
/**
 * Change Password API Route
 * POST /api/user/change-password
 *
 * Allows authenticated users to update their Firebase Auth password.
 * Client MUST reauthenticate with currentPassword via Firebase SDK before calling.
 */

import { getAdminAuth } from "@mohasinac/appkit/providers/db-firebase";
import { SUCCESS_MESSAGES } from "@/constants";
import { successResponse } from "@mohasinac/appkit/next";
import { changePasswordSchema } from "@mohasinac/appkit/validation";
import { createRouteHandler } from "@mohasinac/appkit/next";

export const POST = createRouteHandler<
  (typeof changePasswordSchema)["_output"]
>({
  auth: true,
  schema: changePasswordSchema,
  handler: async ({ user, body }) => {
    const { newPassword } = body!;

    // Firebase Admin SDK: update password server-side after client reauthentication
    await getAdminAuth().updateUser(user!.uid, { password: newPassword });

    return successResponse(undefined, SUCCESS_MESSAGES.USER.PASSWORD_CHANGED);
  },
});

