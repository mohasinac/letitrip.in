import { withProviders } from "@/providers.config";
import { BID_FIELDS, PRODUCT_FIELDS, COMMON_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { sieveFilter, sieveAnd, SIEVE_OP } from "@mohasinac/appkit/utils/sieve-builder";
import { bidRepository } from "@mohasinac/appkit/features/auctions/repository/bid.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
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

    /*
     * Bidder-name search, now a searchTxt token pushdown.
     *
     * 🛑 It was `userName@=`, and `@=` is a CASE-SENSITIVE prefix against
     * Firestore — the only prefix Firestore can do. So a seller typing "ravi"
     * did not find "Ravi", and "kumar" never found Ravi Kumar at all, while
     * the box read as a working search. `buildSearchTxt` normalises case and
     * indexes word prefixes, so the query and the index meet on TOKENS.
     *
     * It travels as an opt rather than a clause because `array-contains` is
     * not expressible in Sieve; `qClause` is gone for the same reason.
     */
    const q = (url.searchParams.get("q") || "").trim();
    const searchOpts = q ? { search: q } : undefined;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    if (productId) {
      // Verify the product belongs to this store
      const product = await productRepository.findById(productId);
      if (!product || product.storeId !== store.id) {
        return ApiErrors.forbidden("Product does not belong to your store");
      }
      const result = await bidRepository.list(
        {
          filters: sieveAnd(
            sieveFilter(BID_FIELDS.PRODUCT_ID, SIEVE_OP.EQ, productId),
            statusClause,
          ),
          sorts,
          page,
          pageSize,
        },
        searchOpts,
      );
      return successResponse({ items: result.items, total: result.total, productId });
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
    //
    // 🛑 THE FIELD NAME GOES ONCE, BEFORE THE `==`. NOT ONCE PER VALUE.
    //
    // This read `productIds.map((id) => `productId==${id}`).join("|")` until
    // 2026-10-02, which spells the field name into every value after the first.
    // Sieve parses `productId==a|productId==b` as ONE clause on `productId`
    // whose values are ["a", "productId==b"] — the field name lands INSIDE the
    // second value — so the `in` query looked for a bid whose productId is
    // literally the string "productId==b". Measured on production: the seller
    // saw zero of the 37 bids on their own auctions, with a 200 and an empty
    // list. `parseFilters('productId==a|b|c')` yields values ["a","b","c"],
    // which is what this now builds.
    //
    // Swept both repos for the same spelling: this was the only site.
    const result = await bidRepository.list(
      {
        filters: sieveAnd(
          sieveFilter(BID_FIELDS.PRODUCT_ID, SIEVE_OP.EQ, productIds.join("|")),
          statusClause,
        ),
        sorts,
        page,
        pageSize,
      },
      searchOpts,
    );

    return successResponse({
      items: result.items,
      total: result.total,
      auctions: auctionSummary,
    });
  },
}));

export const GET = __GET__g;
