/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/bulk/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { ValidationError } from "@/lib/api-errors";

// Build update object for each action
/**
 * Function: Build Category Update
 */
/**
 * Performs build category update operation
 *
 * @param {string} action - The action
 * @param {string} now - The now
 * @param {any} [updates] - The updates
 *
 * @returns {string} The buildcategoryupdate result
 */

/**
 * Performs build category update operation
 *
 * @returns {string} The buildcategoryupdate result
 */

function buildCategoryUpdate(
  /** Action */
  action: string,
  /** Now */
  now: string,
  /** Updates */
  updates?: any,
): Record<string, any> | null {
  switch (action) {
    case "activate":
      return { is_active: true, updated_at: now };
    case "deactivate":
      return { is_active: false, updated_at: now };
    case "feature":
      return { is_featured: true, updated_at: now };
    case "unfeature":
      return { is_featured: false, updated_at: now };
    case "update":
      if (!updates || typeof updates !== "object") return null;
      return { ...updates, updated_at: now };
    /** Default */
    default:
      return null;
  }
}

// Delete category with parent cleanup
/**
 * Deletes category
 */
/**
 * Deletes category
 *
 * @param {string} categoryId - category identifier
 * @param {any} categoryData - The category data
 * @param {string} now - The now
 *
 * @returns {Promise<any>} Promise resolving to deletecategory result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Deletes category
 *
 * @returns {Promise<any>} Promise resolving to deletecategory result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function deleteCategory(
  /** Category Id */
  categoryId: string,
  /** Category Data */
  categoryData: any,
  /** Now */
  now: string,
): Promise<string | null> {
  const childrenIds = categoryData.children_ids || [];
  if (childrenIds.length > 0) {
    return "Category has subcategories";
  }

  const productsSnapshot = await Collections.products()
    .where("category_id", "==", categoryId)
    .limit(1)
    .get();

  if (!productsSnapshot.empty) {
    return "Category has products";
  }

  // Remove from all parent categories
  const parentIds =
    categoryData.parent_ids ||
    (categoryData.parent_id ? [categoryData.parent_id] : []);
  for (const parentId of parentIds) {
    const parentRef = Collections.categories().doc(parentId);
    const parentDoc = await parentRef.get();
    if (parentDoc.exists) {
      const parentData: any = parentDoc.data();
      /**
       * Updates existing updated children ids
       *
       * @param {string} parentData.children_ids || []).filter(
        (id - The parent data.children_ids || []).filter(
        (id
       *
       * @returns {string} The updatedchildrenids result
       */

      /**
       * Updates existing updated children ids
       *
       * @param {string} parentData.children_ids || []).filter(
        (id - The parent data.children_ids || []).filter(
        (id
       *
       * @returns {string} The updatedchildrenids result
       */

      const updatedChildrenIds = (parentData.children_ids || []).filter(
        (id: string) => id !== categoryId,
      );
      await parentRef.update({
        children_ids: updatedChildrenIds,
        child_count: updatedChildrenIds.length,
        has_children: updatedChildrenIds.length > 0,
        updated_at: now,
      });
    }
  }

  await Collections.categories().doc(categoryId).delete();
  return null; // Success
}

/**
 * POST /api/categories/bulk
 * Bulk operations on categories (admin only)
 * Actions: activate, deactivate, feature, unfeature, delete, update
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const data = await request.json();
    const { action, ids, updates } = data;

    // Validation
    if (!action) {
      throw new ValidationError("Validation failed", {
        /** Action */
        action: "Action is required",
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError("Validation failed", {
        /** Ids */
        ids: "At least one category ID is required",
      });
    }

    const validActions = [
      "activate",
      "deactivate",
      "feature",
      "unfeature",
      "delete",
      "update",
    ];
    if (!validActions.includes(action)) {
      throw new ValidationError("Validation failed", {
        /** Action */
        action: `Invalid action. Must be one of: ${validActions.join(", ")}`,
      });
    }

    const results = {
      /** Success */
      success: [] as string[],
      /** Failed */
      failed: [] as { id: string; error: string }[],
    };

    const now = new Date().toISOString();

    for (const categoryId of ids) {
      try {
        const categoryRef = Collections.categories().doc(categoryId);
        const categoryDoc = await categoryRef.get();

        if (!categoryDoc.exists) {
          results.failed.push({ id: categoryId, error: "Category not found" });
          continue;
        }

        const categoryData: any = categoryDoc.data();

        // Handle delete action separately (complex logic)
        if (action === "delete") {
          const deleteError = await deleteCategory(
            categoryId,
            categoryData,
            now,
          );
          if (deleteError) {
            results.failed.push({ id: categoryId, error: deleteError });
          } else {
            results.success.push(categoryId);
          }
          continue;
        }

        // Build and apply update
        const update = buildCategoryUpdate(action, now, updates);
        if (!update) {
          results.failed.push({
            /** Id */
            id: categoryId,
            /** Error */
            error:
              action === "update"
                ? "Updates object required"
                : "Unknown action",
          });
          continue;
        }

        await categoryRef.update(update);
        results.success.push(categoryId);
      } catch (error: any) {
        results.failed.push({ id: categoryId, error: error.message });
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: results,
      /** Message */
      message: `Bulk ${action} completed. Success: ${results.success.length}, Failed: ${results.failed.length}`,
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, errors: error.errors },
        { status: 400 },
      );
    }
    console.error("Error in bulk category operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 },
    );
  }
}
