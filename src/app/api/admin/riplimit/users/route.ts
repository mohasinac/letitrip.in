/**
 * Admin RipLimit Users API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * GET /api/admin/riplimit/users - List users with RipLimit accounts
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { parseSieveQuery } from "@/app/api/lib/sieve";
import { COLLECTIONS } from "@/constants/database";
import { RipLimitAccountBE } from "@/types/backend/riplimit.types";

/**
 * GET /api/admin/riplimit/users
 * Returns paginated list of users with RipLimit accounts (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and check admin role
    const auth = await getAuthFromRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const isAdmin = auth.role === "admin";
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const { query } = parseSieveQuery(searchParams);

    const db = getFirestoreAdmin();
    let accountsQuery = db
      .collection(COLLECTIONS.RIPLIMIT_ACCOUNTS)
      .orderBy("availableBalance", "desc");

    // Apply filters if provided
    const hasUnpaid = searchParams.get("hasUnpaid");
    if (hasUnpaid === "true") {
      accountsQuery = accountsQuery.where("hasUnpaidAuctions", "==", true);
    }

    const isBlocked = searchParams.get("isBlocked");
    if (isBlocked === "true") {
      accountsQuery = accountsQuery.where("isBlocked", "==", true);
    }

    // Get total count
    const countSnapshot = await accountsQuery.count().get();
    const totalCount = countSnapshot.data().count;

    // Apply pagination
    const offset = (query.page - 1) * query.pageSize;
    if (offset > 0) {
      accountsQuery = accountsQuery.offset(offset);
    }
    accountsQuery = accountsQuery.limit(query.pageSize);

    const snapshot = await accountsQuery.get();
    const accounts = snapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as RipLimitAccountBE[];

    // Fetch user details for each account
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const usersWithDetails = await Promise.all(
      accounts.map(async (account) => {
        const userDoc = await usersCollection.doc(account.userId).get();
        const userData = userDoc.data();
        return {
          ...account,
          user: userData
            ? {
                email: userData.email,
                displayName: userData.displayName,
                photoURL: userData.photoURL,
              }
            : null,
        };
      }),
    );

    const totalPages = Math.ceil(totalCount / query.pageSize);

    return NextResponse.json({
      success: true,
      data: usersWithDetails,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        totalCount,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    });
  } catch (error) {
    console.error("Error getting RipLimit users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get users" },
      { status: 500 },
    );
  }
}
