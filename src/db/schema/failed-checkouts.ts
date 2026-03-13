/**
 * Failed Checkouts + Failed Payments Schema
 *
 * Written on every blocked / errored checkout or payment attempt.
 * Used for ops auditing, analytics, and fraud detection.
 */

// ─── Collections ──────────────────────────────────────────────────────────────

export const FAILED_CHECKOUTS_COLLECTION = "failedCheckouts" as const;
export const FAILED_PAYMENTS_COLLECTION = "failedPayments" as const;

// ─── Reason Enums ─────────────────────────────────────────────────────────────

export type FailedCheckoutReason =
  | "otp_not_verified" // Consent OTP doc missing or not yet verified
  | "consent_expired" // OTP doc existed but was expired at commit time
  | "stock_failed" // All cart items out of stock in Firestore transaction
  | "address_not_found" // Shipping address deleted between step-1 and checkout
  | "cart_empty" // Cart had no items (or all items were excluded)
  | "validation_error" // Business rule / schema validation failure
  | "unknown";

export type FailedPaymentReason =
  | "signature_mismatch" // Razorpay HMAC verification failed
  | "payment_cancelled" // Buyer cancelled the Razorpay modal (client-side)
  | "amount_mismatch" // Paid amount < server-calculated expected amount
  | "otp_not_verified" // Consent OTP missing/expired at payment verify time
  | "consent_expired" // Consent OTP found but expired
  | "product_unavailable" // Product became unavailable between payment + verify
  | "stock_insufficient" // Insufficient stock at verify time
  | "unknown";

// ─── Documents ────────────────────────────────────────────────────────────────

export interface FailedCheckoutDocument {
  id: string;
  uid: string;
  addressId?: string;
  paymentMethod?: string;
  cartTotal?: number;
  cartItemCount?: number;
  /** Machine-readable failure category. */
  reason: FailedCheckoutReason;
  /** Raw error message for ops — not shown to buyers. */
  detail?: string;
  createdAt: Date;
}

export interface FailedPaymentDocument {
  id: string;
  uid: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  /** Amount in rupees. */
  amountRs?: number;
  addressId?: string;
  reason: FailedPaymentReason;
  /** Raw error message for ops. */
  detail?: string;
  createdAt: Date;
}
