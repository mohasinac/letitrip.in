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
import { PRODUCT_COLLECTION } from "@/db/schema/products";
import { ORDER_COLLECTION } from "@/db/schema/orders";

export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async () => {
    const thirtyDaysAgo = Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    );
    const usersRef = collection(adminDb, USER_COLLECTION);
    const productsRef = collection(adminDb, PRODUCT_COLLECTION);
    const ordersRef = collection(adminDb, ORDER_COLLECTION);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      disabledUsers,
      adminUsers,
      totalProducts,
      totalOrders,
    ] = await Promise.all([
      getCountFromServer(usersRef),
      getCountFromServer(query(usersRef, where("disabled", "==", false))),
      getCountFromServer(
        query(usersRef, where("createdAt", ">=", thirtyDaysAgo)),
      ),
      getCountFromServer(query(usersRef, where("disabled", "==", true))),
      getCountFromServer(query(usersRef, where("role", "==", "admin"))),
      getCountFromServer(productsRef).catch(() => ({
        data: () => ({ count: 0 }),
      })),
      getCountFromServer(ordersRef).catch(() => ({
        data: () => ({ count: 0 }),
      })),
    ]);

    return successResponse({
      users: {
        total: totalUsers.data().count,
        active: activeUsers.data().count,
        new: newUsers.data().count,
        newThisMonth: newUsers.data().count, // Same as new for now
        disabled: disabledUsers.data().count,
        admins: adminUsers.data().count,
      },
      products: {
        total: totalProducts.data().count,
      },
      orders: {
        total: totalOrders.data().count,
      },
    });
  },
});
