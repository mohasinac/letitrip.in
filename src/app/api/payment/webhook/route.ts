import { withPhonePeEnabled } from "@/lib/payment-gate";
import { normalizeError } from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";
/**
 * Payment - PhonePe Webhook Handler
 *
 * POST /api/payment/webhook
 *
 * Handles server-to-server event notifications from PhonePe. Verifies the
 * webhook Authorization header and processes relevant events.
 *
 * Events handled:
 *   checkout.order.completed  — Payment completed successfully
 *   checkout.order.failed     — Payment failed
 *
 * PhonePe sends the webhook's SHA/Basic credentials as a plain `Authorization`
 * header (`SHA256(username:password)`, verified by the SDK's own
 * `validateCallback`). PHONEPE_WEBHOOK_USERNAME/PASSWORD (or the equivalent
 * site-settings credentials) must be configured and match the username/
 * password set in the PhonePe dashboard under "Webhooks".
 *
 * 🛑 Unlike Razorpay, this route is NOT just a fallback signal. PhonePe never
 * hands the browser a verifiable proof of payment, so if the buyer closes the
 * tab before the client's own /api/payment/verify call completes, THIS is the
 * only thing that ever places the order. `verifyAndPlacePhonePeOrderAction`'s
 * idempotency claim ensures the client call and this webhook can never both
 * place orders for the same payment.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@mohasinac/appkit";
import { AuthenticationError, ValidationError } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { getAdminRealtimeDb } from "@mohasinac/appkit";
import { RTDB_PATHS } from "@mohasinac/appkit";
import { getProviders } from "@mohasinac/appkit";
import { verifyAndPlacePhonePeOrderAction } from "@mohasinac/appkit";

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface PhonePeWebhookPayload {
  merchantOrderId?: string;
  orderId?: string;
  state?: string;
  errorCode?: string;
}

/**
 * Handle `checkout.order.completed` — place the order (idempotent, see the
 * module-level comment) then signal RTDB. Extracted to keep the switch/case
 * block under the brace-depth threshold.
 */
async function handleOrderCompleted(merchantOrderId: string): Promise<void> {
  // No buyer session here — verifyAndPlacePhonePeOrderAction resolves
  // uid/addressId/outOfStockPolicy from the metaInfo packed at create-order
  // time, and its idempotency claim makes this a no-op if the buyer's own
  // /verify call already placed the order.
  try {
    await verifyAndPlacePhonePeOrderAction({ merchantOrderId });
  } catch (placeErr) {
    void normalizeError(placeErr);
    serverLogger.warn("PhonePe webhook: order placement failed (non-fatal — webhook still acks)", {
      merchantOrderId,
      err: placeErr instanceof Error ? placeErr.message : String(placeErr),
    });
  }
  await signalPaymentEvent(
    merchantOrderId,
    { status: "success", updatedAt: Date.now() },
    "checkout.order.completed",
  );
}

/**
 * Signal the RTDB payment-events node for a given PhonePe order.
 * Extracted to eliminate deep nesting in the switch/case blocks.
 */
async function signalPaymentEvent(
  orderId: string,
  payload: { status: string; error?: string; updatedAt: number },
  logTag: string,
): Promise<void> {
  try {
    await getAdminRealtimeDb()
      .ref(`${RTDB_PATHS.PAYMENT_EVENTS}/${orderId}`)
      .update(payload);
  } catch (err) {
    void normalizeError(err);
    serverLogger.warn(`${logTag} RTDB signal failed`, { err });
  }
}

// Vercel Hobby max is 60 s; the Order Status confirm + order placement fits well within that.
export const maxDuration = 60;

async function __POST__g(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const authorization = request.headers.get("authorization") ?? "";

    // Verify webhook signature
    let isValid = false;
    try {
      isValid = getProviders().payment!.verifyWebhook(rawBody, authorization);
    } catch (_err) {
      void normalizeError(_err);
      isValid = false;
    }

    if (!isValid) {
      // In development without webhook credentials configured, allow through
      // (remove in production).
      if (process.env.NODE_ENV === "production") {
        serverLogger.warn("PhonePe webhook: invalid signature received");
        throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_SIGNATURE);
      }
      serverLogger.warn(
        "PhonePe webhook: signature invalid or PHONEPE_WEBHOOK_USERNAME/PASSWORD not configured — skipping check in dev",
      );
    }

    // Parse event
    let event: { event: string; payload: PhonePeWebhookPayload & Record<string, JsonValue> };
    try {
      event = JSON.parse(rawBody);
    } catch (_err) {
      void normalizeError(_err);
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_JSON); // malformed webhook payload
    }

    serverLogger.info(`PhonePe webhook event: ${event.event}`);

    const merchantOrderId = event.payload?.merchantOrderId;

    switch (event.event) {
      case "checkout.order.completed": {
        serverLogger.info(`checkout.order.completed: merchantOrderId=${merchantOrderId}`);
        if (merchantOrderId) {
          await handleOrderCompleted(merchantOrderId);
        }
        break;
      }

      case "checkout.order.failed": {
        serverLogger.warn(
          `checkout.order.failed: merchantOrderId=${merchantOrderId} errorCode=${event.payload?.errorCode}`,
        );
        if (merchantOrderId) {
          await signalPaymentEvent(
            merchantOrderId,
            {
              status: "failed",
              error: event.payload?.errorCode ?? ERROR_MESSAGES.CHECKOUT.PAYMENT_DECLINED,
              updatedAt: Date.now(),
            },
            "checkout.order.failed",
          );
        }
        break;
      }

      default:
        serverLogger.info(`PhonePe webhook: unhandled event ${event.event}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    void normalizeError(error);
    serverLogger.error("POST /api/payment/webhook error:", error);
    return handleApiError(error);
  }
}

export const POST = withPhonePeEnabled(__POST__g);
