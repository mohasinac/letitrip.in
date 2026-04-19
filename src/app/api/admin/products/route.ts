import "@/providers.config";
/**
 * Admin Products API Route
 * GET  /api/admin/products — Delegated to @mohasinac/feat-admin
 * POST /api/admin/products — Create a new product (admin, local)
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@mohasinac/appkit/server";
import { successResponse, errorResponse } from "@mohasinac/appkit/server";
import { productRepository } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";
import {
  validateRequestBody,
  formatZodErrors,
  productCreateSchema,
} from "@/validation/request-schemas";

/**
 * GET /api/admin/products
 */
export const GET = createApiHandler({
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      200,
      Math.max(1, Number(url.searchParams.get("pageSize")) || 50),
    );
    const filters = url.searchParams.get("filters") ?? undefined;
    const sorts =
      url.searchParams.get("sorts") ??
      url.searchParams.get("sort") ??
      "-createdAt";
    const result = await productRepository.list({
      filters,
      sorts,
      page,
      pageSize,
    });
    return successResponse({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
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
    handler: async ({ request, user }) => {
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

