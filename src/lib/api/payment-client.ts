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

// ── Razorpay ─────────────────────────────────────────────────────────────────

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
  codHandlingFee: number;
  whatsappNotifyFee: number;
  giftWrapFee: number;
  shipmentProtectionFee: number;
  gstAmount: number;
  couponDiscount: number;
  total: number;
}

export interface CheckoutPricingPreview {
  subtotal: number;
  shippingFee: number;
  codHandlingFee: number;
  whatsappNotifyFee: number;
  giftWrapFee: number;
  shipmentProtectionFee: number;
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

/**
 * The server computes the amount from the live cart — `amount` is sent for
 * logging parity only and is never trusted. Add-ons come from the cart doc.
 */
export async function createRazorpayOrder(amount: number): Promise<Response> {
  return fetch(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ amount }),
  });
}

/** Add-ons come from the cart doc server-side — see CheckoutPricingPreviewBody. */
export interface RazorpayVerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  addressId: string;
  outOfStockPolicy: "cancel_order" | "skip_items";
}

export async function verifyRazorpayPayment(body: RazorpayVerifyBody): Promise<Response> {
  return fetch(API_ENDPOINTS.PAYMENT.VERIFY, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}
