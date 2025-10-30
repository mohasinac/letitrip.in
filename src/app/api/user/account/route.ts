import { NextRequest } from "next/server";
import {
  createApiHandler,
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * DELETE /api/user/account
 * Delete user account and all associated data
 */
export const DELETE = createApiHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorizedResponse("Not authenticated");
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const db = getAdminDb();
    const userId = decodedToken.uid;

    // Delete user data from Firestore
    await db.collection("users").doc(userId).delete();

    // Delete user from Firebase Auth
    await auth.deleteUser(userId);

    return successResponse({ message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return errorResponse(error.message || "Failed to delete account");
  }
});
