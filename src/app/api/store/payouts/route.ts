import { withProviders } from "@/providers.config";
/**
 * Seller Payouts API
 *
 * GET /api/store/payouts — List authenticated seller's payouts + earnings summary
 *
 * Mutations use Server Action: requestPayoutAction.
 */

import { successResponse } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { buildSieveFilters, sortBy, sieveAnd, sieveFilter, SIEVE_OP, COMMON_FIELDS, ORDER_FIELDS } from "@mohasinac/appkit";
import { orderRepository, payoutRepository } from "@mohasinac/appkit";
import { DEFAULT_PLATFORM_FEE_RATE } from "@mohasinac/appkit";
import { PayoutStatusValues } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

// --- Helper ---------------------------------------------------------------

async function computeSellerEarnings(storeId: string) {
  const eligibleOrdersResult = await orderRepository.listAll({
    filters: sieveAnd(sieveFilter(ORDER_FIELDS.STORE_ID, SIEVE_OP.EQ, storeId), sieveFilter(ORDER_FIELDS.STATUS, SIEVE_OP.EQ, "delivered"), sieveFilter(ORDER_FIELDS.PAYOUT_STATUS, SIEVE_OP.EQ, "eligible")),
    sorts: sortBy(ORDER_FIELDS.ORDER_DATE),
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

// --- GET — List payouts + earnings summary ---------------------------------

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ request, user }) => {
    const uid = user!.uid;
    const store = await storeRepository.findByOwnerId(uid);
    if (!store) {
      return successResponse({
        payouts: [],
        summary: { availableEarnings: 0, grossEarnings: 0, platformFee: 0, totalPaidOut: 0, pendingAmount: 0, hasPendingPayout: false },
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0, hasMore: false },
      });
    }
    const storeId = store.id;

    const searchParams = getSearchParams(request);
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 20, {
      min: 1,
      max: 50,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || sortBy(COMMON_FIELDS.CREATED_AT);
    const storeFilter = `storeId==${storeId}`;
    const effectiveFilters =
      buildSieveFilters(["", storeFilter], ["", filters]) || storeFilter;

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
      payoutRepository.findByStoreAndStatus(storeId, PayoutStatusValues.COMPLETED),
      payoutRepository.findByStoreAndStatus(storeId, PayoutStatusValues.PENDING),
      payoutRepository.findByStoreAndStatus(storeId, PayoutStatusValues.PROCESSING),
      computeSellerEarnings(storeId),
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
}));

