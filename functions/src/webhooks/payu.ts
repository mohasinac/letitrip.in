import { createHmac } from "crypto";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

const db = admin.firestore();

/**
 * PayU Webhook Handler
 *
 * Events handled:
 * - success: Payment successful
 * - failure: Payment failed
 * - pending: Payment pending
 * - cancel: Payment cancelled
 *
 * Verification: SHA-512 hash verification
 * Docs: https://devguide.payu.in/low-code-web-sdk/webhooks/
 */
export const payuWebhook = functions.https.onRequest(async (req, res) => {
  console.log("[PayU Webhook] Received request");

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const webhookData = req.body;

    // Extract required fields
    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      mihpayid,
      hash,
      udf1, // orderId stored in udf1
    } = webhookData;

    if (!hash || !txnid || !udf1) {
      console.error("[PayU Webhook] Missing required fields");
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Verify hash
    const webhookSalt = process.env.PAYU_WEBHOOK_SALT;
    if (!webhookSalt) {
      console.error("[PayU Webhook] Salt not configured");
      res.status(500).json({ error: "Configuration error" });
      return;
    }

    // Hash format: sha512(key|status||||||udf1|email|firstname|productinfo|amount|txnid|salt)
    const hashString = `${webhookSalt}|${status}||||||${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}`;
    const expectedHash = createHmac("sha512", webhookSalt)
      .update(hashString)
      .digest("hex");

    if (hash !== expectedHash) {
      console.error("[PayU Webhook] Invalid hash");
      res.status(403).json({ error: "Invalid hash" });
      return;
    }

    const orderId = udf1;
    console.log(`[PayU Webhook] Processing ${status} for order ${orderId}`);

    // Get order document
    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.error(`[PayU Webhook] Order ${orderId} not found`);
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const batch = db.batch();

    // Update order based on status
    switch (status.toLowerCase()) {
      case "success":
        batch.update(orderRef, {
          paymentStatus: "paid",
          status: "confirmed",
          "payment.transactionId": mihpayid,
          "payment.gateway": "payu",
          "payment.method": "card",
          "payment.paidAt": admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create notification
        const successNotificationRef = db.collection("notifications").doc();
        batch.set(successNotificationRef, {
          userId: orderDoc.data()?.buyerId,
          type: "payment",
          title: "Payment Successful",
          message: `Your payment of ₹${amount} for order #${
            orderDoc.data()?.orderNumber
          } has been confirmed.`,
          data: { orderId, transactionId: mihpayid },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case "failure":
        batch.update(orderRef, {
          paymentStatus: "failed",
          status: "cancelled",
          "payment.transactionId": mihpayid,
          "payment.gateway": "payu",
          "payment.failureReason":
            webhookData.error_Message || "Payment failed",
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
          data: { orderId, transactionId: mihpayid },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case "pending":
        batch.update(orderRef, {
          paymentStatus: "pending",
          "payment.transactionId": mihpayid,
          "payment.gateway": "payu",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      case "cancel":
        batch.update(orderRef, {
          paymentStatus: "cancelled",
          status: "cancelled",
          "payment.transactionId": mihpayid,
          "payment.gateway": "payu",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      default:
        console.warn(`[PayU Webhook] Unknown status: ${status}`);
    }

    await batch.commit();

    console.log(
      `[PayU Webhook] Successfully processed ${status} for order ${orderId}`
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[PayU Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
