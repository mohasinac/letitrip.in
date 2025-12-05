/**
 * Email Notifications - Order Emails
 *
 * Firebase Functions for sending order-related emails
 *
 * @status IMPLEMENTED
 * @task 1.5.6
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v2";

/**
 * Send order confirmation email when order is created
 */
export const sendOrderConfirmation = functions.firestore.onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    try {
      const orderData = event.data?.data();
      if (!orderData) return;

      const db = admin.firestore();

      // Get user data
      const userDoc = await db.collection("users").doc(orderData.userId).get();
      const userData = userDoc.data();

      if (!userData?.email) return;

      // Add to email queue
      await db.collection("emailQueue").add({
        to: userData.email,
        template: "order_confirmation",
        category: "TRANSACTIONAL",
        data: {
          customerName: userData.displayName || userData.name || "Customer",
          orderId: event.params.orderId,
          orderDate:
            orderData.createdAt?.toDate?.()?.toLocaleDateString() ||
            new Date().toLocaleDateString(),
          orderTotal: orderData.total,
          orderItems: orderData.items || [],
          shippingAddress: orderData.shippingAddress || {},
        },
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Order confirmation email queued for order ${event.params.orderId}`
      );
    } catch (error) {
      functions.logger.error("Error sending order confirmation email:", error);
    }
  }
);

/**
 * Send shipping update email when order status changes to shipped
 */
export const sendOrderShipped = functions.firestore.onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    try {
      const before = event.data?.before.data();
      const after = event.data?.after.data();

      if (!before || !after) return;

      // Check if status changed to shipped
      if (before.status !== "shipped" && after.status === "shipped") {
        const db = admin.firestore();

        // Get user data
        const userDoc = await db.collection("users").doc(after.userId).get();
        const userData = userDoc.data();

        if (!userData?.email) return;

        // Add to email queue
        await db.collection("emailQueue").add({
          to: userData.email,
          template: "shipping_update",
          category: "TRANSACTIONAL",
          data: {
            customerName: userData.displayName || userData.name || "Customer",
            orderId: event.params.orderId,
            trackingNumber: after.trackingNumber || "N/A",
            courierName: after.courierName || "Our shipping partner",
            estimatedDelivery: after.estimatedDelivery || "3-5 business days",
            trackingUrl: after.trackingUrl || "",
            orderItems: after.items || [],
          },
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(
          `Shipping update email queued for order ${event.params.orderId}`
        );
      }
    } catch (error) {
      functions.logger.error("Error sending shipping update email:", error);
    }
  }
);

/**
 * Send delivery confirmation email when order status changes to delivered
 */
export const sendOrderDelivered = functions.firestore.onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    try {
      const before = event.data?.before.data();
      const after = event.data?.after.data();

      if (!before || !after) return;

      // Check if status changed to delivered
      if (before.status !== "delivered" && after.status === "delivered") {
        const db = admin.firestore();

        // Get user data
        const userDoc = await db.collection("users").doc(after.userId).get();
        const userData = userDoc.data();

        if (!userData?.email) return;

        // Add to email queue
        await db.collection("emailQueue").add({
          to: userData.email,
          template: "order_delivered",
          category: "TRANSACTIONAL",
          data: {
            customerName: userData.displayName || userData.name || "Customer",
            orderId: event.params.orderId,
            deliveredAt:
              after.deliveredAt?.toDate?.()?.toLocaleDateString() ||
              new Date().toLocaleDateString(),
            orderItems: after.items || [],
          },
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(
          `Delivery confirmation email queued for order ${event.params.orderId}`
        );
      }
    } catch (error) {
      functions.logger.error(
        "Error sending delivery confirmation email:",
        error
      );
    }
  }
);

/**
 * Send payment received email when payment is confirmed
 */
export const sendPaymentReceived = functions.firestore.onDocumentCreated(
  "payments/{paymentId}",
  async (event) => {
    try {
      const paymentData = event.data?.data();
      if (!paymentData || paymentData.status !== "completed") return;

      const db = admin.firestore();

      // Get user data
      const userDoc = await db
        .collection("users")
        .doc(paymentData.userId)
        .get();
      const userData = userDoc.data();

      if (!userData?.email) return;

      // Get order data
      let orderData;
      if (paymentData.orderId) {
        const orderDoc = await db
          .collection("orders")
          .doc(paymentData.orderId)
          .get();
        orderData = orderDoc.data();
      }

      // Add to email queue
      await db.collection("emailQueue").add({
        to: userData.email,
        template: "payment_received",
        category: "TRANSACTIONAL",
        data: {
          customerName: userData.displayName || userData.name || "Customer",
          paymentId: event.params.paymentId,
          orderId: paymentData.orderId || "N/A",
          amount: paymentData.amount,
          paymentMethod: paymentData.method || "Card",
          paidAt:
            paymentData.createdAt?.toDate?.()?.toLocaleDateString() ||
            new Date().toLocaleDateString(),
          orderItems: orderData?.items || [],
        },
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Payment received email queued for payment ${event.params.paymentId}`
      );
    } catch (error) {
      functions.logger.error("Error sending payment received email:", error);
    }
  }
);
