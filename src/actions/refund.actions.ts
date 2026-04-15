"use server";

/**
 * Refund Server Actions
 *
 * Admin-initiated partial refund (net of processing fees)
 * and user-facing cancellation refund flow.
 */

import { z } from "zod";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import {
  orderRepository,
  siteSettingsRepository,
  notificationRepository,
} from "@/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from "@mohasinac/appkit/errors";

// ─── Defaults (fallback when not set in siteSettings) ─────────────────────
const DEFAULT_PROCESSING_FEE_PERCENT = 2.36; // Razorpay standard

// ─── Schemas ──────────────────────────────────────────────────────────────

const partialRefundSchema = z.object({
  orderId: z.string().min(1),
  /** true = deduct processing fee; false = full refund */
  deductFees: z.boolean().default(true),
  refundNote: z.string().max(500).optional(),
});

export type PartialRefundInput = z.infer<typeof partialRefundSchema>;

export interface PartialRefundResult {
  orderId: string;
  grossRefund: number;
  feeDeducted: number;
  netRefund: number;
  currency: string;
}

// ─── Admin: Issue partial refund ───────────────────────────────────────────

export async function adminPartialRefundAction(
  input: PartialRefundInput,
): Promise<PartialRefundResult> {
  const user = await requireRole("admin");

  const rl = await rateLimitByIdentifier(
    `refund:admin:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success) throw new AuthorizationError("Too many requests.");

  const parsed = partialRefundSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid input",
    );

  const { orderId, deductFees, refundNote } = parsed.data;

  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError("Order not found.");
  if (order.paymentStatus !== "paid")
    throw new ValidationError("Only paid orders can be refunded.");
  if (order.refundStatus === "completed")
    throw new ValidationError("Order has already been fully refunded.");

  // Fetch fee rate from siteSettings (with default fallback)
  const settings = await siteSettingsRepository.getSingleton();
  const feePercent =
    settings.commissions?.processingFeePercent ??
    DEFAULT_PROCESSING_FEE_PERCENT;

  const grossRefund = order.totalPrice;
  const feeDeducted = deductFees
    ? parseFloat(((grossRefund * feePercent) / 100).toFixed(2))
    : 0;
  const netRefund = parseFloat((grossRefund - feeDeducted).toFixed(2));

  // Update order with refund breakdown
  await orderRepository.update(orderId, {
    refundStatus: "processing",
    refundAmount: grossRefund,
    refundFeeDeducted: feeDeducted,
    refundNetAmount: netRefund,
    refundNote,
    paymentStatus: "refunded",
    updatedAt: new Date(),
  });

  // Notify buyer
  await notificationRepository.create({
    userId: order.userId,
    type: "refund_initiated",
    priority: "high",
    title: "Refund Initiated",
    message: deductFees
      ? `Your refund of ₹${netRefund} (original ₹${grossRefund} minus ₹${feeDeducted} gateway fee) is being processed.`
      : `Your full refund of ₹${grossRefund} is being processed.`,
    relatedId: orderId,
    relatedType: "order",
  });

  serverLogger.info("Admin partial refund initiated", {
    adminUid: user.uid,
    orderId,
    grossRefund,
    feeDeducted,
    netRefund,
    deductFees,
  });

  return {
    orderId,
    grossRefund,
    feeDeducted,
    netRefund,
    currency: order.currency,
  };
}

// ─── User: Preview refund amount before confirming cancellation ────────────

export async function previewCancellationRefundAction(
  orderId: string,
): Promise<PartialRefundResult | null> {
  const user = await requireAuth();

  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError("Order not found.");
  if (order.userId !== user.uid)
    throw new AuthorizationError("Not authorised.");
  if (order.paymentStatus !== "paid") return null; // Nothing to refund

  const settings = await siteSettingsRepository.getSingleton();
  const feePercent =
    settings.commissions?.processingFeePercent ??
    DEFAULT_PROCESSING_FEE_PERCENT;

  const grossRefund = order.totalPrice;
  const feeDeducted = parseFloat(((grossRefund * feePercent) / 100).toFixed(2));
  const netRefund = parseFloat((grossRefund - feeDeducted).toFixed(2));

  return {
    orderId,
    grossRefund,
    feeDeducted,
    netRefund,
    currency: order.currency,
  };
}

