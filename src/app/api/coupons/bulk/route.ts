import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";

/**
 * POST /api/coupons/bulk
 * Bulk operations on coupons
 * - Admin: Can perform all operations on any coupon
 * - Seller: Can only perform operations on coupons from their shop
 *
 * Supported actions:
 * - activate: Activate coupons
 * - deactivate: Deactivate coupons
 * - delete: Delete coupons
 * - update: Update coupon fields
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    const role = user.role;
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Only sellers and admins can perform bulk operations",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { action, couponIds, data } = body;

    if (!action || !Array.isArray(couponIds) || couponIds.length === 0) {
      throw new ValidationError("Action and couponIds array are required");
    }

    const validActions = ["activate", "deactivate", "delete", "update"];
    if (!validActions.includes(action)) {
      throw new ValidationError(
        `Invalid action. Must be one of: ${validActions.join(", ")}`,
      );
    }

    const results = [];
    const now = new Date().toISOString();

    for (const couponId of couponIds) {
      try {
        const couponRef = Collections.coupons().doc(couponId);
        const couponDoc = await couponRef.get();

        if (!couponDoc.exists) {
          results.push({
            id: couponId,
            success: false,
            error: "Coupon not found",
          });
          continue;
        }

        const couponData: any = couponDoc.data();

        // Sellers can only edit coupons from their shop
        if (role === "seller") {
          const ownsShop = await userOwnsShop(couponData.shop_id, user.uid);
          if (!ownsShop) {
            results.push({
              id: couponId,
              success: false,
              error: "Not authorized to edit this coupon",
            });
            continue;
          }
        }

        // Perform action
        switch (action) {
          case "activate":
            await couponRef.update({
              is_active: true,
              updated_at: now,
            });
            break;

          case "deactivate":
            await couponRef.update({
              is_active: false,
              updated_at: now,
            });
            break;

          case "delete":
            await couponRef.delete();
            break;

          case "update":
            if (!data) {
              results.push({
                id: couponId,
                success: false,
                error: "Update data is required for update action",
              });
              continue;
            }
            const updates: any = { ...data, updated_at: now };
            // Prevent updating protected fields
            delete updates.id;
            delete updates.shop_id;
            delete updates.code;
            delete updates.created_at;
            await couponRef.update(updates);
            break;

          default:
            results.push({
              id: couponId,
              success: false,
              error: `Unknown action: ${action}`,
            });
            continue;
        }

        results.push({
          id: couponId,
          success: true,
        });
      } catch (err: any) {
        results.push({
          id: couponId,
          success: false,
          error: err.message || "Failed to process coupon",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: couponIds.length,
        succeeded: successCount,
        failed: failureCount,
      },
    });
  } catch (error: any) {
    console.error("Bulk coupon operation error:", error);
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 },
    );
  }
}
