import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";

/**
 * POST /api/orders/bulk
 * Bulk operations on orders
 * - Admin: Can perform all operations on any order
 * - Seller: Can only perform operations on orders from their shop
 *
 * Supported actions:
 * - confirm: Confirm pending orders
 * - process: Mark confirmed orders as processing
 * - ship: Mark processing orders as shipped
 * - deliver: Mark shipped orders as delivered
 * - cancel: Cancel pending/confirmed/processing orders
 * - refund: Process refund for delivered orders
 * - delete: Delete cancelled/failed orders
 * - update: Update order fields
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
    const { action, orderIds, data } = body;

    if (!action || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new ValidationError("Action and orderIds array are required");
    }

    const validActions = [
      "confirm",
      "process",
      "ship",
      "deliver",
      "cancel",
      "refund",
      "delete",
      "update",
    ];
    if (!validActions.includes(action)) {
      throw new ValidationError(
        `Invalid action. Must be one of: ${validActions.join(", ")}`,
      );
    }

    const results = [];
    const now = new Date().toISOString();

    for (const orderId of orderIds) {
      try {
        const orderRef = Collections.orders().doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
          results.push({
            id: orderId,
            success: false,
            error: "Order not found",
          });
          continue;
        }

        const orderData: any = orderDoc.data();

        // Sellers can only edit orders from their shop
        if (role === "seller") {
          const ownsShop = await userOwnsShop(orderData.shop_id, user.uid);
          if (!ownsShop) {
            results.push({
              id: orderId,
              success: false,
              error: "Not authorized to edit this order",
            });
            continue;
          }
        }

        // Perform action with status validation
        switch (action) {
          case "confirm":
            if (orderData.status !== "pending") {
              results.push({
                id: orderId,
                success: false,
                error: "Only pending orders can be confirmed",
              });
              continue;
            }
            await orderRef.update({
              status: "confirmed",
              confirmed_at: now,
              updated_at: now,
            });
            break;

          case "process":
            if (orderData.status !== "confirmed") {
              results.push({
                id: orderId,
                success: false,
                error: "Only confirmed orders can be processed",
              });
              continue;
            }
            await orderRef.update({
              status: "processing",
              processing_at: now,
              updated_at: now,
            });
            break;

          case "ship":
            if (orderData.status !== "processing") {
              results.push({
                id: orderId,
                success: false,
                error: "Only processing orders can be shipped",
              });
              continue;
            }
            await orderRef.update({
              status: "shipped",
              shipped_at: now,
              tracking_number: data?.trackingNumber || "",
              updated_at: now,
            });
            break;

          case "deliver":
            if (orderData.status !== "shipped") {
              results.push({
                id: orderId,
                success: false,
                error: "Only shipped orders can be marked as delivered",
              });
              continue;
            }
            await orderRef.update({
              status: "delivered",
              delivered_at: now,
              updated_at: now,
            });
            break;

          case "cancel":
            if (
              orderData.status !== "pending" &&
              orderData.status !== "confirmed" &&
              orderData.status !== "processing"
            ) {
              results.push({
                id: orderId,
                success: false,
                error: "Can only cancel pending/confirmed/processing orders",
              });
              continue;
            }
            await orderRef.update({
              status: "cancelled",
              cancelled_at: now,
              cancellation_reason: data?.reason || "Cancelled by seller/admin",
              updated_at: now,
            });
            break;

          case "refund":
            if (
              orderData.status !== "delivered" &&
              orderData.status !== "cancelled"
            ) {
              results.push({
                id: orderId,
                success: false,
                error: "Can only refund delivered or cancelled orders",
              });
              continue;
            }
            await orderRef.update({
              status: "refunded",
              refunded_at: now,
              refund_amount: data?.refundAmount || orderData.amount,
              refund_reason: data?.reason || "Refund processed",
              updated_at: now,
            });
            break;

          case "delete":
            if (
              orderData.status !== "cancelled" &&
              orderData.status !== "failed" &&
              orderData.status !== "refunded"
            ) {
              results.push({
                id: orderId,
                success: false,
                error: "Can only delete cancelled, failed, or refunded orders",
              });
              continue;
            }
            await orderRef.delete();
            break;

          case "update":
            if (!data) {
              results.push({
                id: orderId,
                success: false,
                error: "Update data is required for update action",
              });
              continue;
            }
            const updates: any = { ...data, updated_at: now };
            // Prevent updating protected fields
            delete updates.id;
            delete updates.user_id;
            delete updates.created_at;
            await orderRef.update(updates);
            break;

          default:
            results.push({
              id: orderId,
              success: false,
              error: `Unknown action: ${action}`,
            });
            continue;
        }

        results.push({
          id: orderId,
          success: true,
        });
      } catch (err: any) {
        results.push({
          id: orderId,
          success: false,
          error: err.message || "Failed to process order",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: orderIds.length,
        succeeded: successCount,
        failed: failureCount,
      },
    });
  } catch (error: any) {
    console.error("Bulk order operation error:", error);
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
