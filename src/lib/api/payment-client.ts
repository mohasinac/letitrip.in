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

export interface CheckoutAddonSelections {
  whatsappNotifyAddon?: boolean;
  giftWrapAddon?: boolean;
  giftWrapMessage?: string;
  shipmentProtectionAddon?: boolean;
}

export interface CheckoutPricingPreviewBody extends CheckoutAddonSelections {
  addressId?: string;
  paymentMethod: "cod" | "online" | "upi_manual" | "cash" | "emi";
  excludedProductIds?: string[];
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
  total: number;
}

export async function fetchCheckoutPricingPreview(body: CheckoutPricingPreviewBody): Promise<Response> {
  return fetch(API_ENDPOINTS.CHECKOUT.PRICING_PREVIEW, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

export async function createRazorpayOrder(
  amount: number,
  addons?: CheckoutAddonSelections,
): Promise<Response> {
  return fetch(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ amount, ...addons }),
  });
}

export interface RazorpayVerifyBody extends CheckoutAddonSelections {
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
