import * as admin from "firebase-admin";
import type { Change, EventContext } from "firebase-functions/v1";
import * as functions from "firebase-functions/v1";
import type { DocumentSnapshot } from "firebase-functions/v1/firestore";

const db = admin.firestore();

/**
 * Firestore trigger: Automatically handle order status updates
 * - Updates inventory when order confirmed
 * - Creates notifications for buyer and seller
 * - Updates seller metrics
 * - Logs order status changes to audit collection
 */
export const orderStatusUpdate = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    const { orderId } = context.params;
    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) {
      console.error(`Missing data for order ${orderId}`);
      return null;
    }

    // Skip if status hasn't changed
    if (before.status === after.status) {
      return null;
    }

    const batch = db.batch();

    try {
      // 1. Log status change to audit collection
      const auditRef = db.collection("orderAudit").doc();
      batch.set(auditRef, {
        orderId,
        previousStatus: before.status,
        newStatus: after.status,
        changedAt: admin.firestore.FieldValue.serverTimestamp(),
        changedBy: after.updatedBy || "system",
        metadata: {
          buyerId: after.buyerId,
          sellerId: after.sellerId,
          amount: after.totalAmount,
        },
      });

      // 2. Update inventory when order confirmed
      if (after.status === "confirmed" && before.status !== "confirmed") {
        for (const item of after.items || []) {
          const productRef = db.collection("products").doc(item.productId);
          batch.update(productRef, {
            stock: admin.firestore.FieldValue.increment(-item.quantity),
            soldCount: admin.firestore.FieldValue.increment(item.quantity),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // 3. Restore inventory if order cancelled
      if (after.status === "cancelled" && before.status === "confirmed") {
        for (const item of after.items || []) {
          const productRef = db.collection("products").doc(item.productId);
          batch.update(productRef, {
            stock: admin.firestore.FieldValue.increment(item.quantity),
            soldCount: admin.firestore.FieldValue.increment(-item.quantity),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // 4. Update seller metrics
      const sellerRef = db.collection("users").doc(after.sellerId);
      const shopRef = db.collection("shops").doc(after.shopId);

      if (after.status === "delivered") {
        batch.update(sellerRef, {
          "metrics.totalSales": admin.firestore.FieldValue.increment(1),
          "metrics.totalRevenue": admin.firestore.FieldValue.increment(
            after.totalAmount
          ),
          "metrics.lastSaleAt": admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        batch.update(shopRef, {
          "metrics.totalOrders": admin.firestore.FieldValue.increment(1),
          "metrics.totalRevenue": admin.firestore.FieldValue.increment(
            after.totalAmount
          ),
          "metrics.lastOrderAt": admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 5. Create notification for buyer
      const buyerNotificationRef = db.collection("notifications").doc();
      batch.set(buyerNotificationRef, {
        userId: after.buyerId,
        type: "order",
        title: getNotificationTitle(after.status, "buyer"),
        message: getNotificationMessage(after.status, "buyer", {
          orderId: after.orderNumber,
          amount: after.totalAmount,
        }),
        data: {
          orderId,
          orderNumber: after.orderNumber,
          status: after.status,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 6. Create notification for seller
      const sellerNotificationRef = db.collection("notifications").doc();
      batch.set(sellerNotificationRef, {
        userId: after.sellerId,
        type: "order",
        title: getNotificationTitle(after.status, "seller"),
        message: getNotificationMessage(after.status, "seller", {
          orderId: after.orderNumber,
          amount: after.totalAmount,
        }),
        data: {
          orderId,
          orderNumber: after.orderNumber,
          status: after.status,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 7. Commit all changes atomically
      await batch.commit();

      console.log(
        `Order ${orderId} status updated: ${before.status} → ${after.status}`
      );
      return null;
    } catch (error) {
      console.error("Error in orderStatusUpdate trigger:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to process order status update",
        error
      );
    }
  });

/**
 * Get notification title based on order status and recipient role
 */
function getNotificationTitle(
  status: string,
  role: "buyer" | "seller"
): string {
  const titles: Record<string, Record<string, string>> = {
    confirmed: {
      buyer: "Order Confirmed",
      seller: "New Order Received",
    },
    processing: {
      buyer: "Order Processing",
      seller: "Order Ready to Ship",
    },
    shipped: {
      buyer: "Order Shipped",
      seller: "Order Shipped Successfully",
    },
    delivered: {
      buyer: "Order Delivered",
      seller: "Order Delivered Successfully",
    },
    cancelled: {
      buyer: "Order Cancelled",
      seller: "Order Cancelled",
    },
    refunded: {
      buyer: "Order Refunded",
      seller: "Order Refunded",
    },
  };

  return titles[status]?.[role] || "Order Update";
}

/**
 * Get notification message based on order status and recipient role
 */
function getNotificationMessage(
  status: string,
  role: "buyer" | "seller",
  data: { orderId: string; amount: number }
): string {
  const messages: Record<string, Record<string, string>> = {
    confirmed: {
      buyer: `Your order #${data.orderId} has been confirmed. The seller will prepare your items for shipping.`,
      seller: `New order #${
        data.orderId
      } received for ₹${data.amount.toLocaleString(
        "en-IN"
      )}. Please prepare items for shipping.`,
    },
    processing: {
      buyer: `Your order #${data.orderId} is being processed. It will be shipped soon.`,
      seller: `Order #${data.orderId} is ready to ship. Please generate AWB and schedule pickup.`,
    },
    shipped: {
      buyer: `Your order #${data.orderId} has been shipped and is on the way!`,
      seller: `Order #${data.orderId} has been shipped successfully.`,
    },
    delivered: {
      buyer: `Your order #${data.orderId} has been delivered. Please rate your experience.`,
      seller: `Order #${data.orderId} delivered successfully. Payment will be settled soon.`,
    },
    cancelled: {
      buyer: `Your order #${data.orderId} has been cancelled. Refund will be processed if payment was made.`,
      seller: `Order #${data.orderId} has been cancelled by the buyer.`,
    },
    refunded: {
      buyer: `Refund for order #${
        data.orderId
      } of ₹${data.amount.toLocaleString("en-IN")} has been processed.`,
      seller: `Refund processed for order #${data.orderId}.`,
    },
  };

  return (
    messages[status]?.[role] ||
    `Order #${data.orderId} status updated to ${status}.`
  );
}
