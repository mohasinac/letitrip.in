/**
 * @fileoverview TypeScript Module
 * @module src/app/api/riplimit/transactions/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * RipLimit Transactions API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * GET /api/riplimit/transactions - Get transaction history
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getTransactionHistory } from "@/app/api/lib/riplimit/transactions";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { RipLimitTransactionType } from "@/types/backend/riplimit.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/riplimit/transactions
 * Returns paginated transaction history for the authenticated user
 *
 * Query params:
 * - type: Filter by transaction type (purchase, bid_block, bid_release, etc.)
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20, max: 100)
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
    // Authenticate user
    const auth = await getAuthFromRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse pagination using sieve
    const { query } = parseSieveQuery(searchParams);

    // Get transaction type filter
    const typeParam = searchParams.get("type");
    let type: RipLimitTransactionType | undefined;
    if (
      typeParam &&
      Object.values(RipLimitTransactionType).includes(
        typeParam as RipLimitTransactionType,
      )
    ) {
      type = typeParam as RipLimitTransactionType;
    }

    const { transactions, total } = await getTransactionHistory(auth.user.uid, {
      type,
      /** Limit */
      limit: query.pageSize,
      /** Offset */
      offset: (query.page - 1) * query.pageSize,
    });

    const totalPages = Math.ceil(total / query.pageSize);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        transactions,
        total,
      },
      /** Pagination */
      pagination: {
        /** Page */
        page: query.page,
        /** Page Size */
        pageSize: query.pageSize,
        /** Total Count */
        totalCount: total,
        totalPages,
        /** Has Next Page */
        hasNextPage: query.page < totalPages,
        /** Has Previous Page */
        hasPreviousPage: query.page > 1,
      },
    });
  } catch (error) {
    console.error("Error getting RipLimit transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get transactions" },
      { status: 500 },
    );
  }
}
