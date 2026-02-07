/**
 * API Route: Admin Dashboard Statistics
 * GET /api/admin/dashboard
 */

import { createApiHandler, successResponse } from "@/lib/api/api-handler";
import { getAdminDb } from "@/lib/firebase/admin";
import { USER_COLLECTION, userQueryHelpers } from "@/db/schema/users";
import { PRODUCT_COLLECTION } from "@/db/schema/products";
import { ORDER_COLLECTION } from "@/db/schema/orders";

export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async () => {
    const db = getAdminDb();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Use count() aggregation queries instead of fetching all documents
    const usersRef = db.collection(USER_COLLECTION);

    // Parallel execution of all count queries for speed
    const [
      totalUsersSnap,
      activeUsersSnap,
      newUsersSnap,
      disabledUsersSnap,
      adminUsersSnap,
      productsSnap,
      ordersSnap,
    ] = await Promise.all([
      usersRef
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      usersRef
        .where("disabled", "==", false)
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      usersRef
        .where("createdAt", ">=", thirtyDaysAgo)
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      usersRef
        .where("disabled", "==", true)
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      usersRef
        .where("role", "==", "admin")
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      db
        .collection(PRODUCT_COLLECTION)
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      db
        .collection(ORDER_COLLECTION)
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
    ]);

    return successResponse({
      users: {
        total: totalUsersSnap.data().count,
        active: activeUsersSnap.data().count,
        new: newUsersSnap.data().count,
        newThisMonth: newUsersSnap.data().count,
        disabled: disabledUsersSnap.data().count,
        admins: adminUsersSnap.data().count,
      },
      products: {
        total: productsSnap.data().count,
      },
      orders: {
        total: ordersSnap.data().count,
      },
    });
  },
});
