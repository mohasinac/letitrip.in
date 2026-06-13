import { withProviders } from "@/providers.config";
/**
 * Admin Products API Route
 * GET  /api/admin/products — Delegated to @mohasinac/feat-admin
 * POST /api/admin/products — Create a new product (admin, local)
 */


import { createApiHandler } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import {
  finalizeStagedMediaUrl,
  finalizeStagedMediaField,
  finalizeStagedMediaArray,
} from "@mohasinac/appkit";
import {
  validateRequestBody,
  formatZodErrors,
  productCreateSchema,
} from "@/validation/request-schemas";
import { ROLES_ADMIN_MOD } from "@/constants";

/**
 * GET /api/admin/products
 */
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(createApiHandler({
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:products:read",
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
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
}));

/**
 * POST /api/admin/products
 *
 * Create a new product as admin (can set any status, sellerId etc.)
 */
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const POST = withProviders(createApiHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:products:write",
    handler: async ({ request, user: _user }) => {
    const body = await request.json();
    const validation = validateRequestBody(productCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    const data = validation.data as Record<string, unknown> & {
      mainImage?: string;
      images?: string[];
      video?: { url?: string; thumbnailUrl?: string };
    };
    if (typeof data.mainImage === "string" && data.mainImage) {
      data.mainImage = await finalizeStagedMediaUrl(data.mainImage);
    }
    if (Array.isArray(data.images) && data.images.length > 0) {
      data.images = await finalizeStagedMediaArray(data.images);
    }
    if (data.video?.url) {
      data.video = {
        ...data.video,
        url: await finalizeStagedMediaUrl(data.video.url),
        thumbnailUrl: await finalizeStagedMediaField(data.video.thumbnailUrl),
      };
    }

    const product = await productRepository.create({
      ...data,
      storeId: body.storeId,
      storeName: body.storeName || "Admin",
    } as any);

    serverLogger.info("Admin created product", { productId: product.id });

    return successResponse(product, SUCCESS_MESSAGES.PRODUCT.CREATED, 201);
  },
}));

