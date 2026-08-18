// NOT "use client" — typed REST wrappers for payment routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ENDPOINTS } from "@mohasinac/appkit";

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

export async function createCheckoutOrder(body: unknown): Promise<Response> {
  return fetch(API_ENDPOINTS.CHECKOUT.PLACE_ORDER, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

// ── Razorpay ─────────────────────────────────────────────────────────────────

export async function createRazorpayOrder(amount: number): Promise<Response> {
  return fetch(API_ENDPOINTS.PAYMENT.CREATE_ORDER, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ amount }),
  });
}

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
