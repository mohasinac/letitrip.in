import { withOnlinePaymentEnabled } from "@/lib/payment-gate";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
/**
 * Payment - Online Gateway Webhook Handler (PhonePe + Razorpay)
 *
 * POST /api/payment/webhook
 *
 * Handles server-to-server event notifications from whichever online gateway
 * `providers.config.ts` registered. Verifies the signature, normalises the
 * event, and places the order (idempotently) on success.
 *
 * 🛑 The two gateways differ in BOTH places a webhook can differ — the header
 * carrying the signature, and the shape of the body — so neither can be
 * hard-coded:
 *
 * | | PhonePe | Razorpay |
 * |---|---|---|
 * | signature header | `Authorization` (`SHA256(user:pass)`, checked by its SDK's `validateCallback`) | `x-razorpay-signature` (HMAC-SHA256 over the raw body) |
 * | paid event | `checkout.order.completed` | `order.paid` / `payment.captured` |
 * | failed event | `checkout.order.failed` | `payment.failed` |
 * | order id lives at | `payload.merchantOrderId` | `payload.order.entity.id` / `payload.payment.entity.order_id` |
 *
 * 🛑 The raw body text is what gets verified, never a re-serialised object.
 * `JSON.stringify(JSON.parse(body))` is not guaranteed to reproduce the bytes
 * the gateway signed, so `request.text()` is read once and both the
 * signature check and the parse work from that same string.
 *
 * For PhonePe this route is NOT merely a fallback: PhonePe never hands the
 * browser a verifiable proof of payment, so if the buyer closes the tab
 * before the client's own /api/payment/verify call completes, THIS is the
 * only thing that ever places the order. Razorpay's buyer-present path
 * normally wins the race. Either way
 * `verifyAndPlaceGatewayOrderAction`'s idempotency claim ensures the client
 * call and this webhook can never both place orders for the same payment.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@mohasinac/appkit/errors/error-handler";
import { AuthenticationError } from "@mohasinac/appkit/errors/authentication-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { getAdminRealtimeDb } from "@mohasinac/appkit/providers/db-firebase/admin";
import { RTDB_PATHS } from "@mohasinac/appkit/providers/db-firebase/rtdb-paths";
import { getProviders } from "@mohasinac/appkit/contracts/registry";
import { verifyAndPlaceGatewayOrderAction } from "@mohasinac/appkit";

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface PhonePeWebhookPayload {
  merchantOrderId?: string;
  orderId?: string;
  state?: string;
  errorCode?: string;
}

/** Razorpay nests each entity one level deeper than PhonePe does. */
interface RazorpayWebhookBody {
  event?: string;
  payload?: {
    order?: { entity?: { id?: string } };
    payment?: { entity?: { id?: string; order_id?: string; error_description?: string } };
  };
}

/**
 * What this route actually needs from a webhook, with the gateway's
 * vocabulary already resolved: did the payment succeed, and which gateway
 * order id does it concern.
 *
 * `kind: "other"` is deliberately distinct from a missing order id — an
 * unhandled event type is normal traffic (Razorpay alone sends dozens), while
 * a handled event with no resolvable id is a payload we failed to read and
 * worth logging differently.
 */
interface NormalisedEvent {
  kind: "paid" | "failed" | "other";
  gatewayOrderId?: string;
  errorCode?: string;
  rawEvent: string;
}

function normaliseRazorpayEvent(body: RazorpayWebhookBody): NormalisedEvent {
  const rawEvent = body.event ?? "(none)";
  const orderId =
    body.payload?.order?.entity?.id ?? body.payload?.payment?.entity?.order_id;
  switch (rawEvent) {
    /*
     * Both mean "money captured for this order", and Razorpay may send
     * either or both depending on dashboard configuration. Treating them
     * identically is safe because order placement is idempotent on the
     * gateway order id — two events for one payment place one order.
     */
    case "order.paid":
    case "payment.captured":
      return { kind: "paid", gatewayOrderId: orderId, rawEvent };
    case "payment.failed":
      return {
        kind: "failed",
        gatewayOrderId: orderId,
        errorCode: body.payload?.payment?.entity?.error_description,
        rawEvent,
      };
    default:
      return { kind: "other", rawEvent };
  }
}

