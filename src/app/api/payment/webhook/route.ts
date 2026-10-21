import { withOnlinePaymentEnabled } from "@/lib/payment-gate";
import { withProviders } from "@/providers.config";
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
 *
 * ────────────────────────────────────────────────────────────────────────────
 * 🛑 THE ACK CONTRACT — what each status code PROMISES the gateway
 * ────────────────────────────────────────────────────────────────────────────
 *
 * A webhook response is not a courtesy, it is an instruction. Razorpay (and
 * PhonePe) decide whether to ever send this event again based purely on the
 * status we return, so the wrong code loses money silently:
 *
 *   200  we have it durably — NEVER send it again
 *   400  this request will never become good — stop, do not retry
 *   401  unauthenticated — stop, do not retry
 *   500  THIS EVENT failed transiently — please resend it
 *   503  THIS ENDPOINT cannot serve right now — please resend later
 *
 * | Failure class | Status | Why |
 * |---|---|---|
 * | no payment provider registered | 503 | misconfigured, not the event's fault |
 * | invalid / missing signature | **401** | an unauthenticated caller gets nothing |
 * | malformed JSON | **400** | a body that cannot parse never will |
 * | placement threw TRANSIENTLY (5xx) | **500** | ← the fix below |
 * | placement threw PERMANENTLY (4xx) | 200 | a retry cannot help; a human must |
 * | duplicate, already placed | 200 | idempotent no-op |
 * | unhandled event type | 200 | normal traffic, nothing owed |
 *
 * 🛑 The 500 row is the one that matters, and it used to be a 200. The
 * placement failure was caught, logged at `warn`, and acked 200 — so a buyer
 * whose payment was captured but whose order could not be created had
 * **no order, and the gateway never retried.** That is exactly the live
 * incident on 2026-10-21 (₹2,511.80 captured, order never placed, refunded by
 * hand from the Razorpay dashboard). Returning 500 on a transient failure
 * makes the gateway's own retry schedule our first line of recovery — it costs
 * nothing, needs no new infrastructure, and works today.
 *
 * The distinction is drawn with `mapToHttpError`, which is already the
 * project's one classifier of "is this error the caller's fault": >= 500 means
 * we failed and should be asked again; a 4xx means the request will never
 * succeed, so asking again forever is worse than recording it and moving on.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@mohasinac/appkit/errors/error-handler";
import { mapToHttpError } from "@mohasinac/appkit/errors/error-mapping";
import { serverErrorsRepository } from "@mohasinac/appkit/server";
import { AuthenticationError } from "@mohasinac/appkit/errors/authentication-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { getAdminRealtimeDb } from "@mohasinac/appkit/providers/db-firebase/admin";
import { RTDB_PATHS } from "@mohasinac/appkit/providers/db-firebase/rtdb-paths";
import { RTDBPayloadStatus } from "@mohasinac/appkit/react/hooks/realtime-event-constants";
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
async function handleOrderCompleted(
  merchantOrderId: string,
  route: string,
): Promise<{ retryable: boolean }> {
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
  let retryable = false;
  let placed = false;
  try {
    await verifyAndPlaceGatewayOrderAction({ merchantOrderId });
    placed = true;
  } catch (placeErr) {
    void normalizeError(placeErr);
    const mapped = mapToHttpError(placeErr);

    /*
     * 🛑 A placement failure is the most expensive thing that can happen on
     * this route — the money is already captured — so it is recorded durably
     * rather than only logged. `serverLogger.warn` alone is what made the
     * 2026-10-21 incident undiagnosable: there was no row to read, because a
     * Server Action's throw is swallowed by `wrapAction` and `onRequestError`
     * never fires for it (Root Cause #87).
     *
     * `record()` is documented never to throw, so awaiting it cannot turn a
     * logging failure into a lost webhook.
     */
    await serverErrorsRepository().record({
      source: "vercel",
      route,
      method: "POST",
      code: mapped.status >= 500 ? "WEBHOOK_PLACEMENT_FAILED" : "WEBHOOK_PLACEMENT_REJECTED",
      message: `${merchantOrderId}: ${mapped.internalMessage ?? mapped.message}`,
      stack: placeErr instanceof Error ? placeErr.stack : undefined,
      requestId: merchantOrderId,
    });

    /*
     * Transient → ask the gateway to send it again. Permanent → a retry can
     * never succeed, so we ack and leave the row above for a human. Note the
     * asymmetry is deliberate: retrying a permanent failure forever would bury
     * the genuine transient ones under noise.
     */
    retryable = mapped.status >= 500;
    serverLogger.error("webhook: order placement failed", {
      merchantOrderId,
      status: mapped.status,
      retryable,
      err: placeErr instanceof Error ? placeErr.message : String(placeErr),
    });
  }

  /*
   * 🛑 Signal RTDB on EVERY outcome, with three distinct states — and the
   * third one is the point.
   *
   * The buyer's browser polls this node. Previously it was always signalled
   * `success` because the failure was swallowed above, so a captured payment
   * with no order told the page "paid!" and the page then found no order and
   * sat on *"still being confirmed — please wait a moment and refresh"*
   * forever. That screen is what the buyer saw during the 2026-10-21 incident,
   * and refreshing could never clear it.
   *
   *   success  the order exists — proceed
   *   pending  we will be asked again by the gateway; keep waiting is honest
   *   failed   nobody is coming; stop waiting and show a real message
   */
  const signalStatus = placed
    ? RTDBPayloadStatus.SUCCESS
    : retryable
      ? RTDBPayloadStatus.PENDING
      : RTDBPayloadStatus.FAILED;
  await signalPaymentEvent(
    merchantOrderId,
    placed
      ? { status: signalStatus, updatedAt: Date.now() }
      : {
          status: signalStatus,
          /*
           * 🛑 The message must MATCH the state, and the two differ in what
           * they ask the buyer to do.
           *
           * `ORDER_PLACEMENT_IN_PROGRESS` ("still being confirmed — please
           * wait a moment and refresh") is correct ONLY while a retry is
           * genuinely coming. Attaching it to a terminal failure is how the
           * 2026-10-21 incident read to the buyer: an instruction to refresh,
           * on a state that refreshing could never change. On a permanent
           * failure say so, so support is the next step rather than another
           * reload.
           */
          error: retryable
            ? ERROR_MESSAGES.CHECKOUT.ORDER_PLACEMENT_IN_PROGRESS
            : ERROR_MESSAGES.CHECKOUT.FAILED,
          updatedAt: Date.now(),
        },
    "checkout.order.completed",
  );
  return { retryable };
}

