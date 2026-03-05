/**
 * POST /api/admin/payouts/weekly
 *
 * Admin-manual trigger — processes weekly payouts for Shiprocket orders.
 * The scheduled version of this logic runs automatically every Saturday
 * at 05:00 UTC via the `weeklyPayoutEligibility` Firebase Function.
 * Use this endpoint for on-demand admin-initiated runs only.
 *
 * Logic:
 *   1. Find all orders where:
 *        status       === 'delivered'
 *        shippingMethod === 'shiprocket'
 *        payoutStatus === 'eligible'
 *   2. Group by sellerId
 *   3. For each seller:
 *        - Load seller payout details
 *        - Compute net amount (gross - 5% platform fee)
 *        - Create a PayoutDocument (status='pending')
 *        - Update all included orders: payoutStatus='requested', payoutId=<new>
 *   4. Return a summary object
 *
 * This endpoint is intentionally idempotent — orders with payoutStatus
 * already set to 'requested' or 'paid' are silently skipped.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { userRepository, orderRepository, payoutRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthorizationError } from "@/lib/errors";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import type { OrderDocument } from "@/db/schema";

const PLATFORM_COMMISSION_RATE = 0.05; // 5 %

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const user = await userRepository.findById(authUser.uid);
    if (!user || user.role !== "admin") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    // ── 1. Fetch all eligible Shiprocket-delivered orders ──────────────────
    const eligibleOrders = await orderRepository.findBy(
      "payoutStatus",
      "eligible",
    );

    // Filter in-memory for Shiprocket + delivered
    const shiprocketDelivered = eligibleOrders.filter(
      (o): o is OrderDocument & { id: string } =>
        o.shippingMethod === "shiprocket" &&
        o.status === "delivered" &&
        Boolean(o.id),
    );

    if (shiprocketDelivered.length === 0) {
      return successResponse({
        payoutsCreated: 0,
        ordersProcessed: 0,
        sellers: [],
        message: "No eligible orders to process.",
      });
    }

    // ── 2. Group by sellerId ──────────────────────────────────────────────
    const bySeller = shiprocketDelivered.reduce<Map<string, typeof shiprocketDelivered>>(
      (map, order) => {
        const id = order.sellerId!;
        if (!map.has(id)) map.set(id, []);
        map.get(id)!.push(order);
        return map;
      },
      new Map(),
    );

    const payoutSummaries: {
      sellerId: string;
      payoutId: string;
      orderCount: number;
      netAmount: number;
      grossAmount: number;
      platformFee: number;
    }[] = [];

    // ── 3. Create one payout per seller ────────────────────────────────────
    for (const [sellerId, orders] of bySeller.entries()) {
      const seller = await userRepository.findById(sellerId);
      if (!seller) {
        serverLogger.warn("Weekly payout: seller not found, skipping", {
          sellerId,
          orderIds: orders.map((o) => o.id),
        });
        continue;
      }

      const grossAmount = orders.reduce((s, o) => s + (o.totalPrice ?? 0), 0);
      const platformFee =
        Math.round(grossAmount * PLATFORM_COMMISSION_RATE * 100) / 100;
      const netAmount =
        Math.round((grossAmount - platformFee) * 100) / 100;

      const payoutData = {
        sellerId,
        sellerName: (seller.displayName ?? seller.email ?? sellerId) as string,
        sellerEmail: (seller.email ?? "") as string,
        orderIds: orders.map((o) => o.id!),
        amount: netAmount,
        grossAmount,
        platformFee,
        platformFeeRate: PLATFORM_COMMISSION_RATE,
        currency: "INR",
        status: "pending" as const,
        paymentMethod:
          seller.payoutDetails?.method === "upi"
            ? ("upi" as const)
            : ("bank_transfer" as const),
        upiId:
          seller.payoutDetails?.method === "upi"
            ? seller.payoutDetails.upiId
            : undefined,
        bankAccount:
          seller.payoutDetails?.method === "bank_transfer" &&
          seller.payoutDetails.bankAccount
            ? {
                accountHolderName:
                  seller.payoutDetails.bankAccount.accountHolderName,
                accountNumberMasked:
                  seller.payoutDetails.bankAccount.accountNumberMasked,
                ifscCode: seller.payoutDetails.bankAccount.ifscCode,
                bankName: seller.payoutDetails.bankAccount.bankName,
              }
            : undefined,
        notes: `Automated weekly payout — ${orders.length} Shiprocket delivered order(s)`,
        requestedAt: new Date(),
      };

      const payoutDoc = await payoutRepository.create(payoutData);
      const payoutId = payoutDoc.id!;

      // Update all included orders
      await Promise.all(
        orders.map((o) =>
          orderRepository.update(o.id!, {
            payoutStatus: "requested",
            payoutId,
          }),
        ),
      );

      payoutSummaries.push({
        sellerId,
        payoutId,
        orderCount: orders.length,
        netAmount,
        grossAmount,
        platformFee,
      });

      serverLogger.info("Weekly payout created", {
        sellerId,
        payoutId,
        orderCount: orders.length,
        netAmount,
      });
    }

    serverLogger.info("Weekly payout batch complete", {
      payoutsCreated: payoutSummaries.length,
      ordersProcessed: shiprocketDelivered.length,
    });

    return successResponse(
      {
        payoutsCreated: payoutSummaries.length,
        ordersProcessed: shiprocketDelivered.length,
        sellers: payoutSummaries,
      },
      SUCCESS_MESSAGES.PAYOUT.WEEKLY_PROCESSED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
