/**
 * POST /api/seller/orders/bulk
 *
 * Bulk actions on seller orders.
 *
 * Supported actions:
 *
 *   action = "request_payout"
 *     Body: { action, orderIds: string[] }
 *
 *     Validates:
 *       - Each order must belong to this seller
 *       - order.status === 'delivered'
 *       - order.shippingMethod === 'custom'   (Shiprocket payouts are weekly/admin-initiated)
 *       - order.payoutStatus === 'eligible'   (not yet 'requested' or 'paid')
 *
 *     Creates one PayoutDocument per eligible batch, marks orders payoutStatus='requested'.
 *     Returns: { requested: string[], skipped: string[] }
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import { userRepository, orderRepository, payoutRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import {
  AuthorizationError,
  ValidationError,
} from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

// ─── Schemas ────────────────────────────────────────────────────────────────

const requestPayoutSchema = z.object({
  action: z.literal("request_payout"),
  orderIds: z.array(z.string().min(1)).min(1, ERROR_MESSAGES.BULK_ORDER.NO_ORDERS_SELECTED),
});

const bulkActionSchema = z.discriminatedUnion("action", [
  requestPayoutSchema,
]);

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const user = await userRepository.findById(authUser.uid);

    if (!user) throw new AuthorizationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    if (user.role !== "seller" && user.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    const body = await request.json();
    const validation = bulkActionSchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }
    const data = validation.data;

    // ── action: request_payout ───────────────────────────────────────────────
    if (data.action === "request_payout") {
      if (!user.payoutDetails?.isConfigured) {
        throw new ValidationError(
          "Payout details are not set up. Please configure your payout method before requesting a payout.",
        );
      }

      // Fetch all requested orders
      const orders = await Promise.all(
        data.orderIds.map((id) => orderRepository.findById(id)),
      );

      const requested: string[] = [];
      const skipped: string[] = [];
      const eligible: NonNullable<Awaited<ReturnType<typeof orderRepository.findById>>>[] = [];

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const id = data.orderIds[i];

        if (!order) { skipped.push(id); continue; }

        // Ownership check (admin bypasses)
        if (user.role !== "admin" && order.sellerId !== authUser.uid) {
          skipped.push(id); continue;
        }

        // Eligibility checks
        if (order.status !== "delivered")         { skipped.push(id); continue; }
        if (order.shippingMethod !== "custom")    { skipped.push(id); continue; }
        if (order.payoutStatus === "requested")   { skipped.push(id); continue; }
        if (order.payoutStatus === "paid")        { skipped.push(id); continue; }

        eligible.push(order as NonNullable<typeof order>);
      }

      if (eligible.length === 0) {
        throw new ValidationError(ERROR_MESSAGES.BULK_ORDER.NO_ELIGIBLE_ORDERS);
      }

      // Compute net total (before platform commission)
      const PLATFORM_COMMISSION_RATE = 0.05; // 5%
      const grossAmount = eligible.reduce(
        (sum, o) => sum + (o.totalPrice ?? 0),
        0,
      );
      const platformFee = Math.round(grossAmount * PLATFORM_COMMISSION_RATE * 100) / 100;
      const netAmount = Math.round((grossAmount - platformFee) * 100) / 100;

      // Create a single payout document covering all eligible orders
      const payoutData = {
        sellerId: authUser.uid,
        sellerName: (user.displayName ?? user.email ?? authUser.uid) as string,
        sellerEmail: (user.email ?? "") as string,
        orderIds: eligible.map((o) => o.id!),
        amount: netAmount,
        grossAmount,
        platformFee,
        platformFeeRate: PLATFORM_COMMISSION_RATE,
        currency: "INR",
        paymentMethod:
          user.payoutDetails.method === "upi"
            ? ("upi" as const)
            : ("bank_transfer" as const),
        upiId:
          user.payoutDetails.method === "upi"
            ? user.payoutDetails.upiId
            : undefined,
        bankAccount:
          user.payoutDetails.method === "bank_transfer"
            ? user.payoutDetails.bankAccount
            : undefined,
        notes: `Payout request for ${eligible.length} custom-shipped delivered order(s)`,
      };

      const payoutDoc = await payoutRepository.create(payoutData);
      const payoutId = payoutDoc.id;

      // Update all eligible orders
      await Promise.all(
        eligible.map((o) =>
          orderRepository.update(o.id!, {
            payoutStatus: "requested",
            payoutId,
          }),
        ),
      );

      // Populate output
      eligible.forEach((o) => requested.push(o.id!));

      serverLogger.info("Bulk payout requested", {
        uid: authUser.uid,
        payoutId,
        orderCount: eligible.length,
        netAmount,
      });

      return successResponse(
        {
          payoutId,
          requested,
          skipped,
          eligibleCount: eligible.length,
          skippedCount: skipped.length,
          netAmount,
          grossAmount,
          platformFee,
        },
        SUCCESS_MESSAGES.PAYOUT.BULK_REQUESTED,
      );
    }

    // Should be exhausted by discriminated union
    throw new ValidationError("Unknown bulk action");
  } catch (error) {
    return handleApiError(error);
  }
}
