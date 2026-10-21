import { withProviders } from "@/providers.config";
/**
 * Admin Orders API Route
 * GET  /api/admin/orders — List all orders with pagination & filtering
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { orderRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { ORDER_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { isPaymentReviewQueueMode } from "@mohasinac/appkit/features/orders/constants/payment-window";
import { ROLES_ADMIN_MOD } from "@/constants";
import { mergeOrderScopeFilter } from "@mohasinac/appkit/features/orders/constants/order-scope";

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

    /*
     * 🛑 `maskedOrders`, never the raw rows.
     *
     * `OrderRepository.mapDoc` is deliberately NOT overridden, so `listAll`
     * returns the three `ORDER_PII_FIELDS` as stored `enc:v1:…` ciphertext.
     * This route returned them verbatim and `/admin/orders` rendered the
     * customer name and email as ciphertext — measured live at 3 visible
     * `enc:v1:` strings.
     *
     * Masked rather than revealed: this is a list, and an admin who needs the
     * real address opens the order. Applied to both branches, because the
     * payment-review queue carries the same fields.
     */
    const maskedItems = orderRepository.maskedOrders(
      sieveResult.items as Parameters<typeof orderRepository.maskedOrders>[0],
    );

    return successResponse({
      items: maskedItems,
      meta: {
        total: sieveResult.total,
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        totalPages: sieveResult.totalPages,
      },
    });
  },
}));

