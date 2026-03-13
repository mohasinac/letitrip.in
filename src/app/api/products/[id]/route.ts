/**
 * Product Detail API Routes
 *
 * Handles individual product operations (get, update, delete)
 */

import { productRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { PRODUCT_STATUS_TRANSITIONS } from "@/db/schema";
import { productUpdateSchema } from "@/lib/validation/schemas";
import { AuthorizationError, NotFoundError } from "@/lib/errors";
import { successResponse, errorResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

type IdParams = { id: string };

/**
 * GET /api/products/[id] — Get single product by ID or slug (public)
 */
export const GET = createApiHandler<never, IdParams>({
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const product = await productRepository.findByIdOrSlug(id);
    if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);

    // Track view asynchronously — analytics must not block the response
    productRepository.incrementViewCount(product.id).catch(() => {});

    return successResponse(product);
  },
});

/**
 * PATCH /api/products/[id] — Update product (owner, moderator, or admin)
 */
export const PATCH = createApiHandler<
  (typeof productUpdateSchema)["_output"],
  IdParams
>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  schema: productUpdateSchema,
  handler: async ({ user, body, params }) => {
    const { id } = params!;
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);

    const isOwner = product.sellerId === user!.uid;
    const isModerator = user!.role === "moderator";
    const isAdmin = user!.role === "admin";

    if (!isOwner && !isModerator && !isAdmin) {
      throw new AuthorizationError(ERROR_MESSAGES.PRODUCT.UPDATE_NOT_ALLOWED);
    }

    // Enforce status machine — staff bypass
    const newStatus = body!.status;
    if (newStatus && newStatus !== product.status && !isModerator && !isAdmin) {
      const allowedTransitions =
        PRODUCT_STATUS_TRANSITIONS[product.status as string] ?? [];
      if (!allowedTransitions.includes(newStatus)) {
        return errorResponse(
          ERROR_MESSAGES.PRODUCT.INVALID_STATUS_TRANSITION,
          422,
        );
      }
    }

    const updated = await productRepository.update(id, body as any);
    if (!updated)
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND_AFTER_UPDATE);
    return successResponse(updated);
  },
});

/**
 * DELETE /api/products/[id] — Soft-delete product (owner, moderator, or admin)
 */
export const DELETE = createApiHandler<never, IdParams>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
    const { id } = params!;
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);

    const isOwner = product.sellerId === user!.uid;
    const isModerator = user!.role === "moderator";
    const isAdmin = user!.role === "admin";

    if (!isOwner && !isModerator && !isAdmin) {
      throw new AuthorizationError(ERROR_MESSAGES.PRODUCT.DELETE_NOT_ALLOWED);
    }

    await productRepository.update(id, {
      status: "discontinued",
      updatedAt: new Date(),
    });

    // NOTE: Category metrics and store stats are maintained by the
    // onProductWrite Cloud Function trigger when status changes to "discontinued".
    return successResponse(undefined, SUCCESS_MESSAGES.PRODUCT.DELETED);
  },
});
