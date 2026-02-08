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

import { NextRequest, NextResponse } from "next/server";
import { productRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
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
      throw new NotFoundError("Product not found");
    }

    // Return product data
    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    const { id } = await params;
    console.error(
      `GET /api/products/${id} ${ERROR_MESSAGES.API.PRODUCTS_ID_GET_ERROR}`,
      error,
    );
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 },
    );
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
      throw new NotFoundError("Product not found");
    }

    // Verify ownership (owner, moderator, or admin can update)
    const isOwner = product.sellerId === user.uid;
    const isModerator = user.role === "moderator";
    const isAdmin = user.role === "admin";

    if (!isOwner && !isModerator && !isAdmin) {
      throw new AuthorizationError(
        "You do not have permission to update this product",
      );
    }

    // Parse and validate update data
    const body = await request.json();
    const validation = validateRequestBody(productUpdateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 },
      );
    }

    // Update product in repository
    const updatedProduct = await productRepository.update(
      id,
      validation.data as any,
    );

    if (!updatedProduct) {
      throw new NotFoundError("Product not found after update");
    }

    // Return updated product
    return NextResponse.json(
      { success: true, data: updatedProduct },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    const { id } = await params;
    console.error(
      `PATCH /api/products/${id} ${ERROR_MESSAGES.API.PRODUCTS_ID_PATCH_ERROR}`,
      error,
    );
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 },
    );
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
      throw new NotFoundError("Product not found");
    }

    // Verify ownership (owner, moderator, or admin can delete)
    const isOwner = product.sellerId === user.uid;
    const isModerator = user.role === "moderator";
    const isAdmin = user.role === "admin";

    if (!isOwner && !isModerator && !isAdmin) {
      throw new AuthorizationError(
        "You do not have permission to delete this product",
      );
    }

    // Soft delete product (set status to 'discontinued')
    await productRepository.update(id, {
      status: "discontinued",
      updatedAt: new Date(),
    });

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    const { id } = await params;
    console.error(
      `DELETE /api/products/${id} ${ERROR_MESSAGES.API.PRODUCTS_ID_DELETE_ERROR}`,
      error,
    );
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
