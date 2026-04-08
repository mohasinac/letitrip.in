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
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { buildSieveFilters } from "@mohasinac/utils";
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
  handler: async ({ request, user }) => {
    const uid = user!.uid;
    const searchParams = getSearchParams(request);
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 20, {
      min: 1,
      max: 200,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";
    const sellerFilter = `sellerId==${uid}`;
    const effectiveFilters =
      buildSieveFilters(["", sellerFilter], ["", filters]) || sellerFilter;

    const [
      payoutResult,
      completedPayouts,
      pendingPayouts,
      processingPayouts,
      earnings,
    ] = await Promise.all([
      payoutRepository.list({
        filters: effectiveFilters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      }),
      payoutRepository.findBySellerAndStatus(uid, "completed"),
      payoutRepository.findBySellerAndStatus(uid, "pending"),
      payoutRepository.findBySellerAndStatus(uid, "processing"),
      computeSellerEarnings(uid),
    ]);

    const totalPaidOut = completedPayouts.reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount =
      pendingPayouts.reduce((sum, p) => sum + p.amount, 0) +
      processingPayouts.reduce((sum, p) => sum + p.amount, 0);

    const hasPendingPayout =
      pendingPayouts.length + processingPayouts.length > 0;

    return successResponse({
      payouts: payoutResult.items,
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
      meta: {
        total: payoutResult.total,
        page: payoutResult.page,
        pageSize: payoutResult.pageSize,
        totalPages: payoutResult.totalPages,
        hasMore: payoutResult.hasMore,
      },
    });
  },
});
