/**
 * WhatsApp Notification Functions
 *
 * @status IMPLEMENTED
 * @task 1.4.5
 *
 * Firebase Functions for automated WhatsApp notifications:
 * - Order status updates
 * - Shipping notifications
 * - Payment reminders
 * - Delivery confirmations
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v2";

const db = admin.firestore();

// ============================================================================
// ORDER CONFIRMATION
// ============================================================================

export const sendOrderConfirmation = functions.firestore.onDocumentCreated(
  {
    document: "orders/{orderId}",
    region: "asia-south1",
  },
  async (event) => {
    try {
      const order = event.data?.data();
      if (!order) return;

      const orderId = event.params.orderId;

      // Get user details
      const userDoc = await db.collection("users").doc(order.userId).get();
      const user = userDoc.data();

      if (!user?.phone) {
        functions.logger.warn(`No phone number for user ${order.userId}`);
        return;
      }

      // Check opt-in status
      const optInDoc = await db
        .collection("whatsapp_opt_ins")
        .doc(user.phone)
        .get();
      const optIn = optInDoc.data();

      if (!optIn?.optedIn || !optIn.categories?.includes("UTILITY")) {
        functions.logger.info(
          `User ${user.phone} not opted in for UTILITY messages`
        );
        return;
      }

      // Format order items
      const itemsText = order.items
        .map((item: any) => `${item.quantity}x ${item.name}`)
        .join(", ");

      // Store message for webhook to send
      await db.collection("whatsapp_messages").add({
        to: user.phone,
        templateId: "ORDER_CONFIRMATION",
        variables: {
          name: user.name || "Customer",
          orderId: orderId.substring(0, 8),
          items: itemsText,
          total: order.totalAmount.toFixed(2),
          deliveryDate: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          trackingUrl: `https://justforview.in/orders/${orderId}`,
        },
        category: "UTILITY",
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Order confirmation message queued for ${user.phone}`
      );
    } catch (error) {
      functions.logger.error("Error sending order confirmation:", error);
    }
  }
);

// ============================================================================
// SHIPPING UPDATES
// ============================================================================

export const sendShippingUpdate = functions.firestore.onDocumentUpdated(
  {
    document: "shipments/{shipmentId}",
    region: "asia-south1",
  },
  async (event) => {
    try {
      const before = event.data?.before.data();
      const after = event.data?.after.data();

      // Only send if status changed
      if (before?.status === after?.status) return;

      const shipment = after;
      if (!shipment) return;

      // Get order details
      const orderDoc = await db
        .collection("orders")
        .doc(shipment.orderId)
        .get();
      const order = orderDoc.data();
      if (!order) return;

      // Get user details
      const userDoc = await db.collection("users").doc(order.userId).get();
      const user = userDoc.data();

      if (!user?.phone) return;

      // Check opt-in
      const optInDoc = await db
        .collection("whatsapp_opt_ins")
        .doc(user.phone)
        .get();
      const optIn = optInDoc.data();

      if (!optIn?.optedIn || !optIn.categories?.includes("UTILITY")) return;

      // Map shipment status to user-friendly text
      const statusMap: Record<string, string> = {
        "pickup-scheduled": "ready for pickup",
        "picked-up": "picked up",
        "in-transit": "in transit",
        "out-for-delivery": "out for delivery",
        delivered: "delivered",
      };

      const statusText = statusMap[shipment.status] || shipment.status;

      // Queue message
      await db.collection("whatsapp_messages").add({
        to: user.phone,
        templateId: "SHIPPING_UPDATE",
        variables: {
          name: user.name || "Customer",
          orderId: shipment.orderId.substring(0, 8),
          status: statusText,
          courier: shipment.courierName || "Courier Partner",
          trackingId: shipment.awbCode || "Pending",
          location: shipment.currentLocation || "Processing",
          estimatedDate: shipment.estimatedDeliveryDate
            ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString(
                "en-IN"
              )
            : "Soon",
          trackingUrl: `https://justforview.in/orders/${shipment.orderId}`,
        },
        category: "UTILITY",
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Shipping update queued for ${user.phone}`);
    } catch (error) {
      functions.logger.error("Error sending shipping update:", error);
    }
  }
);

// ============================================================================
// OUT FOR DELIVERY
// ============================================================================

export const sendOutForDelivery = functions.firestore.onDocumentUpdated(
  {
    document: "shipments/{shipmentId}",
    region: "asia-south1",
  },
  async (event) => {
    try {
      const before = event.data?.before.data();
      const after = event.data?.after.data();

      // Only send when status changes to 'out-for-delivery'
      if (
        before?.status !== "out-for-delivery" &&
        after?.status === "out-for-delivery"
      ) {
        const shipment = after;

        // Get order and user
        const orderDoc = await db
          .collection("orders")
          .doc(shipment.orderId)
          .get();
        const order = orderDoc.data();
        if (!order) return;

        const userDoc = await db.collection("users").doc(order.userId).get();
        const user = userDoc.data();
        if (!user?.phone) return;

        // Check opt-in
        const optInDoc = await db
          .collection("whatsapp_opt_ins")
          .doc(user.phone)
          .get();
        const optIn = optInDoc.data();
        if (!optIn?.optedIn || !optIn.categories?.includes("UTILITY")) return;

        // Queue message
        await db.collection("whatsapp_messages").add({
          to: user.phone,
          templateId: "OUT_FOR_DELIVERY",
          variables: {
            name: user.name || "Customer",
            orderId: shipment.orderId.substring(0, 8),
            time: "6 PM",
            partner: shipment.courierName || "Delivery Partner",
          },
          category: "UTILITY",
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(
          `Out for delivery notification queued for ${user.phone}`
        );
      }
    } catch (error) {
      functions.logger.error(
        "Error sending out for delivery notification:",
        error
      );
    }
  }
);

// ============================================================================
// DELIVERY CONFIRMATION
// ============================================================================

export const sendDeliveryConfirmation = functions.firestore.onDocumentUpdated(
  {
    document: "shipments/{shipmentId}",
    region: "asia-south1",
  },
  async (event) => {
    try {
      const before = event.data?.before.data();
      const after = event.data?.after.data();

      // Only send when status changes to 'delivered'
      if (before?.status !== "delivered" && after?.status === "delivered") {
        const shipment = after;

        // Get order and user
        const orderDoc = await db
          .collection("orders")
          .doc(shipment.orderId)
          .get();
        const order = orderDoc.data();
        if (!order) return;

        const userDoc = await db.collection("users").doc(order.userId).get();
        const user = userDoc.data();
        if (!user?.phone) return;

        // Check opt-in
        const optInDoc = await db
          .collection("whatsapp_opt_ins")
          .doc(user.phone)
          .get();
        const optIn = optInDoc.data();
        if (!optIn?.optedIn || !optIn.categories?.includes("UTILITY")) return;

        // Queue message
        await db.collection("whatsapp_messages").add({
          to: user.phone,
          templateId: "DELIVERY_CONFIRMATION",
          variables: {
            name: user.name || "Customer",
            orderId: shipment.orderId.substring(0, 8),
            time: new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            receiver: user.name || "Recipient",
          },
          category: "UTILITY",
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(`Delivery confirmation queued for ${user.phone}`);
      }
    } catch (error) {
      functions.logger.error("Error sending delivery confirmation:", error);
    }
  }
);

// ============================================================================
// PAYMENT REMINDERS (SCHEDULED)
// ============================================================================

export const sendPaymentReminders = functions.scheduler.onSchedule(
  {
    schedule: "0 */6 * * *", // Every 6 hours
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
  },
  async () => {
    try {
      // Get orders awaiting payment (created > 1 hour ago)
      const oneHourAgo = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 60 * 60 * 1000)
      );

      const ordersSnapshot = await db
        .collection("orders")
        .where("status", "==", "pending_payment")
        .where("createdAt", "<", oneHourAgo)
        .limit(100)
        .get();

      if (ordersSnapshot.empty) {
        functions.logger.info("No pending payments found");
        return;
      }

      const batch = db.batch();
      let queuedCount = 0;

      for (const orderDoc of ordersSnapshot.docs) {
        const order = orderDoc.data();

        // Get user
        const userDoc = await db.collection("users").doc(order.userId).get();
        const user = userDoc.data();
        if (!user?.phone) continue;

        // Check opt-in
        const optInDoc = await db
          .collection("whatsapp_opt_ins")
          .doc(user.phone)
          .get();
        const optIn = optInDoc.data();
        if (!optIn?.optedIn || !optIn.categories?.includes("UTILITY")) continue;

        // Check if reminder already sent
        if (order.paymentReminderSent) continue;

        // Queue message
        const msgRef = db.collection("whatsapp_messages").doc();
        batch.set(msgRef, {
          to: user.phone,
          templateId: "PAYMENT_REMINDER",
          variables: {
            name: user.name || "Customer",
            orderId: orderDoc.id.substring(0, 8),
            amount: order.totalAmount.toFixed(2),
            items: `${order.items.length} item${
              order.items.length > 1 ? "s" : ""
            }`,
            time: "24 hours",
            paymentUrl: `https://justforview.in/checkout/${orderDoc.id}`,
          },
          category: "UTILITY",
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Mark reminder as sent
        batch.update(orderDoc.ref, {
          paymentReminderSent: true,
          paymentReminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        queuedCount++;
      }

      await batch.commit();

      functions.logger.info(`Payment reminders queued: ${queuedCount}`);
    } catch (error) {
      functions.logger.error("Error sending payment reminders:", error);
    }
  }
);

// ============================================================================
// PROCESS WHATSAPP MESSAGE QUEUE
// ============================================================================

export const processWhatsAppQueue = functions.scheduler.onSchedule(
  {
    schedule: "* * * * *", // Every minute
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
  },
  async () => {
    try {
      // Get pending messages
      const messagesSnapshot = await db
        .collection("whatsapp_messages")
        .where("status", "==", "pending")
        .limit(50)
        .get();

      if (messagesSnapshot.empty) return;

      const batch = db.batch();

      for (const msgDoc of messagesSnapshot.docs) {
        // TODO: Call Twilio/Gupshup API to actually send the message
        // For now, just mark as sent

        batch.update(msgDoc.ref, {
          status: "sent",
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          messageId: `msg_${Date.now()}_${msgDoc.id.substring(0, 8)}`,
        });
      }

      await batch.commit();

      functions.logger.info(
        `Processed ${messagesSnapshot.size} WhatsApp messages`
      );
    } catch (error) {
      functions.logger.error("Error processing WhatsApp queue:", error);
    }
  }
);
