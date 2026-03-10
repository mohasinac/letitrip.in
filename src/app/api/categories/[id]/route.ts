/**
 * Category Detail API Routes
 *
 * Handles individual category operations (get, update, delete)
 */

import { categoriesRepository } from "@/repositories";
import { categoryUpdateSchema } from "@/lib/validation/schemas";
import type { CategoryDocument } from "@/db/schema/categories";
import { NotFoundError } from "@/lib/errors";
import { successResponse, errorResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

type IdParams = { id: string };

/**
 * GET /api/categories/[id] — Get single category (public)
 */
export const GET = createApiHandler<never, IdParams>({
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const category = await categoriesRepository.findById(id);
    if (!category) throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    return successResponse(category);
  },
});

/**
 * PATCH /api/categories/[id] — Update category (admin)
 */
export const PATCH = createApiHandler<
  (typeof categoryUpdateSchema)["_output"],
  IdParams
>({
  roles: ["admin"],
  rateLimit: RateLimitPresets.API,
  schema: categoryUpdateSchema,
  handler: async ({ body, params }) => {
    const { id } = params!;
    const category = await categoriesRepository.findById(id);
    if (!category) throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND);

    const updated = await categoriesRepository.update(
      id,
      body as Partial<CategoryDocument>,
    );
    if (!updated)
      throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND_AFTER_UPDATE);
    return successResponse(updated);
  },
});

/**
 * DELETE /api/categories/[id] — Delete category if no children or products (admin)
 */
export const DELETE = createApiHandler<never, IdParams>({
  roles: ["admin"],
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const category = await categoriesRepository.findById(id);
    if (!category) throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND);

    if (category.childrenIds.length > 0) {
      return errorResponse(ERROR_MESSAGES.CATEGORY.HAS_CHILDREN, 400, {
        childrenCount: category.childrenIds.length,
        suggestion: "Delete or move child categories first",
      });
    }

    if (category.metrics && category.metrics.productCount > 0) {
      return errorResponse(ERROR_MESSAGES.CATEGORY.HAS_PRODUCTS, 400, {
        productCount: category.metrics.productCount,
        suggestion: "Move products to another category first",
      });
    }

    await categoriesRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
    return successResponse(undefined, SUCCESS_MESSAGES.CATEGORY.DELETED);
  },
});
