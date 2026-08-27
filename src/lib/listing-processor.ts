/**
 * Shared helper for calling the listingProcessor Firebase Function.
 *
 * Uses the gateway when FIREBASE_FUNCTION_GATEWAY_URL is set, otherwise
 * falls back to the direct FIREBASE_FUNCTION_LISTING_URL. Returns `null`
 * when neither is configured so the caller can fall through to the local
 * repository.
 */

import { normalizeError, productRepository } from "@mohasinac/appkit";
import type {
  PublicProductExecutor,
  PublicProductQuery,
} from "@mohasinac/appkit/server";
import { callFirebaseFunction } from "@/lib/firebase-gateway";
import { logError } from "@/lib/logger";

export interface ListingProcessorResponse {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  cursor: string | null;
}

export interface ListingProcessorArgs {
  filters: string;
  sorts: string;
  page: number;
  pageSize: number;
  cursor: string | null;
  /**
   * Options handed to the collection's lister, beyond the Sieve model.
   *
   * `search` is the important one and was missing: Sieve has no array-contains
   * operator (`SIEVE_OP` tops out at `@=`), so a token search can NEVER travel
   * in the `f=` filter string — it has to come through here. The repositories
   * already implement it; this type was the only thing preventing any caller
   * from reaching it, which is why token search was dead code.
   */
  baseOpts?: {
    status?: string;
    storeId?: string;
    categoriesIn?: string[];
    /** Free-text query, tokenized server-side into an array-contains clause. */
    search?: string;
    /** stores: restrict to active+public (defaults true in the lister). */
    activeOnly?: boolean;
    /** eventEntries: required by that lister. */
    eventId?: string;
  };
}

export type ListingProcessorCollection =
  // NOTE: these must match `LISTERS` keys in
  // appkit/src/_internal/server/jobs/core/listingProcessor.ts exactly — the
  // Function 400s on an unknown collection. "blog" used to be listed here and
  // is not a registered lister; the real key is "blogPosts".
  | "products"
  | "blogPosts"
  | "events"
  | "stores"
  | "coupons"
  | "faqs"
  | "reviews"
  | "orders"
  | "bids"
  | "payouts"
  | "categories"
  | "brands"
  | "scammers"
  | "notifications"
  | "users";

export async function callListingProcessor(
  collection: ListingProcessorCollection,
  args: ListingProcessorArgs,
): Promise<ListingProcessorResponse | null> {
  return callFirebaseFunction<ListingProcessorResponse>("listingProcessor", {
    collection,
    f: args.filters,
    s: args.sorts,
    p: args.page,
    ps: args.pageSize,
    cursor: args.cursor ?? undefined,
    baseOpts: args.baseOpts,
  });
}

/**
 * Prefer the colocated `listingProcessor` Firebase Function (cheaper data
 * locality); fall back to the local repository if it is unconfigured OR fails
 * (cold-start crash, 401 from a secret-binding regression, network blip) so the
 * route stays available. Both share the same Sieve filter logic, so results are
 * semantically identical — only the locality differs.
 *
 * This executor is the seam that lets `listPublicProducts` live in appkit while
 * the Function-vs-repository preference (which needs consumer env) stays here.
 *
 * It lives in this lib rather than inside one route because THREE routes need
 * it. `/api/admin/products` and `/api/store/products` were calling
 * `listPublicProducts` with no executor at all, so the two heaviest endpoints in
 * the app — both running `ANY_STATUS` queries — executed inside the Vercel
 * function against the 10s ceiling, while `/api/products` delegated. Copying the
 * executor into each route would have been three copies of a fallback that has
 * already drifted once.
 */
export const listingProcessorFirstExecutor: PublicProductExecutor = async (
  query: PublicProductQuery,
) => {
  let upstream: ListingProcessorResponse | null = null;
  try {
    upstream = await callListingProcessor("products", {
      filters: query.filters,
      sorts: query.sorts,
      page: query.page,
      pageSize: query.pageSize,
      cursor: query.cursor ?? null,
      // searchTxt matching is `array-contains`, which Sieve cannot express, so
      // it rides outside `filters`. The Function's products lister forwards
      // opts wholesale to productRepository.list, so this is all it takes —
      // but omitting it loses the search term with no error on either side.
      baseOpts: query.search ? { search: query.search } : undefined,
    });
  } catch (upstreamErr) {
    void normalizeError(upstreamErr);
    logError(
      "products",
      "listingProcessor upstream failed - falling back to local repo",
      upstreamErr,
    );
    upstream = null;
  }

  if (upstream) {
    return {
      items: upstream.items,
      total: upstream.total,
      page: upstream.page,
      totalPages: upstream.totalPages,
      hasMore: upstream.hasMore,
      cursor: upstream.cursor,
    };
  }

  // The fallback must search identically to the upstream it replaces, or a
  // Function cold-start silently downgrades search to "return everything".
  const result = await productRepository.list(
    {
      filters: query.filters,
      sorts: query.sorts,
      page: query.page,
      pageSize: query.pageSize,
    },
    query.search ? { search: query.search } : undefined,
  );
  return {
    items: result.items,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    hasMore: result.hasMore,
    cursor: null,
  };
};
