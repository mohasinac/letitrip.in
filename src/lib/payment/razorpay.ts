/**
 * Razorpay SDK Wrapper
 *
 * Server-side utility for Razorpay payment operations.
 * Only import this from API routes (never from client components).
 *
 * Required env vars:
 *   RAZORPAY_KEY_ID      — Razorpay API Key ID
 *   RAZORPAY_KEY_SECRET  — Razorpay API Key Secret
 *   RAZORPAY_WEBHOOK_SECRET — Razorpay webhook secret (for signature verification)
 *
 * Client-side env var (for Razorpay checkout modal):
 *   NEXT_PUBLIC_RAZORPAY_KEY_ID — same as RAZORPAY_KEY_ID, exposed to browser
 */

import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";
import { AppError } from "@/lib/errors";

// ─── Singleton Razorpay instance ─────────────────────────────────────────────

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new AppError(
        500,
        "Razorpay credentials are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local",
        "RAZORPAY_CONFIG_ERROR",
      );
    }

    razorpayInstance = new Razorpay({ key_id, key_secret });
  }
  return razorpayInstance;
}

// ─── Order Creation ────────────────────────────────────────────────────────────

export interface RazorpayOrderOptions {
  /** Amount in paise (smallest currency unit). E.g. ₹500 → 50000 */
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: string;
  attempts: number;
  created_at: number;
}

export async function createRazorpayOrder(
  opts: RazorpayOrderOptions,
): Promise<RazorpayOrder> {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: opts.amount,
    currency: opts.currency ?? "INR",
    receipt: opts.receipt ?? `rcpt_${Date.now()}`,
    notes: opts.notes,
  });
  return order as unknown as RazorpayOrder;
}

// ─── Payment Signature Verification ───────────────────────────────────────────

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Verifies Razorpay payment signature.
 * Uses HMAC-SHA256 over `{orderId}|{paymentId}` with the key secret.
 */
export function verifyPaymentSignature(params: RazorpayPaymentResult): boolean {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    throw new AppError(
      500,
      "RAZORPAY_KEY_SECRET is not configured",
      "RAZORPAY_CONFIG_ERROR",
    );
  }

  const generatedSignature = createHmac("sha256", key_secret)
    .update(`${params.razorpay_order_id}|${params.razorpay_payment_id}`)
    .digest("hex");

  // Guard: both strings must be 64 hex chars (32-byte HMAC-SHA256)
  if (params.razorpay_signature.length !== 64) return false;
  return timingSafeEqual(
    Buffer.from(generatedSignature, "hex"),
    Buffer.from(params.razorpay_signature, "hex"),
  );
}

// ─── Webhook Signature Verification ──────────────────────────────────────────

/**
 * Verifies Razorpay webhook signature.
 * Uses HMAC-SHA256 over the raw body with the webhook secret.
 */
export function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string,
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new AppError(
      500,
      "RAZORPAY_WEBHOOK_SECRET is not configured",
      "RAZORPAY_CONFIG_ERROR",
    );
  }

  const generatedSignature = createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (receivedSignature.length !== 64) return false;
  return timingSafeEqual(
    Buffer.from(generatedSignature, "hex"),
    Buffer.from(receivedSignature, "hex"),
  );
}

// ─── Currency Utilities ────────────────────────────────────────────────────────

/** Convert rupees (float) → paise (integer) for Razorpay amount field */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert paise (integer) → rupees (float) */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

// ─── Refund ────────────────────────────────────────────────────────────────────

export interface RazorpayRefundResult {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Creates a full refund for a Razorpay payment.
 * amount in paise; omit to refund the full amount.
 */
/**
 * Fetches an existing Razorpay order by ID.
 * Used in payment verification to validate that the amount paid matches the
 * server-calculated cart total, preventing price-tampering attacks.
 */
export async function fetchRazorpayOrder(
  orderId: string,
): Promise<RazorpayOrder> {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.fetch(orderId);
  return order as unknown as RazorpayOrder;
}

export async function createRazorpayRefund(
  paymentId: string,
  amountPaise?: number,
): Promise<RazorpayRefundResult> {
  const razorpay = getRazorpay();
  const opts: Record<string, unknown> = {};
  if (amountPaise) opts.amount = amountPaise;
  const refund = await razorpay.payments.refund(paymentId, opts as any);
  return refund as unknown as RazorpayRefundResult;
}
