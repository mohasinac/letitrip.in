import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

const db = admin.firestore();

/**
 * Stripe Webhook Handler
 *
 * Events handled:
 * - payment_intent.succeeded: Payment successful
 * - payment_intent.payment_failed: Payment failed
 * - charge.refunded: Charge refunded
 *
 * Verification: Stripe signature verification (simplified for MVP)
 * Docs: https://stripe.com/docs/webhooks
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  console.log("[Stripe Webhook] Received request");

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // TODO: Implement Stripe webhook signature verification
    // const signature = req.headers['stripe-signature'];
    // Docs: https://stripe.com/docs/webhooks/signatures
    // For MVP, we'll trust the webhook endpoint security

    const event = req.body;
    const eventType = event.type;

    console.log(`[Stripe Webhook] Processing event: ${eventType}`);

    switch (eventType) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${eventType}`);
    }

    console.log(`[Stripe Webhook] Successfully processed ${eventType}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function handlePaymentSucceeded(event: any): Promise<void> {
  const paymentIntent = event.data.object;
  const paymentId = paymentIntent.id;
  const amount = paymentIntent.amount / 100; // Convert from cents
  const currency = paymentIntent.currency.toUpperCase();
  const orderId = paymentIntent.metadata?.orderId;

  console.log(`[Stripe] Payment succeeded: ${paymentId}`);

  if (!orderId) {
    console.error("[Stripe] No orderId in payment intent metadata");
    return;
  }

  const batch = db.batch();

  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();

  if (orderDoc.exists) {
    const orderData = orderDoc.data()!;

    batch.update(orderRef, {
      paymentStatus: "paid",
      status: "confirmed",
      "payment.transactionId": paymentId,
      "payment.gateway": "stripe",
      "payment.method": "card",
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
      message: `Your payment of ${currency} ${amount} for order #${orderData.orderNumber} has been confirmed.`,
      data: { orderId, transactionId: paymentId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
  }
}

async function handlePaymentFailed(event: any): Promise<void> {
  const paymentIntent = event.data.object;
  const paymentId = paymentIntent.id;
  const orderId = paymentIntent.metadata?.orderId;
  const errorMessage = paymentIntent.last_payment_error?.message;

  console.log(`[Stripe] Payment failed: ${paymentId}`);

  if (!orderId) {
    console.error("[Stripe] No orderId in payment intent metadata");
    return;
  }

  const batch = db.batch();

  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();

  if (orderDoc.exists) {
    const orderData = orderDoc.data()!;

    batch.update(orderRef, {
      paymentStatus: "failed",
      status: "cancelled",
      "payment.transactionId": paymentId,
      "payment.gateway": "stripe",
      "payment.failureReason": errorMessage || "Payment failed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create notification
    const notificationRef = db.collection("notifications").doc();
    batch.set(notificationRef, {
      userId: orderData.buyerId,
      type: "payment",
      title: "Payment Failed",
      message: `Payment for order #${orderData.orderNumber} failed. Please try again.`,
      data: { orderId, transactionId: paymentId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
  }
}

async function handleChargeRefunded(event: any): Promise<void> {
  const charge = event.data.object;
  const chargeId = charge.id;
  const refunds = charge.refunds.data;

  console.log(`[Stripe] Charge refunded: ${chargeId}`);

  const batch = db.batch();

  // Process each refund
  for (const refund of refunds) {
    const refundRef = db.collection("refunds").doc(refund.id);
    const amount = refund.amount / 100;
    const currency = refund.currency.toUpperCase();

    batch.set(refundRef, {
      gateway: "stripe",
      refundId: refund.id,
      chargeId,
      amount,
      currency,
      status: refund.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Find and update order
  const orderSnapshot = await db
    .collection("orders")
    .where("payment.transactionId", "==", chargeId)
    .limit(1)
    .get();

  if (!orderSnapshot.empty) {
    const orderRef = orderSnapshot.docs[0].ref;
    const orderData = orderSnapshot.docs[0].data();
    const totalRefunded =
      refunds.reduce((sum: number, r: any) => sum + r.amount, 0) / 100;

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
      message: `Refund of ${refunds[0].currency.toUpperCase()} ${totalRefunded} for order #${
        orderData.orderNumber
      } has been processed.`,
      data: {
        orderId: orderSnapshot.docs[0].id,
        refundIds: refunds.map((r: any) => r.id),
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
}
