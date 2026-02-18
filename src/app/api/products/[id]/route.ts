/**
 * Product Detail API Routes
 *
 * Handles individual product operations (get, update, delete)
 *
 * TODO - Phase 2 Refactoring:
 * - Implement view counting/analytics
 * - Add related products recommendations
 * - Add caching with Redis/CloudFlare
 * - Implement optimistic locking for concurrent updates
 * - Add audit logging for all changes
 * - Add soft delete with restore capability
 * - Implement webhook notifications for status changes
 */

import { NextRequest } from "next/server";
import { productRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  requireRoleFromRequest,
  getUserFromRequest,
  requireAuthFromRequest,
} from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  productUpdateSchema,
} from "@/lib/validation/schemas";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/products/[id]
 *
 * Get single product by ID
 *
 * Features:
 * - Fetch product by ID
 * - Increment view count asynchronously
 * - Return 404 if not found
 * - Public access (no authentication required)
 *
 * TODO - Phase 3:
 * - Add cache headers (public, max-age=300)
 * - Add related products recommendations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Fetch product from repository
    const product = await productRepository.findById(id);

    // Handle not found
    if (!product) {
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    }

    // Return product data
    return successResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/products/[id]
 *
 * Update product
 *
 * Body: Partial<ProductDocument>
 *
 * Features:
 * - Require authentication
 * - Ownership check (owner, moderator, or admin can update)
 * - Zod validation for update data
 * - Return updated product
 *
 * TODO - Phase 3:
 * - Handle status transitions (draft -> published requires approval)
 * - Send notifications on status change
 * - Implement optimistic locking for concurrent updates
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Check product exists
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    }

    // Verify ownership (owner, moderator, or admin can update)
    const isOwner = product.sellerId === user.uid;
    const isModerator = user.role === "moderator";
    const isAdmin = user.role === "admin";

    if (!isOwner && !isModerator && !isAdmin) {
      throw new AuthorizationError(ERROR_MESSAGES.PRODUCT.UPDATE_NOT_ALLOWED);
    }

    // Parse and validate update data
    const body = await request.json();
    const validation = validateRequestBody(productUpdateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Update product in repository
    const updatedProduct = await productRepository.update(
      id,
      validation.data as any,
    );

    if (!updatedProduct) {
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND_AFTER_UPDATE);
    }

    // Return updated product
    return successResponse(updatedProduct);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/products/[id]
 *
 * Delete product (soft delete)
 *
 * Features:
 * - Require authentication
 * - Ownership check (owner, moderator, or admin can delete)
 * - Soft delete (set status to 'discontinued')
 * - Return success status
 *
 * TODO - Phase 3:
 * - Handle cascade deletion (reviews, orders, etc.)
 * - Send notification to seller
 * - Add restore capability
 * - Implement audit logging
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Check product exists
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    }

    // Verify ownership (owner, moderator, or admin can delete)
    const isOwner = product.sellerId === user.uid;
    const isModerator = user.role === "moderator";
    const isAdmin = user.role === "admin";

    if (!isOwner && !isModerator && !isAdmin) {
      throw new AuthorizationError(ERROR_MESSAGES.PRODUCT.DELETE_NOT_ALLOWED);
    }

    // Soft delete product (set status to 'discontinued')
    await productRepository.update(id, {
      status: "discontinued",
      updatedAt: new Date(),
    });

    // Return success
    return successResponse(undefined, SUCCESS_MESSAGES.PRODUCT.DELETED);
  } catch (error) {
    return handleApiError(error);
  }
}
