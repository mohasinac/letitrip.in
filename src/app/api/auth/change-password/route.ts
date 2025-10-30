import { NextRequest } from "next/server";
import {
  createApiHandler,
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api";
import { getAdminAuth } from "@/lib/database/admin";
import { z } from "zod";

/**
 * Password change validation schema
 */
const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
export const POST = createApiHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorizedResponse("Not authenticated");
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const body = await request.json();

    // Validate input
    const validationResult = PasswordChangeSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.errors[0].message, 400);
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return errorResponse(
        "New password must be different from current password",
        400,
      );
    }

    // Update password in Firebase Auth
    await auth.updateUser(decodedToken.uid, {
      password: newPassword,
    });

    return successResponse({
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Error changing password:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/wrong-password") {
      return errorResponse("Current password is incorrect", 401);
    }

    return errorResponse(error.message || "Failed to change password");
  }
});
