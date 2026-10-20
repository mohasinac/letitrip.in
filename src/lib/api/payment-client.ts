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
}

/** One store's slice — mirrors `CheckoutPricingPreviewStore` on the server. */
export interface CheckoutPricingPreviewStore {
  storeId: string;
  storeName: string;
  subtotal: number;
  shippingFee: number;
  codHandlingFee: number;  giftWrapFee: number;
  shipmentProtectionFee: number;
  saleProtectionFee: number;
  gstAmount: number;
  couponDiscount: number;
  total: number;
  /** C5e tiers 2+3 for this store — see `CheckoutPricingPreviewStore` on the server. */
  supportsShippingProtection: boolean;
  supportsSaleProtection: boolean;
  hasFinalSaleItem: boolean;
}

export interface CheckoutPricingPreview {
  subtotal: number;
  shippingFee: number;
  codHandlingFee: number;  giftWrapFee: number;
  shipmentProtectionFee: number;
  saleProtectionFee: number;
  gstAmount: number;
  couponDiscount: number;
  /** Capped buyer-facing commission, charged once for the checkout. */
  platformFee: number;
  /** GST on the capped commission. */
  gstOnFee: number;
  total: number;
  /** Per-store breakdown, feeding each seller card's own fee lines. */
  stores: CheckoutPricingPreviewStore[];
}

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
 */
export async function createOnlinePaymentOrder(amount: number): Promise<Response> {
  return fetch(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ amount }),
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
