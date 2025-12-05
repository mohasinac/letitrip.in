import { createHmac } from "crypto";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

const db = admin.firestore();

/**
 * Razorpay Webhook Handler
 *
 * Events handled:
 * - payment.authorized: Payment authorized (not captured yet)
 * - payment.captured: Payment captured successfully
 * - payment.failed: Payment failed
 * - order.paid: Order paid successfully
 * - refund.created: Refund initiated
 * - refund.processed: Refund processed successfully
 *
 * Verification: HMAC SHA-256 signature verification
 * Docs: https://razorpay.com/docs/webhooks/
 */
export const razorpayWebhook = functions.https.onRequest(async (req, res) => {
  console.log("[Razorpay Webhook] Received request");

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Verify webhook signature
    const signature = req.headers["x-razorpay-signature"];
    if (!signature || typeof signature !== "string") {
      console.error("[Razorpay Webhook] Missing signature");
      res.status(400).json({ error: "Missing signature" });
      return;
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Razorpay Webhook] Webhook secret not configured");
      res.status(500).json({ error: "Configuration error" });
      return;
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("[Razorpay Webhook] Invalid signature");
      res.status(403).json({ error: "Invalid signature" });
      return;
    }

    // Process webhook event
    const event = req.body;
    const eventType = event.event;

    console.log(`[Razorpay Webhook] Processing event: ${eventType}`);

    switch (eventType) {
      case "payment.authorized":
        await handlePaymentAuthorized(event);
        break;

      case "payment.captured":
        await handlePaymentCaptured(event);
        break;

      case "payment.failed":
        await handlePaymentFailed(event);
        break;

      case "order.paid":
        await handleOrderPaid(event);
        break;

      case "refund.created":
        await handleRefundCreated(event);
        break;

      case "refund.processed":
        await handleRefundProcessed(event);
        break;

      default:
        console.log(`[Razorpay Webhook] Unhandled event type: ${eventType}`);
    }

    console.log(`[Razorpay Webhook] Successfully processed ${eventType}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Razorpay Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function handlePaymentAuthorized(event: any): Promise<void> {
  const payment = event.payload.payment.entity;
  const paymentId = payment.id;
  const razorpayOrderId = payment.order_id;

  console.log(`[Razorpay] Payment authorized: ${paymentId}`);

  const batch = db.batch();

  // Find order by razorpayOrderId
  const orderSnapshot = await db
    .collection("orders")
    .where("payment.razorpayOrderId", "==", razorpayOrderId)
    .limit(1)
    .get();

  if (!orderSnapshot.empty) {
    const orderRef = orderSnapshot.docs[0].ref;
    batch.update(orderRef, {
      paymentStatus: "authorized",
      "payment.transactionId": paymentId,
      "payment.gateway": "razorpay",
      "payment.method": payment.method,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
  }
}

async function handlePaymentCaptured(event: any): Promise<void> {
  const payment = event.payload.payment.entity;
  const paymentId = payment.id;
  const razorpayOrderId = payment.order_id;
  const amount = payment.amount / 100;

  console.log(`[Razorpay] Payment captured: ${paymentId}`);

  const batch = db.batch();

  // Find order
  const orderSnapshot = await db
    .collection("orders")
    .where("payment.razorpayOrderId", "==", razorpayOrderId)
    .limit(1)
    .get();

  if (!orderSnapshot.empty) {
    const orderRef = orderSnapshot.docs[0].ref;
    const orderData = orderSnapshot.docs[0].data();

    batch.update(orderRef, {
      paymentStatus: "paid",
      status: "confirmed",
      "payment.transactionId": paymentId,
      "payment.gateway": "razorpay",
      "payment.method": payment.method,
      "payment.paidAt": admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create notification
    const notificationRef = db.collection("notifications").doc();
    batch.set(notificationRef, {
      userId: orderData.buyerId,
      type: "payment",
      title: "Payment Successful",
      message: `Your payment of ₹${amount.toLocaleString("en-IN")} for order #${
        orderData.orderNumber
      } has been confirmed.`,
      data: { orderId: orderSnapshot.docs[0].id, transactionId: paymentId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
  }
}

async function handlePaymentFailed(event: any): Promise<void> {
  const payment = event.payload.payment.entity;
  const paymentId = payment.id;
  const razorpayOrderId = payment.order_id;

  console.log(`[Razorpay] Payment failed: ${paymentId}`);

  const batch = db.batch();

  // Find order
  const orderSnapshot = await db
    .collection("orders")
    .where("payment.razorpayOrderId", "==", razorpayOrderId)
    .limit(1)
    .get();

  if (!orderSnapshot.empty) {
    const orderRef = orderSnapshot.docs[0].ref;
    const orderData = orderSnapshot.docs[0].data();

    batch.update(orderRef, {
      paymentStatus: "failed",
      status: "cancelled",
      "payment.transactionId": paymentId,
      "payment.gateway": "razorpay",
      "payment.failureReason": payment.error_description || "Payment failed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create notification
    const notificationRef = db.collection("notifications").doc();
    batch.set(notificationRef, {
      userId: orderData.buyerId,
      type: "payment",
      title: "Payment Failed",
      message: `Payment for order #${orderData.orderNumber} failed. Please try again.`,
      data: { orderId: orderSnapshot.docs[0].id, transactionId: paymentId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
  }
}

async function handleOrderPaid(event: any): Promise<void> {
  const order = event.payload.order.entity;
  const razorpayOrderId = order.id;

  console.log(`[Razorpay] Order paid: ${razorpayOrderId}`);

  const batch = db.batch();

  // Find order
  const orderSnapshot = await db
    .collection("orders")
    .where("payment.razorpayOrderId", "==", razorpayOrderId)
    .limit(1)
    .get();

  if (!orderSnapshot.empty) {
    const orderRef = orderSnapshot.docs[0].ref;
    batch.update(orderRef, {
      paymentStatus: "paid",
      status: "confirmed",
      "payment.paidAt": admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
  }
}

async function handleRefundCreated(event: any): Promise<void> {
  const refund = event.payload.refund.entity;
  const refundId = refund.id;
  const paymentId = refund.payment_id;
  const amount = refund.amount / 100;

  console.log(`[Razorpay] Refund created: ${refundId}`);

  const batch = db.batch();

  // Create refund record
  const refundRef = db.collection("refunds").doc(refundId);
  batch.set(refundRef, {
    gateway: "razorpay",
    refundId,
    paymentId,
    amount,
    currency: refund.currency,
    status: "processing",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
}

async function handleRefundProcessed(event: any): Promise<void> {
  const refund = event.payload.refund.entity;
  const refundId = refund.id;
  const amount = refund.amount / 100;

  console.log(`[Razorpay] Refund processed: ${refundId}`);

  const batch = db.batch();

  // Update refund status
  const refundRef = db.collection("refunds").doc(refundId);
  batch.update(refundRef, {
    status: "completed",
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Find and update order
  const refundDoc = await refundRef.get();
  if (refundDoc.exists) {
    const refundData = refundDoc.data();
    const paymentId = refundData?.paymentId;

    if (paymentId) {
      const orderSnapshot = await db
        .collection("orders")
        .where("payment.transactionId", "==", paymentId)
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
          message: `Refund of ₹${amount.toLocaleString("en-IN")} for order #${
            orderData.orderNumber
          } has been processed.`,
          data: { orderId: orderSnapshot.docs[0].id, refundId },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }

  await batch.commit();
}
