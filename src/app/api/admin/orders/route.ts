import { withProviders } from "@/providers.config";
/**
 * Admin Orders API Route
 * GET  /api/admin/orders — List all orders with pagination & filtering
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { orderRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { sortBy, ORDER_FIELDS, isPaymentReviewQueueMode } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";
import { mergeOrderScopeFilter } from "@mohasinac/appkit";

const DEFAULT_SORTS = sortBy(ORDER_FIELDS.CREATED_AT);

/**
 * GET /api/admin/orders
 *
 * Query params:
 *  - filters       (string) — Sieve filters (e.g. status==pending)
 *  - sorts         (string) — Sieve sorts (e.g. -createdAt)
 *  - page          (number) — page number (default 1)
 *  - pageSize      (number) — results per page (default 50)
 *  - paymentReview (string) — "awaiting_proof" | "awaiting_verification".
 *      Switches to the manual-payment review queue instead of the generic
 *      Sieve listing. Not expressible as a Sieve filter: both modes hinge on
 *      the *absence* of a field (`paymentProofUrl` / `paymentReviewOutcome`),
 *      and a Firestore `!= null` clause silently drops every document where
 *      the field was never written — see `listPaymentReviewQueue`.
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 50,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
    const paymentReview = getStringParam(searchParams, "paymentReview");

    const searchTerm = getStringParam(searchParams, "q")?.trim() || undefined;

    serverLogger.info("Admin orders list requested", {
      filters,
      sorts,
      page,
      pageSize,
      paymentReview,
    });

    const sieveResult =
      paymentReview && isPaymentReviewQueueMode(paymentReview)
        ? await orderRepository.listPaymentReviewQueue(paymentReview, { page, pageSize })
        : await orderRepository.listAll(
            {
              filters,
              sorts,
              page,
              pageSize,
            },
            // Token search rides OUTSIDE `filters` — array-contains is not
            // expressible in Sieve. Fed by product/store/tracking only; the
            // three ORDER_PII_FIELDS never reach searchTxt (D1).
            searchTerm ? { search: searchTerm } : undefined,
          );

    return successResponse({
      orders: sieveResult.items,
      meta: {
        total: sieveResult.total,
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        totalPages: sieveResult.totalPages,
      },
    });
  },
}));

