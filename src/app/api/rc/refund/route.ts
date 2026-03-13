/**
 * POST /api/rc/refund
 *
 * Refunds an RC purchase transaction.
 * - Only "purchase" type transactions are eligible.
 * - The transaction must belong to the authenticated user.
 * - The user must have enough free (un-engaged) coins to cover the refund.
 * - All coins from the purchase (base + bonus) are debited.
 * - Triggers a Razorpay payment refund if razorpayPaymentId is present.
 */

import { userRepository, rcRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { createRazorpayRefund, rupeesToPaise } from "@/lib/payment/razorpay";
import { z } from "zod";

const refundSchema = z.object({
  transactionId: z.string().min(1),
});

export const POST = createApiHandler<(typeof refundSchema)["_output"]>({
  auth: true,
  schema: refundSchema,
  handler: async ({ user, body }) => {
    const { transactionId } = body!;

    // Fetch the transaction
    const tx = await rcRepository.findById(transactionId);
    if (!tx) {
      return errorResponse(ERROR_MESSAGES.RC.REFUND_NOT_ELIGIBLE, 404);
    }

    // Must belong to authenticated user
    if (tx.userId !== user!.uid) {
      return errorResponse(ERROR_MESSAGES.RC.REFUND_NOT_ELIGIBLE, 403);
    }

    // Must be a purchase
    if (tx.type !== "purchase") {
      return errorResponse(ERROR_MESSAGES.RC.REFUND_NOT_ELIGIBLE, 400);
    }

    // Must not already be refunded
    if (tx.refunded) {
      return errorResponse(ERROR_MESSAGES.RC.ALREADY_REFUNDED, 409);
    }

    const coinsToRefund = tx.coins; // includes bonus

    // Check the user has enough free coins
    const userDoc = await userRepository.findById(user!.uid);
    const freeCoins = (userDoc?.rcBalance ?? 0) - (userDoc?.engagedRC ?? 0);

    if (freeCoins < coinsToRefund) {
      return errorResponse(ERROR_MESSAGES.RC.REFUND_INSUFFICIENT_BALANCE, 422);
    }

    const balanceBefore = userDoc?.rcBalance ?? 0;
    const balanceAfter = balanceBefore - coinsToRefund;

    // Debit the coins atomically
    await userRepository.incrementRCBalance(user!.uid, -coinsToRefund);

    // Attempt Razorpay refund (best-effort)
    let razorpayRefundId: string | undefined;
    if (tx.razorpayPaymentId && tx.amountPaid) {
      try {
        const razorpayRefund = await createRazorpayRefund(
          tx.razorpayPaymentId,
          rupeesToPaise(tx.amountPaid),
        );
        razorpayRefundId = razorpayRefund.id;
      } catch (err) {
        // Non-fatal: log and continue. Coins already debited.
        serverLogger.warn("Razorpay refund failed (coins still debited)", {
          transactionId,
          uid: user!.uid,
          error: err,
        });
      }
    }

    const refundedAt = new Date();

    // Mark the original purchase as refunded
    await rcRepository.markRefunded(
      transactionId,
      refundedAt,
      razorpayRefundId,
    );

    // Record the refund transaction in the ledger
    await rcRepository.create({
      userId: user!.uid,
      type: "refund",
      coins: -coinsToRefund,
      balanceBefore,
      balanceAfter,
      notes: `Refund of purchase ${transactionId}${razorpayRefundId ? ` (Razorpay: ${razorpayRefundId})` : ""}`,
    });

    serverLogger.info("RC purchase refunded", {
      uid: user!.uid,
      transactionId,
      coinsRefunded: coinsToRefund,
      razorpayRefundId,
    });

    return successResponse(
      {
        coinsRefunded: coinsToRefund,
        newBalance: balanceAfter,
        razorpayRefundId,
      },
      SUCCESS_MESSAGES.RC.REFUND_COMPLETE,
    );
  },
});
