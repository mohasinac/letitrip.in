/**
 * Category Detail API Routes
 *
 * Handles individual category operations (get, update, delete)
 *
 * TODO - Phase 3 Refactoring:
 * - Implement category analytics
 * - Add category merge functionality
 * - Implement category export/import
 * - Add webhook notifications for changes
 */

import { NextRequest, NextResponse } from "next/server";
import { categoriesRepository } from "@/repositories";
import { CategoryDocument } from "@/db/schema/categories";
import {
  requireRoleFromRequest,
  requireAuthFromRequest,
} from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  categoryUpdateSchema,
} from "@/lib/validation/schemas";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/categories/[id]
 *
 * Get single category by ID with full details
 *
 * Features:
 * - Fetch category by ID
 * - Return 404 if not found
 * - Include children info
 * - Public access (no authentication required)
 *
 * TODO - Phase 4:
 * - Add related products count
 * - Add breadcrumb trail
 * - Add cache headers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Fetch category from repository
    const category = await categoriesRepository.findById(id);

    // Handle not found
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Return category data
    return NextResponse.json(
      { success: true, data: category },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    const { id } = await params;
    serverLogger.error(`GET /api/categories/${id} error`, { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/categories/[id]
 *
 * Update category
 *
 * Body: Partial<CategoryDocument>
 *
 * Features:
 * - Admin only authentication
 * - Validate update data with Zod schema
 * - Update category fields
 * - Return updated category
 *
 * Note: To move category to new parent, use POST /api/categories/[id]/move
 *
 * TODO - Phase 4:
 * - Handle featured status validation (min 8 items)
 * - Send notification on status change
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Check category exists
    const category = await categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Parse and validate update data
    const body = await request.json();
    const validation = validateRequestBody(categoryUpdateSchema, body);

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

    // Update category in repository
    const updated = await categoriesRepository.update(
      id,
      validation.data as Partial<CategoryDocument>,
    );

    if (!updated) {
      throw new NotFoundError("Category not found after update");
    }

    // Return updated category
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
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
    serverLogger.error(`PATCH /api/categories/${id} error`, { error });
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/categories/[id]
 *
 * Delete category (with cascade options)
 *
 * Features:
 * - Admin only authentication
 * - Check if category has children (prevent deletion if has children)
 * - Soft delete by setting isActive=false
 * - Remove from parent's childrenIds
 * - Return success status
 *
 * Note: Categories with children cannot be deleted directly
 *
 * TODO - Phase 4:
 * - Implement cascade delete option (delete all descendants)
 * - Implement reassign option (move products to another category)
 * - Send notification to affected users
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Check category exists
    const category = await categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Check if category has children
    if (category.childrenIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with children",
          details: {
            childrenCount: category.childrenIds.length,
            suggestion: "Delete or move child categories first",
          },
        },
        { status: 400 },
      );
    }

    // Check if category has products
    if (category.metrics && category.metrics.productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with products",
          details: {
            productCount: category.metrics.productCount,
            suggestion: "Move products to another category first",
          },
        },
        { status: 400 },
      );
    }

    // Soft delete category (set isActive to false)
    await categoriesRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
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
    serverLogger.error(`DELETE /api/categories/${id} error`, { error });
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
