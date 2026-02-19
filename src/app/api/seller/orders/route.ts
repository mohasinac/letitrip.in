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
import { applySieveToArray } from "@/helpers";
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

    // Step 1: Get all products owned by this seller
    const allProducts = await productRepository.findAll();
    const sellerProductIds = new Set(
      allProducts.filter((p) => p.sellerId === user.uid).map((p) => p.id),
    );

    if (sellerProductIds.size === 0) {
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

    // Step 2: Get all orders and filter by seller's products
    const allOrders = await orderRepository.findAll();
    const sellerOrders = allOrders.filter((o) =>
      sellerProductIds.has(o.productId),
    );

    // Step 3: Apply Sieve for filtering, sorting, pagination
    const sieveResult = await applySieveToArray({
      items: sellerOrders,
      model: { filters, sorts, page, pageSize },
      fields: {
        id: { canFilter: true, canSort: false },
        productId: { canFilter: true, canSort: false },
        productTitle: { canFilter: true, canSort: true },
        userId: { canFilter: true, canSort: false },
        userName: { canFilter: true, canSort: true },
        status: { canFilter: true, canSort: true },
        paymentStatus: { canFilter: true, canSort: true },
        totalPrice: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => Number(v),
        },
        orderDate: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => new Date(v),
        },
        createdAt: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => new Date(v),
        },
      },
      options: {
        defaultPageSize: 20,
        maxPageSize: 100,
      },
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
