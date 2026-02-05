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

export const DELETE = createApiHandler({
  auth: true,
  rateLimit: { limit: 3, window: 60 * 60 },
  schema: deleteAccountSchema,
  handler: async ({ user }) => {
    const batch = writeBatch(adminDb);

    // Delete all user data (cascade delete)
    await tokenRepository.email.deleteAllForUser(user.uid);
    await tokenRepository.password.deleteAllForUser(user.uid);

    const tripsQuery = query(
      collection(adminDb, "trips"),
      where("userId", "==", user.uid),
    );
    const tripsSnapshot = await getDocs(tripsQuery);
    tripsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    const bookingsQuery = query(
      collection(adminDb, "bookings"),
      where("userId", "==", user.uid),
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);
    bookingsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();
    await userRepository.delete(user.uid);
    await adminAuth.deleteUser(user.uid);

    return successResponse(null, "Account deleted successfully");
  },
});
