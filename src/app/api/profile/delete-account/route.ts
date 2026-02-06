/**
 * API Route: Delete User Account
 * DELETE /api/profile/delete-account
 */

import { createApiHandler, successResponse } from "@/lib/api/api-handler";
import { deleteAccountSchema } from "@/lib/api/validation-schemas";
import { userRepository, tokenRepository } from "@/repositories";
import { adminAuth } from "@/lib/firebase/admin";
import { db as adminDb } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { SUCCESS_MESSAGES } from "@/constants";
import { PRODUCT_COLLECTION } from "@/db/schema/products";
import { ORDER_COLLECTION } from "@/db/schema/bookings";

export const DELETE = createApiHandler({
  auth: true,
  rateLimit: { limit: 3, window: 60 * 60 },
  schema: deleteAccountSchema,
  handler: async ({ user }) => {
    const batch = writeBatch(adminDb);

    // Delete all user data (cascade delete)
    await tokenRepository.email.deleteAllForUser(user.uid);
    await tokenRepository.password.deleteAllForUser(user.uid);

    // Delete user's products (if seller)
    const productsQuery = query(
      collection(adminDb, PRODUCT_COLLECTION),
      where("sellerId", "==", user.uid),
    );
    const productsSnapshot = await getDocs(productsQuery);
    productsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // Delete user's orders
    const ordersQuery = query(
      collection(adminDb, ORDER_COLLECTION),
      where("userId", "==", user.uid),
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    ordersSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();
    await userRepository.delete(user.uid);
    await adminAuth.deleteUser(user.uid);

    return successResponse(null, SUCCESS_MESSAGES.ACCOUNT.DELETED);
  },
});
