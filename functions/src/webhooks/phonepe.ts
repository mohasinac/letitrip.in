import { createHash } from "crypto";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

const db = admin.firestore();

/**
 * PhonePe Webhook Handler
 *
 * Events handled:
 * - PAYMENT_SUCCESS: Payment successful
 * - PAYMENT_FAILED: Payment failed
 * - PAYMENT_PENDING: Payment pending
 * - PAYMENT_DECLINED: Payment declined
 *
 * Verification: X-VERIFY checksum verification
 * Docs: https://developer.phonepe.com/v1/docs/webhooks
 */
export const phonepeWebhook = functions.https.onRequest(async (req, res) => {
  console.log("[PhonePe Webhook] Received request");

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Verify checksum
    const xVerify = req.headers["x-verify"];
    if (!xVerify || typeof xVerify !== "string") {
      console.error("[PhonePe Webhook] Missing X-VERIFY header");
      res.status(400).json({ error: "Missing X-VERIFY header" });
      return;
    }

    const webhookSalt = process.env.PHONEPE_WEBHOOK_SALT;
    const webhookSaltIndex = process.env.PHONEPE_WEBHOOK_SALT_INDEX || "1";

    if (!webhookSalt) {
      console.error("[PhonePe Webhook] Salt not configured");
      res.status(500).json({ error: "Configuration error" });
      return;
    }

    // Decode base64 payload
    const base64Response = req.body.response;
    if (!base64Response) {
      console.error("[PhonePe Webhook] Missing response payload");
      res.status(400).json({ error: "Missing response payload" });
      return;
    }

    const payloadBuffer = Buffer.from(base64Response, "base64");
    const payload = JSON.parse(payloadBuffer.toString("utf8"));

    // Verify checksum: SHA256(base64Response + "/pg/v1/status" + salt) + ### + saltIndex
    const checksumString = base64Response + "/pg/v1/status" + webhookSalt;
    const expectedChecksum = createHash("sha256")
      .update(checksumString)
      .digest("hex");
    const expectedXVerify = `${expectedChecksum}###${webhookSaltIndex}`;

    if (xVerify !== expectedXVerify) {
      console.error("[PhonePe Webhook] Invalid checksum");
      res.status(403).json({ error: "Invalid checksum" });
      return;
    }

    // Extract data
    const { message, data } = payload;

    if (!data || !data.merchantTransactionId) {
      console.error("[PhonePe Webhook] Invalid payload structure");
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    const orderId = data.merchantTransactionId;
    const transactionId = data.transactionId;
    const amount = data.amount / 100; // PhonePe sends amount in paise
    const state = data.state;

    console.log(`[PhonePe Webhook] Processing ${state} for order ${orderId}`);

    // Get order document
    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.error(`[PhonePe Webhook] Order ${orderId} not found`);
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const batch = db.batch();

    // Update order based on state
    switch (state) {
      case "COMPLETED":
        batch.update(orderRef, {
          paymentStatus: "paid",
          status: "confirmed",
          "payment.transactionId": transactionId,
          "payment.gateway": "phonepe",
          "payment.method": data.paymentInstrument?.type || "upi",
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

      case "FAILED":
        batch.update(orderRef, {
          paymentStatus: "failed",
          status: "cancelled",
          "payment.transactionId": transactionId,
          "payment.gateway": "phonepe",
          "payment.failureReason": message || "Payment failed",
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

      case "PENDING":
        batch.update(orderRef, {
          paymentStatus: "pending",
          "payment.transactionId": transactionId,
          "payment.gateway": "phonepe",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;

      default:
        console.warn(`[PhonePe Webhook] Unknown state: ${state}`);
    }

    await batch.commit();

    console.log(
      `[PhonePe Webhook] Successfully processed ${state} for order ${orderId}`
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[PhonePe Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
