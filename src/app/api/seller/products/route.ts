/**
 * Seller Products API Route
 * GET  /api/seller/products — List the authenticated seller's own products
 * POST /api/seller/products — Create a new product listing (seller)
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { productRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  validateRequestBody,
  formatZodErrors,
  productCreateSchema,
} from "@/lib/validation/schemas";

/**
 * GET /api/seller/products
 *
 * List products belonging to the authenticated seller with pagination.
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["seller", "admin", "moderator"],
  handler: async ({ request, user }: { request: NextRequest; user?: any }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 25, {
      min: 1,
      max: 100,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    const sellerFilter = `sellerId==${user?.uid}`;
    const combinedFilters = filters
      ? `${sellerFilter},${filters}`
      : sellerFilter;

    serverLogger.info("Seller products list requested", {
      sellerId: user?.uid,
      filters: combinedFilters,
      page,
      pageSize,
    });

    const sieveResult = await productRepository.list({
      filters: combinedFilters,
      sorts,
      page,
      pageSize,
    });

    return successResponse({
      products: sieveResult.items,
      meta: {
        page: sieveResult.page,
        limit: sieveResult.pageSize,
        total: sieveResult.total,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
    });
  },
});

/**
 * POST /api/seller/products
 *
 * Create a new product listing for the authenticated seller.
 * Status is always forced to 'draft' on creation.
 */
export const POST = createApiHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ request, user }: { request: NextRequest; user?: any }) => {
    const body = await request.json();
    const validation = validateRequestBody(productCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    const product = await productRepository.create({
      ...validation.data,
      sellerId: user?.uid,
      sellerName: user?.displayName || user?.email || "Seller",
      sellerEmail: user?.email || "",
      status: "draft",
    } as any);

    serverLogger.info("Seller created product", {
      sellerId: user?.uid,
      productId: product.id,
    });

    return successResponse(product, SUCCESS_MESSAGES.PRODUCT.CREATED, 201);
  },
});
