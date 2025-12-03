import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { ValidationError } from "@/lib/api-errors";

// Status requirements for each action
const STATUS_REQUIREMENTS: Record<
  string,
  { required: string[]; message: string }
> = {
  confirm: {
    required: ["pending"],
    message: "Only pending orders can be confirmed",
  },
  process: {
    required: ["confirmed"],
    message: "Only confirmed orders can be processed",
  },
  ship: {
    required: ["processing"],
    message: "Only processing orders can be shipped",
  },
  deliver: {
    required: ["shipped"],
    message: "Only shipped orders can be marked as delivered",
  },
  cancel: {
    required: ["pending", "confirmed", "processing"],
    message: "Can only cancel pending/confirmed/processing orders",
  },
  refund: {
    required: ["delivered", "cancelled"],
    message: "Can only refund delivered or cancelled orders",
  },
  delete: {
    required: ["cancelled", "failed", "refunded"],
    message: "Can only delete cancelled, failed, or refunded orders",
  },
};

// Build update object for each action
function buildActionUpdate(
  action: string,
  now: string,
  orderData: any,
  data?: any,
): Record<string, any> | null {
  switch (action) {
    case "confirm":
      return { status: "confirmed", confirmed_at: now, updated_at: now };
    case "process":
      return { status: "processing", processing_at: now, updated_at: now };
    case "ship":
      return {
        status: "shipped",
        shipped_at: now,
        tracking_number: data?.trackingNumber || "",
        updated_at: now,
      };
    case "deliver":
      return { status: "delivered", delivered_at: now, updated_at: now };
    case "cancel":
      return {
        status: "cancelled",
        cancelled_at: now,
        cancellation_reason: data?.reason || "Cancelled by seller/admin",
        updated_at: now,
      };
    case "refund":
      return {
        status: "refunded",
        refunded_at: now,
        refund_amount: data?.refundAmount || orderData.amount,
        refund_reason: data?.reason || "Refund processed",
        updated_at: now,
      };
    case "update":
      if (!data) return null;
      const updates = { ...data, updated_at: now };
      delete updates.id;
      delete updates.user_id;
      delete updates.created_at;
      return updates;
    default:
      return null;
  }
}

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

        // Validate status requirements
        const requirement = STATUS_REQUIREMENTS[action];
        if (requirement && !requirement.required.includes(orderData.status)) {
          results.push({
            id: orderId,
            success: false,
            error: requirement.message,
          });
          continue;
        }

        // Handle delete action
        if (action === "delete") {
          await orderRef.delete();
          results.push({ id: orderId, success: true });
          continue;
        }

        // Build and apply update
        const updates = buildActionUpdate(action, now, orderData, data);
        if (!updates) {
          results.push({
            id: orderId,
            success: false,
            error:
              action === "update"
                ? "Update data is required"
                : `Unknown action: ${action}`,
          });
          continue;
        }

        await orderRef.update(updates);
        results.push({ id: orderId, success: true });
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
