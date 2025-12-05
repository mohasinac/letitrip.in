/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/riplimit/users/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Admin RipLimit Users API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * GET /api/admin/riplimit/users - List users with RipLimit accounts
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { COLLECTIONS } from "@/constants/database";
import { RipLimitAccountBE } from "@/types/backend/riplimit.types";

/**
 * GET /api/admin/riplimit/users
 * Returns paginated list of users with RipLimit accounts (admin only)
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
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
    /**
     * Performs offset operation
     *
     * @param {any} query.page - 1) * query.pageSize;
    if (offset > 0 - The query.page - 1) * query.page size;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

    /**
     * Performs offset operation
     *
     * @param {any} query.page - 1) * query.pageSize;
    if (offset > 0 - The query.page - 1) * query.page size;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

    const offset = (query.page - 1) * query.pageSize;
    if (offset > 0) {
      accountsQuery = accountsQuery.offset(offset);
    }
    accountsQuery = accountsQuery.limit(query.pageSize);

    const snapshot = await accountsQuery.get();
    /**
 * Performs accounts operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The accounts result
 *
 */
const accounts = snapshot.docs.map((doc) => ({
      /** User Id */
      userId: doc.id,
      ...doc.data(),
    })) as RipLimitAccountBE/**
 * Custom React hook for rs with details
 *
 * @param {any} accounts.map(async(account - The accounts.map(async(account
 *
 * @returns {Promise<any>} The userswithdetails result
 *
 */
[];

    // Fetch user details for each account
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const usersWithDetails = await Promise.all(
      accounts.map(async (account) => {
        const userDoc = await usersCollection.doc(account.userId).get();
        const userData = userDoc.data();
        return {
          ...account,
          /** User */
          user: userData
            ? {
                /** Email */
                email: userData.email,
                /** Display Name */
                displayName: userData.displayName,
                /** Photo U R L */
                photoURL: userData.photoURL,
              }
            : null,
        };
      }),
    );

    const totalPages = Math.ceil(totalCount / query.pageSize);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: usersWithDetails,
      /** Pagination */
      pagination: {
        /** Page */
        page: query.page,
        /** Page Size */
        pageSize: query.pageSize,
        totalCount,
        totalPages,
        /** Has Next Page */
        hasNextPage: query.page < totalPages,
        /** Has Previous Page */
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
