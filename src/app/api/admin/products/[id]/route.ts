/**
 * Admin Product Detail API Route
 * GET    /api/admin/products/[id] — Get single product
 * PATCH  /api/admin/products/[id] — Update any field (admin)
 * DELETE /api/admin/products/[id] — Hard delete product (admin)
 */

import { successResponse, errorResponse } from "@mohasinac/appkit/next";
import { NotFoundError } from "@mohasinac/appkit/errors";
import { productRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security";

type IdParams = { id: string };

/**
 * GET /api/admin/products/[id]
 */
export const GET = createRouteHandler<never, IdParams>({
  roles: ["admin", "moderator"],
  handler: async ({ request, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    return successResponse(product);
  },
});

/**
 * PATCH /api/admin/products/[id] — Admin can update any field
 */
export const PATCH = createRouteHandler<Record<string, unknown>, IdParams>({
  roles: ["admin", "moderator"],
  handler: async ({ request, body, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);

    const updated = await productRepository.update(id, {
      ...body,
      updatedAt: new Date(),
    });
    if (!updated)
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND_AFTER_UPDATE);

    serverLogger.info("Admin updated product", { productId: id });
    return successResponse(updated, SUCCESS_MESSAGES.PRODUCT.UPDATED);
  },
});

/**
 * DELETE /api/admin/products/[id] — Hard delete (admin only)
 */
export const DELETE = createRouteHandler<never, IdParams>({
  roles: ["admin"],
  handler: async ({ request, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);

    await productRepository.delete(id);
    serverLogger.info("Admin deleted product", { productId: id });
    return successResponse(null, SUCCESS_MESSAGES.PRODUCT.DELETED);
  },
});
