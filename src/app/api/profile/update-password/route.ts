/**
 * API Route: Update User Password
 * POST /api/profile/update-password
 */

import {
  createApiHandler,
  successResponse,
  errorResponse,
} from "@/lib/api/api-handler";
import { updatePasswordSchema } from "@/lib/api/validation-schemas";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

export const POST = createApiHandler({
  auth: true,
  rateLimit: { limit: 5, window: 15 * 60 },
  schema: updatePasswordSchema,
  handler: async ({ body }) => {
    const { currentPassword, newPassword } = body!;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      return errorResponse(ERROR_MESSAGES.USER.NOT_FOUND, 401);
    }

    const emailProvider = currentUser.providerData.find(
      (p) => p.providerId === "password",
    );
    if (!emailProvider || !currentUser.email) {
      return errorResponse(
        ERROR_MESSAGES.PASSWORD.SOCIAL_PROVIDER_NO_PASSWORD,
        400,
      );
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword,
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
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
