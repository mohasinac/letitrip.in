/**
 * Firebase Functions - Payment Webhooks
 *
 * Handles webhooks from payment gateways:
 * - Razorpay webhooks
 * - PayPal webhooks
 * - Stripe webhooks
 *
 * All webhook handlers:
 * - Verify webhook signatures
 * - Update order/payment status in Firestore
 * - Trigger notifications
 * - Log to Firebase Functions logs
 */

import { createHmac } from "crypto";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v2/https";

const db = admin.firestore();

// ============================================================================
// RAZORPAY WEBHOOK
// ============================================================================

/**
 * Razorpay Webhook Handler
 *
 * Events handled:
 * - payment.authorized
 * - payment.captured
 * - payment.failed
 * - order.paid
 * - refund.created
 * - refund.processed
 *
 * Docs: https://razorpay.com/docs/webhooks/
 */
export const razorpayWebhook = functions.onRequest(
  {
    region: "asia-south1",
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  async (request, response) => {
    const startTime = Date.now();
    console.log("[Razorpay Webhook] Received request");

    try {
      // Verify webhook signature
      const signature = request.headers["x-razorpay-signature"];
      if (!signature || typeof signature !== "string") {
        console.error("[Razorpay Webhook] Missing signature");
        response.status(400).json({ error: "Missing signature" });
        return;
      }

      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error("[Razorpay Webhook] Webhook secret not configured");
        response.status(500).json({ error: "Configuration error" });
        return;
      }

      const payload = JSON.stringify(request.body);
      const expectedSignature = createHmac("sha256", webhookSecret)
        .update(payload)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("[Razorpay Webhook] Invalid signature");
        response.status(403).json({ error: "Invalid signature" });
        return;
      }

      // Process webhook event
      const event = request.body;
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

      const duration = Date.now() - startTime;
      console.log(`[Razorpay Webhook] Completed in ${duration}ms`);

      response.status(200).json({ received: true });
    } catch (error) {
      console.error("[Razorpay Webhook] Error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  }
);

// Razorpay event handlers
async function handlePaymentAuthorized(event: any): Promise<void> {
  const payment = event.payload.payment.entity;
  const paymentId = payment.id;
  const orderId = payment.order_id;
  const amount = payment.amount / 100; // Convert from paise to rupees

  console.log(
    `[Razorpay] Payment authorized: ${paymentId} for order ${orderId}`
  );

  // Update payment document
  const paymentRef = db.collection("payments").doc(paymentId);
  await paymentRef.set(
    {
      gateway: "razorpay",
      status: "authorized",
      paymentId,
      orderId,
      amount,
      currency: payment.currency,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      authorizedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update order status
  const orderSnapshot = await db
    .collection("orders")
    .where("razorpayOrderId", "==", orderId)
    .limit(1)
    .get();

  if (!orderSnapshot.empty) {
    const orderDoc = orderSnapshot.docs[0];
    await orderDoc.ref.update({
      paymentStatus: "authorized",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Razorpay] Order ${orderDoc.id} marked as authorized`);
  }
}

async function handlePaymentCaptured(event: any): Promise<void> {
  const payment = event.payload.payment.entity;
  const paymentId = payment.id;
  const orderId = payment.order_id;
  const amount = payment.amount / 100;

  console.log(`[Razorpay] Payment captured: ${paymentId} for order ${orderId}`);

  // Update payment document
  const paymentRef = db.collection("payments").doc(paymentId);
  await paymentRef.set(
    {
      gateway: "razorpay",
      status: "captured",
      paymentId,
      orderId,
      amount,
      currency: payment.currency,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update order status to paid
  const orderSnapshot = await db
    .collection("orders")
    .where("razorpayOrderId", "==", orderId)
    .limit(1)
    .get();

  if (!orderSnapshot.empty) {
    const orderDoc = orderSnapshot.docs[0];
    await orderDoc.ref.update({
      paymentStatus: "paid",
      status: "confirmed",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Razorpay] Order ${orderDoc.id} marked as paid`);

    // TODO: Trigger order confirmation notification
    // await notificationService.sendOrderConfirmation(orderDoc.id);
  }
}

async function handlePaymentFailed(event: any): Promise<void> {
  const payment = event.payload.payment.entity;
  const paymentId = payment.id;
  const orderId = payment.order_id;

  console.log(`[Razorpay] Payment failed: ${paymentId} for order ${orderId}`);

  // Update payment document
  const paymentRef = db.collection("payments").doc(paymentId);
  await paymentRef.set(
    {
      gateway: "razorpay",
      status: "failed",
      paymentId,
      orderId,
      errorCode: payment.error_code,
      errorDescription: payment.error_description,
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update order status
  const orderSnapshot = await db
    .collection("orders")
    .where("razorpayOrderId", "==", orderId)
    .limit(1)
    .get();

  if (!orderSnapshot.empty) {
    const orderDoc = orderSnapshot.docs[0];
    await orderDoc.ref.update({
      paymentStatus: "failed",
      status: "payment_failed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Razorpay] Order ${orderDoc.id} marked as failed`);
  }
}

async function handleOrderPaid(event: any): Promise<void> {
  const order = event.payload.order.entity;
  const orderId = order.id;

  console.log(`[Razorpay] Order paid: ${orderId}`);

  // Update order status
  const orderSnapshot = await db
    .collection("orders")
    .where("razorpayOrderId", "==", orderId)
    .limit(1)
    .get();

  if (!orderSnapshot.empty) {
    const orderDoc = orderSnapshot.docs[0];
    await orderDoc.ref.update({
      paymentStatus: "paid",
      status: "confirmed",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Razorpay] Order ${orderDoc.id} confirmed`);
  }
}

async function handleRefundCreated(event: any): Promise<void> {
  const refund = event.payload.refund.entity;
  const refundId = refund.id;
  const paymentId = refund.payment_id;
  const amount = refund.amount / 100;

  console.log(
    `[Razorpay] Refund created: ${refundId} for payment ${paymentId}`
  );

  // Create refund document
  const refundRef = db.collection("refunds").doc(refundId);
  await refundRef.set({
    gateway: "razorpay",
    refundId,
    paymentId,
    amount,
    currency: refund.currency,
    status: "created",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update payment document
  const paymentRef = db.collection("payments").doc(paymentId);
  await paymentRef.update({
    refunded: true,
    refundStatus: "processing",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleRefundProcessed(event: any): Promise<void> {
  const refund = event.payload.refund.entity;
  const refundId = refund.id;
  const paymentId = refund.payment_id;

  console.log(`[Razorpay] Refund processed: ${refundId}`);

  // Update refund document
  const refundRef = db.collection("refunds").doc(refundId);
  await refundRef.update({
    status: "processed",
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update payment document
  const paymentRef = db.collection("payments").doc(paymentId);
  await paymentRef.update({
    refundStatus: "completed",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // TODO: Trigger refund confirmation notification
}

// ============================================================================
// PAYPAL WEBHOOK
// ============================================================================

/**
 * PayPal Webhook Handler
 *
 * Events handled:
 * - PAYMENT.CAPTURE.COMPLETED
 * - PAYMENT.CAPTURE.DENIED
 * - PAYMENT.CAPTURE.REFUNDED
 *
 * Docs: https://developer.paypal.com/docs/api-basics/notifications/webhooks/
 */
export const paypalWebhook = functions.onRequest(
  {
    region: "asia-south1",
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  async (request, response) => {
    const startTime = Date.now();
    console.log("[PayPal Webhook] Received request");

    try {
      // TODO: Verify PayPal webhook signature
      // PayPal uses a different verification method (certificate-based)
      // Docs: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#verify-webhook-signatures

      const event = request.body;
      const eventType = event.event_type;

      console.log(`[PayPal Webhook] Processing event: ${eventType}`);

      switch (eventType) {
        case "PAYMENT.CAPTURE.COMPLETED":
          await handlePayPalCaptureCompleted(event);
          break;

        case "PAYMENT.CAPTURE.DENIED":
          await handlePayPalCaptureDenied(event);
          break;

        case "PAYMENT.CAPTURE.REFUNDED":
          await handlePayPalCaptureRefunded(event);
          break;

        default:
          console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
      }

      const duration = Date.now() - startTime;
      console.log(`[PayPal Webhook] Completed in ${duration}ms`);

      response.status(200).json({ received: true });
    } catch (error) {
      console.error("[PayPal Webhook] Error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  }
);

// PayPal event handlers
async function handlePayPalCaptureCompleted(event: any): Promise<void> {
  const capture = event.resource;
  const captureId = capture.id;
  const orderId = capture.supplementary_data?.related_ids?.order_id;
  const amount = parseFloat(capture.amount.value);
  const currency = capture.amount.currency_code;

  console.log(`[PayPal] Capture completed: ${captureId} for order ${orderId}`);

  // Update payment document
  const paymentRef = db.collection("payments").doc(captureId);
  await paymentRef.set(
    {
      gateway: "paypal",
      status: "captured",
      captureId,
      orderId,
      amount,
      currency,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update order status
  if (orderId) {
    const orderSnapshot = await db
      .collection("orders")
      .where("paypalOrderId", "==", orderId)
      .limit(1)
      .get();

    if (!orderSnapshot.empty) {
      const orderDoc = orderSnapshot.docs[0];
      await orderDoc.ref.update({
        paymentStatus: "paid",
        status: "confirmed",
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[PayPal] Order ${orderDoc.id} marked as paid`);
    }
  }
}

async function handlePayPalCaptureDenied(event: any): Promise<void> {
  const capture = event.resource;
  const captureId = capture.id;
  const orderId = capture.supplementary_data?.related_ids?.order_id;

  console.log(`[PayPal] Capture denied: ${captureId}`);

  // Update payment document
  const paymentRef = db.collection("payments").doc(captureId);
  await paymentRef.set(
    {
      gateway: "paypal",
      status: "denied",
      captureId,
      orderId,
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update order status
  if (orderId) {
    const orderSnapshot = await db
      .collection("orders")
      .where("paypalOrderId", "==", orderId)
      .limit(1)
      .get();

    if (!orderSnapshot.empty) {
      const orderDoc = orderSnapshot.docs[0];
      await orderDoc.ref.update({
        paymentStatus: "failed",
        status: "payment_failed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
}

async function handlePayPalCaptureRefunded(event: any): Promise<void> {
  const refund = event.resource;
  const refundId = refund.id;
  const captureId = refund.links
    ?.find((l: any) => l.rel === "up")
    ?.href?.split("/")
    .pop();
  const amount = parseFloat(refund.amount.value);
  const currency = refund.amount.currency_code;

  console.log(`[PayPal] Refund processed: ${refundId}`);

  // Create refund document
  const refundRef = db.collection("refunds").doc(refundId);
  await refundRef.set({
    gateway: "paypal",
    refundId,
    captureId,
    amount,
    currency,
    status: "completed",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update payment document
  if (captureId) {
    const paymentRef = db.collection("payments").doc(captureId);
    await paymentRef.update({
      refunded: true,
      refundStatus: "completed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

// ============================================================================
// STRIPE WEBHOOK
// ============================================================================

/**
 * Stripe Webhook Handler
 *
 * Events handled:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 *
 * Docs: https://stripe.com/docs/webhooks
 */
export const stripeWebhook = functions.onRequest(
  {
    region: "asia-south1",
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  async (request, response) => {
    const startTime = Date.now();
    console.log("[Stripe Webhook] Received request");

    try {
      // TODO: Verify Stripe webhook signature
      // const signature = request.headers['stripe-signature'];
      // Docs: https://stripe.com/docs/webhooks/signatures

      const event = request.body;
      const eventType = event.type;

      console.log(`[Stripe Webhook] Processing event: ${eventType}`);

      switch (eventType) {
        case "payment_intent.succeeded":
          await handleStripePaymentSucceeded(event);
          break;

        case "payment_intent.payment_failed":
          await handleStripePaymentFailed(event);
          break;

        case "charge.refunded":
          await handleStripeChargeRefunded(event);
          break;

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${eventType}`);
      }

      const duration = Date.now() - startTime;
      console.log(`[Stripe Webhook] Completed in ${duration}ms`);

      response.status(200).json({ received: true });
    } catch (error) {
      console.error("[Stripe Webhook] Error:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  }
);

// Stripe event handlers
async function handleStripePaymentSucceeded(event: any): Promise<void> {
  const paymentIntent = event.data.object;
  const paymentId = paymentIntent.id;
  const amount = paymentIntent.amount / 100; // Convert from cents
  const currency = paymentIntent.currency.toUpperCase();

  console.log(`[Stripe] Payment succeeded: ${paymentId}`);

  // Update payment document
  const paymentRef = db.collection("payments").doc(paymentId);
  await paymentRef.set(
    {
      gateway: "stripe",
      status: "succeeded",
      paymentId,
      amount,
      currency,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update order status if orderId is in metadata
  const orderId = paymentIntent.metadata?.orderId;
  if (orderId) {
    const orderRef = db.collection("orders").doc(orderId);
    await orderRef.update({
      paymentStatus: "paid",
      status: "confirmed",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Stripe] Order ${orderId} marked as paid`);
  }
}

async function handleStripePaymentFailed(event: any): Promise<void> {
  const paymentIntent = event.data.object;
  const paymentId = paymentIntent.id;

  console.log(`[Stripe] Payment failed: ${paymentId}`);

  // Update payment document
  const paymentRef = db.collection("payments").doc(paymentId);
  await paymentRef.set(
    {
      gateway: "stripe",
      status: "failed",
      paymentId,
      errorMessage: paymentIntent.last_payment_error?.message,
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update order status
  const orderId = paymentIntent.metadata?.orderId;
  if (orderId) {
    const orderRef = db.collection("orders").doc(orderId);
    await orderRef.update({
      paymentStatus: "failed",
      status: "payment_failed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

async function handleStripeChargeRefunded(event: any): Promise<void> {
  const charge = event.data.object;
  const chargeId = charge.id;
  const refunds = charge.refunds.data;

  console.log(`[Stripe] Charge refunded: ${chargeId}`);

  // Process each refund
  for (const refund of refunds) {
    const refundRef = db.collection("refunds").doc(refund.id);
    await refundRef.set({
      gateway: "stripe",
      refundId: refund.id,
      chargeId,
      amount: refund.amount / 100,
      currency: refund.currency.toUpperCase(),
      status: refund.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Update payment document
  const paymentRef = db.collection("payments").doc(chargeId);
  await paymentRef.update({
    refunded: true,
    refundStatus: "completed",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
