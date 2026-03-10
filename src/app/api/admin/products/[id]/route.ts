/**
 * Admin Product Detail API Route
 * GET    /api/admin/products/[id] — Get single product
 * PATCH  /api/admin/products/[id] — Update any field (admin)
 * DELETE /api/admin/products/[id] — Hard delete product (admin)
 */

import { successResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { productRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

type IdParams = { id: string };

/**
 * GET /api/admin/products/[id]
 */
export const GET = createApiHandler<never, IdParams>({
  roles: ["admin", "moderator"],
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    return successResponse(product);
  },
});

/**
 * PATCH /api/admin/products/[id] — Admin can update any field
 */
export const PATCH = createApiHandler<Record<string, unknown>, IdParams>({
  roles: ["admin", "moderator"],
  rateLimit: RateLimitPresets.API,
  handler: async ({ body, params }) => {
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
export const DELETE = createApiHandler<never, IdParams>({
  roles: ["admin"],
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);

    await productRepository.delete(id);
    serverLogger.info("Admin deleted product", { productId: id });
    return successResponse(null, SUCCESS_MESSAGES.PRODUCT.DELETED);
  },
});
