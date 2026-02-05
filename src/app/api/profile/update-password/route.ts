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

export const POST = createApiHandler({
  auth: true,
  rateLimit: { limit: 5, window: 15 * 60 },
  schema: updatePasswordSchema,
  handler: async ({ body }) => {
    const { currentPassword, newPassword } = body!;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      return errorResponse("User not found in auth context", 401);
    }

    const emailProvider = currentUser.providerData.find(
      (p) => p.providerId === "password",
    );
    if (!emailProvider || !currentUser.email) {
      return errorResponse(
        "Password change not available. You signed in with a social provider.",
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
      return successResponse(null, "Password updated successfully");
    } catch (error: any) {
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        return errorResponse("Current password is incorrect", 401);
      }
      throw error;
    }
  },
});
