/**
 * API Route: Get All Users (Admin Only)
 * GET /api/admin/users
 */

import { createApiHandler, successResponse } from "@/lib/api/api-handler";
import { db as adminDb } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { USER_COLLECTION } from "@/db/schema/users";

export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");
    const disabledFilter = searchParams.get("disabled");
    const searchTerm = searchParams.get("search");
    const pageLimit = parseInt(searchParams.get("limit") || "20");

    let usersQuery = query(
      collection(adminDb, USER_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(pageLimit),
    );

    if (roleFilter)
      usersQuery = query(usersQuery, where("role", "==", roleFilter));
    if (disabledFilter !== null)
      usersQuery = query(
        usersQuery,
        where("disabled", "==", disabledFilter === "true"),
      );

    const snapshot = await getDocs(usersQuery);
    let users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter(
        (u: any) =>
          u.email?.toLowerCase().includes(term) ||
          u.displayName?.toLowerCase().includes(term),
      );
    }

    return successResponse({ users, total: users.length });
  },
});
