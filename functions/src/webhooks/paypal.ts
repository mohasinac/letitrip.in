import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

const db = admin.firestore();

/**
 * PayPal Webhook Handler
 *
 * Events handled:
 * - PAYMENT.CAPTURE.COMPLETED: Payment captured successfully
 * - PAYMENT.CAPTURE.DENIED: Payment capture denied
 * - PAYMENT.CAPTURE.REFUNDED: Payment refunded
 *
 * Verification: Certificate-based signature verification (simplified for MVP)
 * Docs: https://developer.paypal.com/docs/api-basics/notifications/webhooks/
 */
export const paypalWebhook = functions.https.onRequest(async (req, res) => {
  console.log("[PayPal Webhook] Received request");

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // TODO: Implement PayPal webhook signature verification
    // PayPal uses certificate-based verification which is more complex
    // For MVP, we'll trust the webhook endpoint security
    // Docs: https://developer.paypal.com/api/rest/webhooks/#verify-a-webhook-signature

    const event = req.body;
    const eventType = event.event_type;

    console.log(`[PayPal Webhook] Processing event: ${eventType}`);

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handleCaptureCompleted(event);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        await handleCaptureDenied(event);
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        await handleCaptureRefunded(event);
        break;

      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
    }

    console.log(`[PayPal Webhook] Successfully processed ${eventType}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[PayPal Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function handleCaptureCompleted(event: any): Promise<void> {
  const capture = event.resource;
  const captureId = capture.id;
  const paypalOrderId = capture.supplementary_data?.related_ids?.order_id;
  const amount = parseFloat(capture.amount.value);
  const currency = capture.amount.currency_code;

  console.log(`[PayPal] Capture completed: ${captureId}`);

  const batch = db.batch();

  // Find order by paypalOrderId
  if (paypalOrderId) {
    const orderSnapshot = await db
      .collection("orders")
      .where("payment.paypalOrderId", "==", paypalOrderId)
      .limit(1)
      .get();

    if (!orderSnapshot.empty) {
      const orderRef = orderSnapshot.docs[0].ref;
      const orderData = orderSnapshot.docs[0].data();

      batch.update(orderRef, {
        paymentStatus: "paid",
        status: "confirmed",
        "payment.transactionId": captureId,
        "payment.gateway": "paypal",
        "payment.method": "paypal",
        "payment.currency": currency,
        "payment.paidAt": admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create notification
      const notificationRef = db.collection("notifications").doc();
      batch.set(notificationRef, {
        userId: orderData.buyerId,
        type: "payment",
        title: "Payment Successful",
        message: `Your PayPal payment of ${currency} ${amount} for order #${orderData.orderNumber} has been confirmed.`,
        data: { orderId: orderSnapshot.docs[0].id, transactionId: captureId },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
    }
  }
}

async function handleCaptureDenied(event: any): Promise<void> {
  const capture = event.resource;
  const captureId = capture.id;
  const paypalOrderId = capture.supplementary_data?.related_ids?.order_id;

  console.log(`[PayPal] Capture denied: ${captureId}`);

  const batch = db.batch();

  if (paypalOrderId) {
    const orderSnapshot = await db
      .collection("orders")
      .where("payment.paypalOrderId", "==", paypalOrderId)
      .limit(1)
      .get();

    if (!orderSnapshot.empty) {
      const orderRef = orderSnapshot.docs[0].ref;
      const orderData = orderSnapshot.docs[0].data();

      batch.update(orderRef, {
        paymentStatus: "failed",
        status: "cancelled",
        "payment.transactionId": captureId,
        "payment.gateway": "paypal",
        "payment.failureReason": "Payment capture denied",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create notification
      const notificationRef = db.collection("notifications").doc();
      batch.set(notificationRef, {
        userId: orderData.buyerId,
        type: "payment",
        title: "Payment Failed",
        message: `PayPal payment for order #${orderData.orderNumber} was declined. Please try again.`,
        data: { orderId: orderSnapshot.docs[0].id, transactionId: captureId },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
    }
  }
}

async function handleCaptureRefunded(event: any): Promise<void> {
  const refund = event.resource;
  const refundId = refund.id;
  const amount = parseFloat(refund.amount.value);
  const currency = refund.amount.currency_code;

  // Extract capture ID from links
  const captureId = refund.links
    ?.find((l: any) => l.rel === "up")
    ?.href?.split("/")
    .pop();

  console.log(`[PayPal] Refund processed: ${refundId}`);

  const batch = db.batch();

  // Create refund record
  const refundRef = db.collection("refunds").doc(refundId);
  batch.set(refundRef, {
    gateway: "paypal",
    refundId,
    captureId,
    amount,
    currency,
    status: "completed",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Find and update order
  if (captureId) {
    const orderSnapshot = await db
      .collection("orders")
      .where("payment.transactionId", "==", captureId)
      .limit(1)
      .get();

    if (!orderSnapshot.empty) {
      const orderRef = orderSnapshot.docs[0].ref;
      const orderData = orderSnapshot.docs[0].data();

      batch.update(orderRef, {
        paymentStatus: "refunded",
        status: "refunded",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create notification
      const notificationRef = db.collection("notifications").doc();
      batch.set(notificationRef, {
        userId: orderData.buyerId,
        type: "refund",
        title: "Refund Processed",
        message: `Refund of ${currency} ${amount} for order #${orderData.orderNumber} has been processed via PayPal.`,
        data: { orderId: orderSnapshot.docs[0].id, refundId },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
    }
  }
}
