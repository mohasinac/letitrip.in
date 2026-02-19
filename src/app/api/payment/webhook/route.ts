/**
 * Payment - Razorpay Webhook Handler
 *
 * POST /api/payment/webhook
 *
 * Handles server-to-server event notifications from Razorpay.
 * Verifies the webhook signature and processes relevant events.
 *
 * Events handled:
 *   payment.captured  — Payment captured successfully
 *   payment.failed    — Payment failed
 *   order.paid        — Order fully paid
 *
 * Razorpay sends a `x-razorpay-signature` header with each webhook request.
 * RAZORPAY_WEBHOOK_SECRET must be configured and match the secret in the
 * Razorpay dashboard under "Webhooks".
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payment/razorpay";
import { serverLogger } from "@/lib/server-logger";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";

    // Verify webhook signature
    let isValid = false;
    try {
      isValid = verifyWebhookSignature(rawBody, signature);
    } catch {
      serverLogger.warn(
        "Razorpay webhook: RAZORPAY_WEBHOOK_SECRET not configured — skipping signature check in dev",
      );
      // In development without a secret, allow through (remove in production)
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
      isValid = true;
    }

    if (!isValid) {
      serverLogger.warn("Razorpay webhook: invalid signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse event
    let event: { event: string; payload: Record<string, unknown> };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    serverLogger.info(`Razorpay webhook event: ${event.event}`);

    // Handle events
    switch (event.event) {
      case "payment.captured": {
        // Payment was captured — orders should already be confirmed via /verify
        // This acts as a fallback confirmation
        const payment = (
          event.payload as {
            payment?: { entity?: { id?: string; order_id?: string } };
          }
        )?.payment?.entity;
        serverLogger.info(
          `payment.captured: paymentId=${payment?.id} orderId=${payment?.order_id}`,
        );
        break;
      }

      case "payment.failed": {
        // Log failed payments for monitoring
        const payment = (
          event.payload as {
            payment?: {
              entity?: {
                id?: string;
                order_id?: string;
                error_description?: string;
              };
            };
          }
        )?.payment?.entity;
        serverLogger.warn(
          `payment.failed: paymentId=${payment?.id} reason=${payment?.error_description}`,
        );
        break;
      }

      case "order.paid": {
        serverLogger.info(
          `order.paid: razorpay order fully paid — ${JSON.stringify(event.payload)}`,
        );
        break;
      }

      default:
        serverLogger.info(`Razorpay webhook: unhandled event ${event.event}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    serverLogger.error("POST /api/payment/webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