function normalisePhonePeEvent(body: {
  event?: string;
  payload?: PhonePeWebhookPayload;
}): NormalisedEvent {
  const rawEvent = body.event ?? "(none)";
  switch (rawEvent) {
    case "checkout.order.completed":
      return { kind: "paid", gatewayOrderId: body.payload?.merchantOrderId, rawEvent };
    case "checkout.order.failed":
      return {
        kind: "failed",
        gatewayOrderId: body.payload?.merchantOrderId,
        errorCode: body.payload?.errorCode,
        rawEvent,
      };
    default:
      return { kind: "other", rawEvent };
  }
}

/**
 * Handle `checkout.order.completed` — place the order (idempotent, see the
 * module-level comment) then signal RTDB. Extracted to keep the switch/case
 * block under the brace-depth threshold.
 */
async function handleOrderCompleted(merchantOrderId: string): Promise<void> {
  /*
   * No buyer session here — `verifyAndPlaceGatewayOrderAction` resolves
   * uid/addressId/outOfStockPolicy from the gateway's own passthrough channel
   * (PhonePe's `metaInfo`, Razorpay's `notes`), packed at create-order time.
   * Its idempotency claim makes this a no-op if the buyer's own /verify call
   * already placed the order.
   *
   * No `razorpaySignature` is passed, and that is correct rather than a gap:
   * the signed callback only exists in the browser. The webhook's own
   * signature was already verified above, and the action re-fetches the order
   * from the gateway regardless — which is the authoritative check on both
   * paths.
   */
  try {
    await verifyAndPlaceGatewayOrderAction({ merchantOrderId });
  } catch (placeErr) {
    void normalizeError(placeErr);
    serverLogger.warn("webhook: order placement failed (non-fatal — webhook still acks)", {
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
 * Signal the RTDB payment-events node for a given gateway order.
 * Extracted to eliminate deep nesting in the event-handling branches.
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
    const gateway = getProviders().payment?.name ?? "manual";

    /*
     * Each gateway signs into a different header. Reading the wrong one hands
     * `verifyWebhook` an empty string, which fails closed — so in production
     * the symptom would be every webhook 401ing, and in dev (where the check
     * is skipped) it would be silently unverified traffic.
     */
    const signature =
      gateway === "razorpay"
        ? (request.headers.get("x-razorpay-signature") ?? "")
        : (request.headers.get("authorization") ?? "");

    let isValid = false;
    try {
      isValid = getProviders().payment!.verifyWebhook(rawBody, signature);
    } catch (_err) {
      void normalizeError(_err);
      isValid = false;
    }

    if (!isValid) {
      // In development without webhook credentials configured, allow through
      // (never in production).
      if (process.env.NODE_ENV === "production") {
        serverLogger.warn(`${gateway} webhook: invalid signature received`);
        throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_SIGNATURE);
      }
      serverLogger.warn(
        `${gateway} webhook: signature invalid or webhook secret not configured — skipping check in dev`,
      );
    }

    // Parsed from the SAME string that was just verified — see the header.
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch (_err) {
      void normalizeError(_err);
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_JSON); // malformed webhook payload
    }

    const normalised =
      gateway === "razorpay"
        ? normaliseRazorpayEvent(body as RazorpayWebhookBody)
        : normalisePhonePeEvent(
            body as { event?: string; payload?: PhonePeWebhookPayload & Record<string, JsonValue> },
          );

    serverLogger.info(`${gateway} webhook event: ${normalised.rawEvent}`);

    const { gatewayOrderId } = normalised;

    if (normalised.kind === "other") {
      serverLogger.info(`${gateway} webhook: unhandled event ${normalised.rawEvent}`);
    } else if (!gatewayOrderId) {
      // A handled event we could not read an order id out of — distinct from
      // an event type we do not care about, and worth its own line.
      serverLogger.warn(
        `${gateway} webhook: ${normalised.rawEvent} carried no resolvable order id`,
      );
    } else if (normalised.kind === "paid") {
      serverLogger.info(`${gateway} webhook paid: orderId=${gatewayOrderId}`);
      await handleOrderCompleted(gatewayOrderId);
    } else {
      serverLogger.warn(
        `${gateway} webhook failed: orderId=${gatewayOrderId} errorCode=${normalised.errorCode}`,
      );
      await signalPaymentEvent(
        gatewayOrderId,
        {
          status: "failed",
          error: normalised.errorCode ?? ERROR_MESSAGES.CHECKOUT.PAYMENT_DECLINED,
          updatedAt: Date.now(),
        },
        normalised.rawEvent,
      );
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    void normalizeError(error);
    serverLogger.error("POST /api/payment/webhook error:", error);
    return handleApiError(error);
  }
}

export const POST = withOnlinePaymentEnabled(__POST__g);
