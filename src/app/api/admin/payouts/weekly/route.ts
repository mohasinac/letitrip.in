import "@/providers.config";
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

import {
  userRepository,
  orderRepository,
  payoutRepository,
} from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import type { OrderDocument } from "@mohasinac/appkit";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";

const PLATFORM_COMMISSION_RATE = 0.05; // 5 %

// --- Route --------------------------------------------------------------------

export const POST = createRouteHandler({
  auth: true,
  roles: ["admin"],
  handler: async () => {
    const eligibleOrders = await orderRepository.listAll({
      filters:
        "payoutStatus==eligible,shippingMethod==shiprocket,status==delivered",
      sorts: "-createdAt",
      page: "1",
      pageSize: "5000",
    });
    const shiprocketDelivered = eligibleOrders.items as (OrderDocument & {
      id: string;
    })[];

    if (shiprocketDelivered.length === 0) {
      return successResponse({
        payoutsCreated: 0,
        ordersProcessed: 0,
        sellers: [],
        message: "No eligible orders to process.",
      });
    }

    // -- 2. Group by sellerId ----------------------------------------------
    const bySeller = shiprocketDelivered.reduce<
      Map<string, typeof shiprocketDelivered>
    >((map, order) => {
      const id = order.sellerId!;
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(order);
      return map;
    }, new Map());

    const payoutSummaries: {
      sellerId: string;
      payoutId: string;
      orderCount: number;
      netAmount: number;
      grossAmount: number;
      platformFee: number;
    }[] = [];

    // -- 3. Create one payout per seller ------------------------------------
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
      const netAmount = Math.round((grossAmount - platformFee) * 100) / 100;

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
  },
});

