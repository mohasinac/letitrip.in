/**
 * RipLimit Transactions API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * GET /api/riplimit/transactions - Get transaction history
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getTransactionHistory } from "@/app/api/lib/riplimit";
import { RipLimitTransactionType } from "@/types/backend/riplimit.types";
import { parseSieveQuery } from "@/app/api/lib/sieve";

/**
 * GET /api/riplimit/transactions
 * Returns paginated transaction history for the authenticated user
 *
 * Query params:
 * - type: Filter by transaction type (purchase, bid_block, bid_release, etc.)
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20, max: 100)
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
      limit: query.pageSize,
      offset: (query.page - 1) * query.pageSize,
    });

    const totalPages = Math.ceil(total / query.pageSize);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        total,
      },
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        totalCount: total,
        totalPages,
        hasNextPage: query.page < totalPages,
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
