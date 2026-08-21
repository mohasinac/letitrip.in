import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, ApiErrors, sortBy, sieveFilter, sieveAnd, SIEVE_OP, BID_FIELDS, PRODUCT_FIELDS, COMMON_FIELDS } from "@mohasinac/appkit";
import { bidRepository, productRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_READ } from "@/constants";

// Sort fields SellerBidsView is allowed to request — the sortable subset of
// BidRepository.SIEVE_FIELDS. Anything else falls back to the default rather
// than reaching orderBy() unvalidated.
const VALID_SORT_FIELDS = new Set<string>([
  BID_FIELDS.BID_DATE,
  BID_FIELDS.BID_AMOUNT,
  BID_FIELDS.STATUS,
  BID_FIELDS.USER_NAME,
]);

const __GET__g = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_READ],
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId") ?? undefined;
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));

    // SellerBidsView renders a status chip group, a sort dropdown and a bidder
    // search box, and this handler read none of the three — all three controls
    // were inert. `status` and `userName` are both in BidRepository.SIEVE_FIELDS.
    const filtersParam = url.searchParams.get("filters") ?? undefined;
    const statusParam = filtersParam?.match(/status==([\w-]+)/)?.[1];
    const statusClause = statusParam
      ? sieveFilter(BID_FIELDS.STATUS, SIEVE_OP.EQ, statusParam)
      : undefined;

    const sortParam = url.searchParams.get("sorts") ?? undefined;
    const sortField = sortParam?.replace(/^-/, "");
    const sorts =
      sortField && VALID_SORT_FIELDS.has(sortField)
        ? sortParam!
        : sortBy(BID_FIELDS.BID_DATE);

    // Bidder-name search. `@=` is prefix-only against Firestore (see the
    // incompatibility notes at the head of providers/db-firebase/sieve.ts), so
    // this matches from the start of the name rather than mid-string.
    const q = (url.searchParams.get("q") || "").trim();
    const qClause = q
      ? sieveFilter(BID_FIELDS.USER_NAME, SIEVE_OP.STARTS, q)
      : undefined;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    if (productId) {
      // Verify the product belongs to this store
      const product = await productRepository.findById(productId);
      if (!product || product.storeId !== store.id) {
        return ApiErrors.forbidden("Product does not belong to your store");
      }
      const result = await bidRepository.list({
        filters: sieveAnd(
          sieveFilter(BID_FIELDS.PRODUCT_ID, SIEVE_OP.EQ, productId),
          statusClause,
        qClause,
        ),
        sorts,
        page,
        pageSize,
      });
      return successResponse({ bids: result.items, total: result.total, productId });
    }

    // Get store's auction product IDs (up to 30 for Firestore `in` query limit)
    const auctionResult = await productRepository.list(
      { filters: sieveAnd(sieveFilter(PRODUCT_FIELDS.STORE_ID, SIEVE_OP.EQ, store.id), sieveFilter(PRODUCT_FIELDS.LISTING_TYPE, SIEVE_OP.EQ, "auction")), sorts: sortBy(COMMON_FIELDS.CREATED_AT), page: 1, pageSize: 30 },
      { storeId: store.id },
    );

    if (auctionResult.items.length === 0) {
      return successResponse({ bids: [], total: 0, auctions: [] });
    }

    const productIds = auctionResult.items.map((p) => p.id);
    const auctionSummary = auctionResult.items.map((p) => ({
      id: p.id,
      title: p.title ?? p.id,
    }));

    // The pipe-joined productId group is a single-field OR, which the enhanced
    // Firebase adapter upgrades to a Firestore `in` query. AND-ing the status /
    // search clauses onto it keeps that upgrade intact.
    const result = await bidRepository.list({
      filters: sieveAnd(
        productIds.map((id) => `productId==${id}`).join("|"),
        statusClause,
        qClause,
      ),
      sorts,
      page,
      pageSize,
    });

    return successResponse({
      bids: result.items,
      total: result.total,
      auctions: auctionSummary,
    });
  },
}));

export const GET = withFeatureGuard("AUCTIONS", __GET__g);
