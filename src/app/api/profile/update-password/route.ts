/**
 * API Route: Update User Password
 * POST /api/profile/update-password
 *
 * Uses Firebase Admin SDK to update password server-side
 */

import {
  createApiHandler,
  successResponse,
  errorResponse,
} from "@/lib/api/api-handler";
import { updatePasswordSchema } from "@/lib/api/validation-schemas";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

export const POST = createApiHandler({
  auth: true,
  rateLimit: { limit: 5, window: 15 * 60 },
  schema: updatePasswordSchema,
  handler: async ({ body, user }) => {
    const { currentPassword, newPassword } = body!;

    if (!user) {
      return errorResponse(ERROR_MESSAGES.USER.NOT_FOUND, 401);
    }

    const auth = getAuth(getAdminApp());

    // Get user record to check provider
    const userRecord = await auth.getUser(user.uid);
    const hasPasswordProvider = userRecord.providerData.some(
      (p) => p.providerId === "password",
    );

    if (!hasPasswordProvider) {
      return errorResponse(
        ERROR_MESSAGES.PASSWORD.SOCIAL_PROVIDER_NO_PASSWORD,
        400,
      );
    }

    try {
      // Verify current password by attempting to sign in with Firebase REST API
      const apiKey =
        process.env.FIREBASE_API_KEY ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const verifyPasswordUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

      const verifyResponse = await fetch(verifyPasswordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userRecord.email,
          password: currentPassword,
          returnSecureToken: false,
        }),
      });

      if (!verifyResponse.ok) {
        return errorResponse(ERROR_MESSAGES.PASSWORD.INCORRECT, 401);
      }

      // Update password using Admin SDK
      await auth.updateUser(user.uid, {
        password: newPassword,
      });

      return successResponse(null, SUCCESS_MESSAGES.PASSWORD.UPDATED);
    } catch (error: any) {
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        return errorResponse(ERROR_MESSAGES.PASSWORD.INCORRECT, 401);
      }
      throw error;
    }
  },
});
