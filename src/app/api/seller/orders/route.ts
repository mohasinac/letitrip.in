/**
 * Seller Orders API Route
 *
 * GET /api/seller/orders
 * Returns all orders for products owned by the authenticated seller.
 * Strategy: fetch seller's products → get product IDs → filter all orders
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { orderRepository, productRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES } from "@/constants";

/**
 * GET /api/seller/orders
 *
 * Returns paginated orders for the authenticated seller's products.
 *
 * Query params:
 *  - filters  (string)  — Sieve filters (e.g. status==pending)
 *  - sorts    (string)  — Sieve sorts (e.g. -createdAt)
 *  - page     (number)  — page number (default 1)
 *  - pageSize (number)  — results per page (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = getSearchParams(request);
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 20, {
      min: 1,
      max: 100,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-orderDate";

    serverLogger.info("Seller orders list requested", {
      sellerId: user.uid,
      filters,
      sorts,
      page,
      pageSize,
    });

    // Step 1: Get only this seller's products (indexed query, not findAll)
    const sellerProducts = await productRepository.findBySeller(user.uid);
    const sellerProductIds = sellerProducts.map((p) => p.id);

    if (sellerProductIds.length === 0) {
      return successResponse({
        orders: [],
        meta: {
          page,
          limit: pageSize,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });
    }

    // Step 2: Firestore-native Sieve query — no full orders scan
    const sieveResult = await orderRepository.listForSeller(sellerProductIds, {
      filters,
      sorts,
      page,
      pageSize,
    });

    return successResponse({
      orders: sieveResult.items,
      meta: {
        page: sieveResult.page,
        limit: sieveResult.pageSize,
        total: sieveResult.total,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
    });
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.ORDER.FETCH_FAILED, { error });
    return handleApiError(error);
  }
}
