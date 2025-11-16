import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";

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
        { status: 403 }
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

        switch (action) {
          case "publish":
            await productRef.update({
              status: "published",
              updated_at: now,
            });
            break;

          case "unpublish":
            await productRef.update({
              status: "draft",
              updated_at: now,
            });
            break;

          case "archive":
            await productRef.update({
              status: "archived",
              updated_at: now,
            });
            break;

          case "feature":
            await productRef.update({
              is_featured: true,
              updated_at: now,
            });
            break;

          case "unfeature":
            await productRef.update({
              is_featured: false,
              updated_at: now,
            });
            break;

          case "update-stock":
            if (!updates?.stockCount && updates?.stockCount !== 0) {
              results.failed.push({
                id: productId,
                error: "Stock count required",
              });
              continue;
            }
            await productRef.update({
              stock_count: parseInt(String(updates.stockCount)),
              updated_at: now,
            });
            break;

          case "update":
            if (!updates || typeof updates !== "object") {
              results.failed.push({
                id: productId,
                error: "Updates object required",
              });
              continue;
            }
            await productRef.update({
              ...updates,
              updated_at: now,
            });
            break;

          case "delete":
            await productRef.delete();
            break;

          default:
            results.failed.push({ id: productId, error: "Unknown action" });
            continue;
        }

        results.success.push(productId);
      } catch (error: any) {
        results.failed.push({ id: productId, error: error.message });
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
        { status: 400 }
      );
    }
    console.error("Error in bulk product operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
