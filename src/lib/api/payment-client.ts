// NOT "use client" — typed REST wrappers for payment routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ENDPOINTS } from "@mohasinac/appkit/client";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

export interface AttachProofBody {
  proofUrl: string;
  transactionId?: string;
  mimeType?: string;
  buyerMarkedPaid?: boolean;
  buyerFraudAgreementAccepted: boolean;
  buyerReportedUpiId?: string;
}

export interface AttachProofResult {
  ok: boolean;
  code?: string;
  error?: string;
}

export async function attachPaymentProof(
  orderId: string,
  body: AttachProofBody,
): Promise<AttachProofResult> {
  const res = await fetch(API_ENDPOINTS.ORDERS.PAYMENT_PROOF(orderId), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({})) as Omit<AttachProofResult, "ok">;
  return { ok: res.ok, ...json };
}

export interface RaiseDisputeResult {
  ok: boolean;
  error?: string;
}

export async function raiseOrderDispute(
  orderId: string,
  reason: string,
): Promise<RaiseDisputeResult> {
  const res = await fetch(API_ENDPOINTS.ORDERS.DISPUTE(orderId), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ reason }),
  });
  const json = await res.json().catch(() => ({})) as Omit<RaiseDisputeResult, "ok">;
  return { ok: res.ok, ...json };
}

export async function createCheckoutOrder(body: unknown): Promise<Response> {
  return fetch(API_ENDPOINTS.CHECKOUT.PLACE_ORDER, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

// ── Online gateway (Razorpay | PhonePe) ──────────────────────────────────────

/**
 * Add-on selections are no longer part of any checkout request body — they live
 * on the cart document keyed per store (`CartDocument.storeAddons`), because
 * that is the granularity they are billed at. Write them with
 * `persistCartAddons()` from `@/lib/api/cart-client`.
 */
export interface CheckoutPricingPreviewBody {
  addressId?: string;
  paymentMethod: "cod" | "online" | "upi_manual" | "cash" | "emi";
  excludedProductIds?: string[];
  /** Which cart lane to price. Omit to price whichever lane is payable. */
  lane?: "standard" | "auction" | "offer";
  /** Chosen EMI tenure. The surcharge scales with it. */
  emiTenureMonths?: number;
}

/*
 * The pricing-preview response contract, RE-EXPORTED from its one owner.
 *
 * 🛑 These were two hand-written interfaces here, under a comment reading
 * "mirrors `CheckoutPricingPreviewStore` on the server". They drifted exactly
 * as Root Cause #42 says a mirror will: the server gained `emiSurcharge`, this
 * copy did not, and the preview the cart fetched could no longer be assigned to
 * the `CartPriceBreakdown` component that renders it — four `tsc` errors across
 * CartRouteClient and CheckoutRouteClient, all from one missing field in a
 * second definition of one shape.
 *
 * Re-exported rather than merely imported, because several modules already
 * import these NAMES from this file (`usePricingPreview`, both route clients).
 * Keeping them exported here makes the fix one file with no call-site churn.
 *
 * A response contract has exactly one owner: the handler that produces it.
 */
export type {
  CheckoutPricingPreview,
  CheckoutPricingPreviewStore,
} from "@mohasinac/appkit/client";

export async function fetchCheckoutPricingPreview(body: CheckoutPricingPreviewBody): Promise<Response> {
  return fetch(API_ENDPOINTS.CHECKOUT.PRICING_PREVIEW, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

/** Which gateway the server actually registered — decides how the browser pays. */
export type OnlineGateway = "razorpay" | "phonepe";

/**
 * What `/api/payment/create-order` returns. The gateway-specific fields are
 * optional because exactly one gateway is live per deployment, and each needs
 * a different thing from the browser:
 *
 *   - Razorpay: `keyId` (publishable) + `merchantOrderId`, fed to its modal.
 *   - PhonePe:  `redirectUrl`, a hosted page to open.
 *
 * Branch on `provider`, never on which field happens to be present — a
 * missing field is then a loud failure instead of silently falling into the
 * other gateway's flow.
 */
export interface CreateOrderResult {
  merchantOrderId: string;
  provider: OnlineGateway | "manual";
  amount: number;
  currency: string;
  keyId?: string;
  redirectUrl?: string;
  expireAt?: string;
}

/**
 * The server computes the amount from the live cart — `amount` is sent for
 * logging parity only and is never trusted. Add-ons come from the cart doc.
 *
 * 🛑 `addressId` and `outOfStockPolicy` are sent HERE as well as to `/verify`,
 * and the duplication is deliberate. The server packs them into the gateway's
 * passthrough channel (PhonePe `metaInfo`, Razorpay `notes`) so the WEBHOOK —
 * which has no session and never sees a `/verify` body — can place the order
 * on its own. Without them the webhook path threw `ADDRESS_REQUIRED` on every
 * physical-goods cart, which is the confirmed cause of a captured payment with
 * no order (D64).
 *
 * `addressId` is optional only because a digital-only cart has no delivery
 * address; the server rejects a missing one for any cart that needs shipping.
 */
export async function createOnlinePaymentOrder(
  amount: number,
  intent?: { addressId?: string; outOfStockPolicy?: "cancel_order" | "skip_items" },
): Promise<Response> {
  return fetch(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({
      amount,
      ...(intent?.addressId ? { addressId: intent.addressId } : {}),
      ...(intent?.outOfStockPolicy ? { outOfStockPolicy: intent.outOfStockPolicy } : {}),
    }),
  });
}

/** Add-ons come from the cart doc server-side — see CheckoutPricingPreviewBody. */
export interface VerifyPaymentBody {
  merchantOrderId: string;
  addressId: string;
  outOfStockPolicy: "cancel_order" | "skip_items";
  /**
   * Razorpay's signed client callback, forwarded verbatim. Omitted for
   * PhonePe, which gives the browser nothing verifiable.
   *
   * 🛑 Sending it is not a shortcut: the server verifies the order against
   * the gateway either way, and an invalid signature is a hard rejection.
   */
  razorpaySignature?: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  };
}

export async function verifyOnlinePayment(body: VerifyPaymentBody): Promise<Response> {
  return fetch(API_ENDPOINTS.PAYMENT.VERIFY, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}
