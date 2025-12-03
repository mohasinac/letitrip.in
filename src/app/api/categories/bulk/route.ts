import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { ValidationError } from "@/lib/api-errors";

// Build update object for each action
function buildCategoryUpdate(
  action: string,
  now: string,
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
    default:
      return null;
  }
}

// Delete category with parent cleanup
async function deleteCategory(
  categoryId: string,
  categoryData: any,
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
        action: "Action is required",
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError("Validation failed", {
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
        action: `Invalid action. Must be one of: ${validActions.join(", ")}`,
      });
    }

    const results = {
      success: [] as string[],
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
            id: categoryId,
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
      success: true,
      data: results,
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
