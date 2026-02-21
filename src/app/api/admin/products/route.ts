/**
 * Admin Products API Route
 * GET  /api/admin/products — List all products with pagination & filtering
 * POST /api/admin/products — Create a new product (admin)
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
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
import { errorResponse } from "@/lib/api-response";

/**
 * GET /api/admin/products
 *
 * Query params:
 *  - filters  (string)  — Sieve filters (e.g. status==published)
 *  - sorts    (string)  — Sieve sorts (e.g. -createdAt)
 *  - page     (number)  — page number (default 1)
 *  - pageSize (number)  — results per page (default 50)
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }: { request: NextRequest }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 200,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    serverLogger.info("Admin products list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    const sieveResult = await productRepository.list({
      filters,
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
 * POST /api/admin/products
 *
 * Create a new product as admin (can set any status, sellerId etc.)
 */
export const POST = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
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
      sellerId: body.sellerId || user?.uid,
      sellerName:
        body.sellerName || user?.displayName || user?.email || "Admin",
      sellerEmail: body.sellerEmail || user?.email || "",
    } as any);

    serverLogger.info("Admin created product", { productId: product.id });

    return successResponse(product, SUCCESS_MESSAGES.PRODUCT.CREATED, 201);
  },
});
