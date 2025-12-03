import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";
import { updateCategoryProductCounts } from "@/lib/category-hierarchy";

// Actions that affect category counts
const STATUS_CHANGING_ACTIONS = new Set([
  "publish",
  "unpublish",
  "archive",
  "delete",
]);

// Build update object for each action
function buildProductUpdate(
  action: string,
  now: string,
  updates?: any,
): { update: Record<string, any> | null; error?: string } {
  switch (action) {
    case "publish":
      return { update: { status: "published", updated_at: now } };
    case "unpublish":
      return { update: { status: "draft", updated_at: now } };
    case "archive":
      return { update: { status: "archived", updated_at: now } };
    case "feature":
      return { update: { is_featured: true, updated_at: now } };
    case "unfeature":
      return { update: { is_featured: false, updated_at: now } };
    case "update-stock":
      if (!updates?.stockCount && updates?.stockCount !== 0) {
        return { update: null, error: "Stock count required" };
      }
      return {
        update: {
          stock_count: parseInt(String(updates.stockCount)),
          updated_at: now,
        },
      };
    case "update":
      if (!updates || typeof updates !== "object") {
        return { update: null, error: "Updates object required" };
      }
      return { update: { ...updates, updated_at: now } };
    default:
      return { update: null, error: "Unknown action" };
  }
}

/**
 * POST /api/products/bulk
 * Bulk operations on products (seller/admin)
 * Actions: publish, unpublish, archive, feature, unfeature, update-stock, delete, update
 * Sellers can only perform operations on their own products
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user!;

    // Only sellers and admins can perform bulk operations
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
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
        ids: "At least one product ID is required",
      });
    }

    const validActions = [
      "publish",
      "unpublish",
      "archive",
      "feature",
      "unfeature",
      "update-stock",
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
    const categoriesNeedingUpdate = new Set<string>();

    for (const productId of ids) {
      try {
        const productRef = Collections.products().doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
          results.failed.push({ id: productId, error: "Product not found" });
          continue;
        }

        const productData: any = productDoc.data();

        // Verify ownership (sellers can only edit their own products)
        if (user.role === "seller") {
          const ownsShop = await userOwnsShop(productData?.shop_id, user.uid);
          if (!ownsShop) {
            results.failed.push({
              id: productId,
              error: "Not authorized to edit this product",
            });
            continue;
          }
        }

        const categoryId = productData.category_id;

        // Handle delete action
        if (action === "delete") {
          await productRef.delete();
          if (categoryId) categoriesNeedingUpdate.add(categoryId);
          results.success.push(productId);
          continue;
        }

        // Build and apply update
        const { update, error } = buildProductUpdate(action, now, updates);
        if (!update) {
          results.failed.push({
            id: productId,
            error: error || "Unknown action",
          });
          continue;
        }

        await productRef.update(update);

        // Track category updates
        if (STATUS_CHANGING_ACTIONS.has(action) && categoryId) {
          categoriesNeedingUpdate.add(categoryId);
        }
        if (action === "update") {
          if (
            updates.status &&
            updates.status !== productData.status &&
            categoryId
          ) {
            categoriesNeedingUpdate.add(categoryId);
          }
          if (updates.category_id && updates.category_id !== categoryId) {
            if (categoryId) categoriesNeedingUpdate.add(categoryId);
            categoriesNeedingUpdate.add(updates.category_id);
          }
        }

        results.success.push(productId);
      } catch (error: any) {
        results.failed.push({ id: productId, error: error.message });
      }
    }

    // Update all affected category counts
    if (categoriesNeedingUpdate.size > 0) {
      console.log(
        `Updating counts for ${categoriesNeedingUpdate.size} categories`,
      );
      for (const categoryId of categoriesNeedingUpdate) {
        try {
          await updateCategoryProductCounts(categoryId);
        } catch (error) {
          console.error(
            `Failed to update counts for category ${categoryId}:`,
            error,
          );
          // Don't fail the bulk operation if count update fails
        }
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
    console.error("Error in bulk product operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 },
    );
  }
}
