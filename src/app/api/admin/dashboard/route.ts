/**
 * API Route: Admin Dashboard Statistics
 * GET /api/admin/dashboard
 */

import { createApiHandler, successResponse } from "@/lib/api/api-handler";
import { db as adminDb } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getCountFromServer,
  Timestamp,
} from "firebase/firestore";
import { USER_COLLECTION } from "@/db/schema/users";

export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async () => {
    const thirtyDaysAgo = Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    );
    const usersRef = collection(adminDb, USER_COLLECTION);

    const [totalUsers, activeUsers, newUsers, disabledUsers, trips, bookings] =
      await Promise.all([
        getCountFromServer(usersRef),
        getCountFromServer(query(usersRef, where("disabled", "==", false))),
        getCountFromServer(
          query(usersRef, where("createdAt", ">=", thirtyDaysAgo)),
        ),
        getCountFromServer(query(usersRef, where("disabled", "==", true))),
        getCountFromServer(collection(adminDb, "trips")).catch(() => ({
          data: () => ({ count: 0 }),
        })),
        getCountFromServer(collection(adminDb, "bookings")).catch(() => ({
          data: () => ({ count: 0 }),
        })),
      ]);

    return successResponse({
      users: {
        total: totalUsers.data().count,
        active: activeUsers.data().count,
        new: newUsers.data().count,
        disabled: disabledUsers.data().count,
      },
      trips: trips.data().count,
      bookings: bookings.data().count,
    });
  },
});
