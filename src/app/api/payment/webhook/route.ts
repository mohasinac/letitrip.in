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
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { RTDB_PATHS } from "@/lib/firebase/realtime-db";

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
        throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_SIGNATURE);
      }
      isValid = true;
    }

    if (!isValid) {
      serverLogger.warn("Razorpay webhook: invalid signature received");
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_SIGNATURE);
    }

    // Parse event
    let event: { event: string; payload: Record<string, unknown> };
    try {
      event = JSON.parse(rawBody);
    } catch {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_JSON);
    }

    serverLogger.info(`Razorpay webhook event: ${event.event}`);

    // Handle events
    switch (event.event) {
      case "payment.captured": {
        // Payment was captured — orders should already be confirmed via /verify.
        // Signal the RTDB node as a fallback in case the client lost connectivity.
        const payment = (
          event.payload as {
            payment?: { entity?: { id?: string; order_id?: string } };
          }
        )?.payment?.entity;
        serverLogger.info(
          `payment.captured: paymentId=${payment?.id} orderId=${payment?.order_id}`,
        );
        if (payment?.order_id) {
          getAdminRealtimeDb()
            .ref(`${RTDB_PATHS.PAYMENT_EVENTS}/${payment.order_id}`)
            .update({ status: "success", updatedAt: Date.now() })
            .catch((err) =>
              serverLogger.warn("payment.captured RTDB signal failed", { err }),
            );
        }
        break;
      }

      case "payment.failed": {
        // Signal the RTDB node so usePaymentEvent can show the failure to the user.
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
        if (payment?.order_id) {
          getAdminRealtimeDb()
            .ref(`${RTDB_PATHS.PAYMENT_EVENTS}/${payment.order_id}`)
            .update({
              status: "failed",
              error:
                payment.error_description ??
                ERROR_MESSAGES.CHECKOUT.PAYMENT_DECLINED,
              updatedAt: Date.now(),
            })
            .catch((err) =>
              serverLogger.warn("payment.failed RTDB signal failed", { err }),
            );
        }
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
    return handleApiError(error);
  }
}
