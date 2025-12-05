import { createHmac } from "crypto";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

const db = admin.firestore();

/**
 * Cashfree Webhook Handler
 *
 * Events handled:
 * - ORDER_PAID: Payment successful
 * - PAYMENT_FAILED: Payment failed
 * - PAYMENT_SUCCESS: Payment successful (alternative)
 * - PAYMENT_USER_DROPPED: User dropped payment
 *
 * Verification: Signature verification using secret key
 * Docs: https://docs.cashfree.com/docs/webhooks
 */
export const cashfreeWebhook = functions.https.onRequest(async (req, res) => {
  console.log("[Cashfree Webhook] Received request");

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Verify signature
    const signature = req.headers["x-webhook-signature"];
    if (!signature || typeof signature !== "string") {
      console.error("[Cashfree Webhook] Missing signature");
      res.status(400).json({ error: "Missing signature" });
      return;
    }

    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Cashfree Webhook] Webhook secret not configured");
      res.status(500).json({ error: "Configuration error" });
      return;
    }

    // Verify signature
    const timestamp = req.headers["x-webhook-timestamp"] as string;
    const payload = JSON.stringify(req.body);
    const signatureData = `${timestamp}${payload}`;

    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(signatureData)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.error("[Cashfree Webhook] Invalid signature");
      res.status(403).json({ error: "Invalid signature" });
      return;
    }

    // Process webhook event
    const event = req.body;
    const eventType = event.type;

    console.log(`[Cashfree Webhook] Processing event: ${eventType}`);

    const { data } = event;
    if (!data || !data.order) {
      console.error("[Cashfree Webhook] Invalid payload structure");
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    const orderInfo = data.order;
    const payment = data.payment;
    const orderId = orderInfo.order_tags?.orderId || orderInfo.order_id;
    const transactionId = payment?.cf_payment_id;
    const amount = orderInfo.order_amount;

    if (!orderId) {
      console.error("[Cashfree Webhook] Missing orderId in payload");
      res.status(400).json({ error: "Missing orderId" });
      return;
    }

    console.log(
      `[Cashfree Webhook] Processing ${eventType} for order ${orderId}`
    );

    // Get order document
    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.error(`[Cashfree Webhook] Order ${orderId} not found`);
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const batch = db.batch();

    // Update order based on event type
    switch (eventType) {
      case "ORDER_PAID":
      case "PAYMENT_SUCCESS":
        batch.update(orderRef, {
          paymentStatus: "paid",
          status: "confirmed",
          "payment.transactionId": transactionId,
          "payment.gateway": "cashfree",
          "payment.method": payment?.payment_group || "card",
          "payment.paidAt": admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create notification
        const successNotificationRef = db.collection("notifications").doc();
        batch.set(successNotificationRef, {
          userId: orderDoc.data()?.buyerId,
          type: "payment",
          title: "Payment Successful",
          message: `Your payment of ₹${amount.toLocaleString(
            "en-IN"
          )} for order #${orderDoc.data()?.orderNumber} has been confirmed.`,
          data: { orderId, transactionId },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case "PAYMENT_FAILED":
        batch.update(orderRef, {
          paymentStatus: "failed",
          status: "cancelled",
          "payment.transactionId": transactionId,
          "payment.gateway": "cashfree",
          "payment.failureReason": payment?.payment_message || "Payment failed",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create notification
        const failureNotificationRef = db.collection("notifications").doc();
        batch.set(failureNotificationRef, {
          userId: orderDoc.data()?.buyerId,
          type: "payment",
          title: "Payment Failed",
          message: `Payment for order #${
            orderDoc.data()?.orderNumber
          } failed. Please try again.`,
          data: { orderId, transactionId },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case "PAYMENT_USER_DROPPED":
        batch.update(orderRef, {
          paymentStatus: "cancelled",
          status: "cancelled",
          "payment.transactionId": transactionId,
          "payment.gateway": "cashfree",
          "payment.failureReason": "User cancelled payment",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      default:
        console.warn(`[Cashfree Webhook] Unknown event type: ${eventType}`);
    }

    await batch.commit();

    console.log(
      `[Cashfree Webhook] Successfully processed ${eventType} for order ${orderId}`
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Cashfree Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
