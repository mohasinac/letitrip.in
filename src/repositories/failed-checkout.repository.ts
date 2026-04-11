/**
 * Failed Checkout Repository
 *
 * Write-only repository for recording blocked and errored checkout / payment
 * attempts. Used for ops auditing, analytics, and fraud detection.
 *
 * All methods are fire-and-forget in route handlers (errors swallowed so a
 * logging failure never blocks the buyer's main flow).
 */

import { getAdminDb } from "@mohasinac/appkit/providers/db-firebase";
import {
  FAILED_CHECKOUTS_COLLECTION,
  FAILED_PAYMENTS_COLLECTION,
  type FailedCheckoutReason,
  type FailedPaymentReason,
} from "@/db/schema";

class FailedCheckoutRepository {
  /** Log a checkout attempt that was blocked or errored before an order was created. */
  async logCheckout(
    uid: string,
    reason: FailedCheckoutReason,
    detail?: string,
    meta?: {
      addressId?: string;
      paymentMethod?: string;
      cartTotal?: number;
      cartItemCount?: number;
    },
  ): Promise<void> {
    const db = getAdminDb();
    const ref = db.collection(FAILED_CHECKOUTS_COLLECTION).doc();
    await ref.set({
      id: ref.id,
      uid,
      reason,
      ...(detail ? { detail } : {}),
      ...(meta ?? {}),
      createdAt: new Date(),
    });
  }

  /** Log a Razorpay payment that failed at the verify step (signature / amount / stock). */
  async logPayment(
    uid: string,
    reason: FailedPaymentReason,
    detail?: string,
    meta?: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      amountRs?: number;
      addressId?: string;
    },
  ): Promise<void> {
    const db = getAdminDb();
    const ref = db.collection(FAILED_PAYMENTS_COLLECTION).doc();
    await ref.set({
      id: ref.id,
      uid,
      reason,
      ...(detail ? { detail } : {}),
      ...(meta ?? {}),
      createdAt: new Date(),
    });
  }
}

export const failedCheckoutRepository = new FailedCheckoutRepository();