/**
 * Signal the RTDB payment-events node for a given gateway order.
 * Extracted to eliminate deep nesting in the event-handling branches.
 */
async function signalPaymentEvent(
  orderId: string,
  /*
   * `status` is the shared RTDB payload union, not a bare `string` — the
   * browser branches on this value, so a typo would be written successfully,
   * read as an unknown state, and leave the page waiting forever. The union is
   * the same one `usePaymentEvent` consumes, so the two cannot drift.
   */
  payload: {
    status: (typeof RTDBPayloadStatus)[keyof typeof RTDBPayloadStatus];
    error?: string;
    updatedAt: number;
  },
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
  // Resolved once — every `serverErrorsRepository().record()` below needs it,
  // and `new URL(request.url)` inside a catch block is itself a throw risk.
  const routePath = "/api/payment/webhook";
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

    /*
     * No `!`. The assertion here is what turned a missing provider into a
     * TypeError and a 500 — and a 500 is the one status Razorpay RETRIES, so
     * the wrong shape of failure is worse than the failure. 503 says
     * "misconfigured, try later" honestly; it is also what `verifySession`
     * answers for an absent session provider, so the two agree.
     */
    const payment = getProviders().payment;
    if (!payment) {
      serverLogger.error("webhook: no payment provider registered — cannot verify");
      return NextResponse.json({ error: "Payment provider not configured" }, { status: 503 });
    }

    let isValid = false;
    try {
      isValid = payment.verifyWebhook(rawBody, signature);
    } catch (_err) {
      void normalizeError(_err);
      isValid = false;
    }

    if (!isValid) {
      /*
       * 🛑 FAIL CLOSED. This used to read `if (process.env.NODE_ENV ===
       * "production")`, i.e. the bypass was ON BY DEFAULT in every other
       * environment — on the one route in the application that can place an
       * order with no session, for a payment it was told about by an
       * unauthenticated caller.
       *
       * Three things were wrong with keying it on NODE_ENV:
       *
       *   1. It is an OPT-OUT, so the unsafe state is the default. Any
       *      environment that is not literally "production" — a preview
       *      deployment, a staging alias, a misconfigured env var — accepted
       *      forged webhooks.
       *   2. A Vercel PREVIEW deployment runs with NODE_ENV="production", so
       *      this happened to be safe there by coincidence rather than by
       *      intent; nothing documented or enforced that.
       *   3. It conflates "am I a developer" with "do I have credentials".
       *
       * The replacement is an explicit opt-in that CANNOT be set on Vercel:
       * `VERCEL` is injected into every Vercel runtime, so even if someone
       * added ALLOW_UNVERIFIED_WEBHOOKS=1 to the project's env vars it would
       * be inert in production, preview and development deployments alike.
       * The only place it can work is a local machine.
       */
      const allowUnverified =
        process.env.ALLOW_UNVERIFIED_WEBHOOKS === "1" && !process.env.VERCEL;

      if (!allowUnverified) {
        /*
         * Durable record, not just a log line — a forged or misconfigured
         * webhook is a security event and needs to be visible at
         * /admin/maintenance/server-errors rather than scrolling past in a
         * Vercel log that is dropped at ~4 KB/s.
         *
         * 🛑 And deliberately NO Firestore event row beyond this one. Phase 2
         * adds a `gatewayEvents` inbox that persists before acting — it must
         * stay BELOW this check, or an unauthenticated caller could create
         * Firestore documents at will simply by POSTing garbage. Persist after
         * authentication, never before.
         */
        await serverErrorsRepository().record({
          source: "vercel",
          route: routePath,
          method: "POST",
          code: "WEBHOOK_SIGNATURE_INVALID",
          message: `${gateway}: signature verification failed (signature ${signature ? "present" : "absent"}, body ${rawBody.length}B)`,
          /*
           * The gateway's own event id, when it sent one — untrusted (we just
           * refused to authenticate this caller) but valuable purely as a
           * correlation key against the provider's delivery log, which is
           * where a genuine misconfiguration is diagnosed from. Falls back to
           * a constant rather than a random id: several forged requests
           * grouping under one key is the more useful shape.
           */
          requestId: request.headers.get("x-razorpay-event-id") ?? "webhook-unauthenticated",
        });
        serverLogger.warn(`${gateway} webhook: invalid signature — rejected 401`);
        throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_SIGNATURE);
      }

      serverLogger.warn(
        `${gateway} webhook: signature check BYPASSED via ALLOW_UNVERIFIED_WEBHOOKS — local only, never set this on a deployment`,
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
      /*
       * 0c — a handled event whose order id we could not read. Distinct from
       * an event type we do not care about: this is a payload we were supposed
       * to understand and failed to, which means a real payment event is going
       * unprocessed. Durable row, because a `warn` for this is unactionable —
       * by the time anyone notices the symptom (a missing order) the log line
       * is long gone.
       */
      await serverErrorsRepository().record({
        source: "vercel",
        route: routePath,
        method: "POST",
        code: "WEBHOOK_NO_ORDER_ID",
        message: `${gateway}: ${normalised.rawEvent} carried no resolvable order id`,
        requestId: request.headers.get("x-razorpay-event-id") ?? normalised.rawEvent,
      });
      serverLogger.error(
        `${gateway} webhook: ${normalised.rawEvent} carried no resolvable order id`,
      );
    } else if (normalised.kind === "paid") {
      serverLogger.info(`${gateway} webhook paid: orderId=${gatewayOrderId}`);
      const { retryable } = await handleOrderCompleted(gatewayOrderId, routePath);
      if (retryable) {
        /*
         * 🛑 500 is a REQUEST, not a report: it asks the gateway to send this
         * event again. See the ack contract in the module header — this single
         * line is what turns a captured-but-unplaced payment from an
         * unrecoverable manual refund into something the gateway's own retry
         * schedule fixes for us.
         */
        return NextResponse.json(
          { received: true, placed: false, retry: true },
          { status: 500 },
        );
      }
    } else {
      serverLogger.warn(
        `${gateway} webhook failed: orderId=${gatewayOrderId} errorCode=${normalised.errorCode}`,
      );
      await signalPaymentEvent(
        gatewayOrderId,
        {
          status: RTDBPayloadStatus.FAILED,
          error: normalised.errorCode ?? ERROR_MESSAGES.CHECKOUT.PAYMENT_DECLINED,
          updatedAt: Date.now(),
        },
        normalised.rawEvent,
      );
    }

    /*
     * 200 = "we have it durably, never send it again". Reached when the order
     * was placed, when it was already placed (idempotent no-op), when the
     * event type is one we do not handle, or when placement failed
     * PERMANENTLY — in that last case a retry cannot help and a
     * `WEBHOOK_PLACEMENT_REJECTED` row is waiting for a human instead.
     */
    return NextResponse.json({ received: true });
  } catch (error) {
    void normalizeError(error);
    serverLogger.error("POST /api/payment/webhook error:", error);
    return handleApiError(error);
  }
}

/*
 * 🛑 `withProviders` is REQUIRED here, and this route was the only payment
 * route missing it.
 *
 * Unlike its siblings, this handler is a bare function rather than a
 * `createRouteHandler(...)`, so nothing else on the path initialises the
 * provider registry. `getProviders().payment` was therefore `undefined` and
 * the non-null assertion in `verifyWebhook` threw a TypeError, which the
 * catch turned into a flat **500 INTERNAL** — measured against production,
 * where a correctly-rejected webhook should answer 401.
 *
 * It predates the Razorpay restore (the PhonePe version had the same shape)
 * and was invisible because PhonePe was never enabled, so the settings gate
 * 404'd every request before the handler ran. Opening the gate exposed it.
 *
 * Why it matters more than a wrong status code: Razorpay RETRIES on 5xx. A
 * 500 here means a genuine `order.paid` is retried for hours against a route
 * that cannot succeed, while the buyer's order is never placed by the
 * fallback path this webhook exists to be.
 */
export const POST = withOnlinePaymentEnabled(withProviders(__POST__g));
