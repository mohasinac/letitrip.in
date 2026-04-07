import "@/providers.config";
/**
 * Seller Payouts API
 *
 * GET /api/seller/payouts — List authenticated seller's payouts + earnings summary
 *
 * Mutations use Server Action: requestPayoutAction.
 */

import { successResponse } from "@/lib/api-response";
import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { orderRepository, payoutRepository } from "@/repositories";
import { DEFAULT_PLATFORM_FEE_RATE } from "@/db/schema";

// ─── Helper ───────────────────────────────────────────────────────────────

async function computeSellerEarnings(sellerId: string) {
  const eligibleOrdersResult = await orderRepository.listAll({
    filters: `sellerId==${sellerId},status==delivered,payoutStatus==eligible`,
    sorts: "-orderDate",
    page: "1",
    pageSize: "5000",
  });
  const eligibleOrders = eligibleOrdersResult.items;
  const grossAmount = eligibleOrders.reduce(
    (sum, o) => sum + (o.totalPrice ?? 0),
    0,
  );

  const platformFee = parseFloat(
    (grossAmount * DEFAULT_PLATFORM_FEE_RATE).toFixed(2),
  );
  const netAmount = parseFloat((grossAmount - platformFee).toFixed(2));

  return {
    eligibleOrders,
    grossAmount,
    platformFee,
    netAmount,
  };
}

// ─── GET — List payouts + earnings summary ─────────────────────────────────

export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const uid = user!.uid;

    const [payouts, earnings] = await Promise.all([
      payoutRepository.findBySeller(uid),
      computeSellerEarnings(uid),
    ]);

    const totalPaidOut = payouts
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + p.amount, 0);

    const hasPendingPayout = payouts.some(
      (p) => p.status === "pending" || p.status === "processing",
    );

    return successResponse({
      payouts,
      summary: {
        availableEarnings: earnings.netAmount,
        grossEarnings: earnings.grossAmount,
        platformFee: earnings.platformFee,
        platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
        totalPaidOut,
        pendingAmount,
        hasPendingPayout,
        eligibleOrderCount: earnings.eligibleOrders.length,
      },
    });
  },
});
