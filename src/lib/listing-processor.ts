/**
 * Shared helper for calling the listingProcessor Firebase Function.
 *
 * Uses the gateway when FIREBASE_FUNCTION_GATEWAY_URL is set, otherwise
 * falls back to the direct FIREBASE_FUNCTION_LISTING_URL. Returns `null`
 * when neither is configured so the caller can fall through to the local
 * repository.
 */

import { callFirebaseFunction } from "@/lib/firebase-gateway";

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
