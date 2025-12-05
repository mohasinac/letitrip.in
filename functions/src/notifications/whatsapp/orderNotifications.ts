/**
 * Firebase Function: WhatsApp Order Notifications
 *
 * Triggered when order status changes
 * Sends WhatsApp notifications via Twilio/Gupshup API
 * Logs notification status to Firestore
 */

import * as functions from "firebase-functions/v1";
import { getUserData, logNotification, sendWhatsAppMessage } from "./shared";

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  userId: string;
  shopId: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
  };
  shipping?: {
    awbCode?: string;
    courierName?: string;
    trackingUrl?: string;
  };
  createdAt: string;
}

/**
 * Generate order confirmation message
 */
function getOrderConfirmedMessage(order: OrderData, userName: string): string {
  const itemsList = order.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  return (
    `Hi ${userName},\n\n` +
    `Your order #${order.orderNumber} has been confirmed! 🎉\n\n` +
    `Items: ${itemsList}\n` +
    `Total: ₹${order.totalAmount.toLocaleString("en-IN")}\n\n` +
    `We'll notify you once your order is shipped.\n\n` +
    `Track your order: https://letitrip.in/orders/${order.id}`
  );
}

/**
 * Generate order shipped message
 */
function getOrderShippedMessage(order: OrderData, userName: string): string {
  return (
    `Hi ${userName},\n\n` +
    `Great news! Your order #${order.orderNumber} has been shipped! 📦\n\n` +
    `Courier: ${order.shipping?.courierName || "N/A"}\n` +
    `Tracking Number: ${order.shipping?.awbCode || "N/A"}\n\n` +
    `Track your shipment: ${
      order.shipping?.trackingUrl || `https://letitrip.in/orders/${order.id}`
    }`
  );
}

/**
 * Generate order delivered message
 */
function getOrderDeliveredMessage(order: OrderData, userName: string): string {
  return (
    `Hi ${userName},\n\n` +
    `Your order #${order.orderNumber} has been delivered! 🎊\n\n` +
    `Thank you for shopping with us. We hope you love your purchase!\n\n` +
    `Please rate your experience: https://letitrip.in/orders/${order.id}/review`
  );
}

/**
 * Generate order cancelled message
 */
function getOrderCancelledMessage(order: OrderData, userName: string): string {
  return (
    `Hi ${userName},\n\n` +
    `Your order #${order.orderNumber} has been cancelled.\n\n` +
    `If you didn't request this cancellation, please contact support.\n\n` +
    `View order details: https://letitrip.in/orders/${order.id}`
  );
}

/**
 * Firebase Firestore Trigger: Send WhatsApp notification on order status change
 */
export const sendOrderNotification = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const orderId = context.params.orderId;
    const beforeData = change.before.data();
    const afterData = change.after.data() as OrderData;

    // Check if status changed
    if (beforeData.status === afterData.status) {
      return;
    }

    console.log(
      `Order ${orderId} status changed: ${beforeData.status} -> ${afterData.status}`
    );

    // Get user data
    const userData = await getUserData(afterData.userId);
    if (!userData || !userData.phone) {
      console.log(`No phone number for user ${afterData.userId}`);
      return;
    }

    // Determine message based on status
    let message: string | null = null;
    let notificationType: string;

    switch (afterData.status) {
      case "confirmed":
        message = getOrderConfirmedMessage(afterData, userData.name);
        notificationType = "order_confirmed";
        break;
      case "shipped":
        message = getOrderShippedMessage(afterData, userData.name);
        notificationType = "order_shipped";
        break;
      case "delivered":
        message = getOrderDeliveredMessage(afterData, userData.name);
        notificationType = "order_delivered";
        break;
      case "cancelled":
        message = getOrderCancelledMessage(afterData, userData.name);
        notificationType = "order_cancelled";
        break;
      default:
        console.log(`No WhatsApp notification for status: ${afterData.status}`);
        return;
    }

    if (!message) {
      return;
    }

    // Send WhatsApp message
    const result = await sendWhatsAppMessage(userData.phone, message);

    // Log notification
    await logNotification({
      userId: afterData.userId,
      orderId,
      type: notificationType,
      status: result.success ? "sent" : "failed",
      messageId: result.messageId,
      error: result.error,
    });

    if (result.success) {
      console.log(
        `WhatsApp notification sent for order ${orderId}: ${result.messageId}`
      );
    } else {
      console.error(
        `Failed to send WhatsApp notification for order ${orderId}: ${result.error}`
      );
    }
  });
