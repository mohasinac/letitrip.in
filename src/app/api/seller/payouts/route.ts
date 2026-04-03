/**
 * Seller Payouts API
 *
 * GET /api/seller/payouts — List authenticated seller's payouts + earnings summary
 *
 * Mutations use Server Action: requestPayoutAction.
 */

import { successResponse } from "@/lib/api-response";
import { createRouteHandler } from "@mohasinac/next";
import {
  productRepository,
  orderRepository,
  payoutRepository,
} from "@/repositories";
import { DEFAULT_PLATFORM_FEE_RATE } from "@/db/schema";

// ─── Helper ───────────────────────────────────────────────────────────────

async function computeSellerEarnings(sellerId: string) {
  const products = await productRepository.findBySeller(sellerId);
  const productIds = products.slice(0, 50).map((p) => p.id);

  let deliveredOrders: Awaited<
    ReturnType<typeof orderRepository.findByProduct>
  > = [];
  if (productIds.length > 0) {
    const batches = await Promise.all(
      productIds.map((id) =>
        orderRepository
          .findByProduct(id)
          .catch(() => [] as typeof deliveredOrders),
      ),
    );
    deliveredOrders = batches.flat().filter((o) => o.status === "delivered");
  }

  // 3. Deduplicate order IDs already covered by existing payouts
  const paidOutIds = await payoutRepository.getPaidOutOrderIds(sellerId);

  const eligibleOrders = deliveredOrders.filter((o) => !paidOutIds.has(o.id));
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
    productCount: products.length,
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
