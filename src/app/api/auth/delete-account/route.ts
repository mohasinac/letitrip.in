import { NextRequest } from "next/server";
import {
  createApiHandler,
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * DELETE /api/auth/delete-account
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
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.delete();
    }

    // Delete other user-related data
    // Orders
    const ordersSnapshot = await db
      .collection("orders")
      .where("userId", "==", userId)
      .get();
    const orderBatch = db.batch();
    ordersSnapshot.docs.forEach((doc) => {
      orderBatch.delete(doc.ref);
    });
    if (!ordersSnapshot.empty) {
      await orderBatch.commit();
    }

    // Cart
    const cartRef = db.collection("carts").doc(userId);
    const cartDoc = await cartRef.get();
    if (cartDoc.exists) {
      await cartRef.delete();
    }

    // Reviews
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("userId", "==", userId)
      .get();
    const reviewBatch = db.batch();
    reviewsSnapshot.docs.forEach((doc) => {
      reviewBatch.delete(doc.ref);
    });
    if (!reviewsSnapshot.empty) {
      await reviewBatch.commit();
    }

    // Delete user from Firebase Auth
    await auth.deleteUser(userId);

    return successResponse({
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return errorResponse(error.message || "Failed to delete account");
  }
});

/**
 * POST /api/auth/delete-account
 * Alternative POST endpoint for account deletion
 */
export const POST = DELETE;
