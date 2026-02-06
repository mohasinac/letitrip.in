/**
 * API Route: Delete User Account
 * DELETE /api/profile/delete-account
 */

import { createApiHandler, successResponse } from "@/lib/api/api-handler";
import { deleteAccountSchema } from "@/lib/api/validation-schemas";
import { userRepository, tokenRepository } from "@/repositories";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { SUCCESS_MESSAGES } from "@/constants";
import { PRODUCT_COLLECTION } from "@/db/schema/products";
import { ORDER_COLLECTION } from "@/db/schema/orders";

export const DELETE = createApiHandler({
  auth: true,
  rateLimit: { limit: 3, window: 60 * 60 },
  schema: deleteAccountSchema,
  handler: async ({ user }) => {
    const db = getAdminDb();
    const batch = db.batch();

    // Delete all user data (cascade delete)
    await tokenRepository.email.deleteAllForUser(user.uid);
    await tokenRepository.password.deleteAllForUser(user.uid);

    // Delete user's products (if seller)
    const productsSnapshot = await db
      .collection(PRODUCT_COLLECTION)
      .where("sellerId", "==", user.uid)
      .get();
    productsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // Delete user's orders
    const ordersSnapshot = await db
      .collection(ORDER_COLLECTION)
      .where("userId", "==", user.uid)
      .get();
    ordersSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();
    await userRepository.delete(user.uid);
    await getAdminAuth().deleteUser(user.uid);

    return successResponse(null, SUCCESS_MESSAGES.ACCOUNT.DELETED);
  },
});
