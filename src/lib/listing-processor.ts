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
  baseOpts?: { status?: string; storeId?: string; categoriesIn?: string[] };
}

export type ListingProcessorCollection =
  | "products"
  | "blog"
  | "events"
  | "stores"
  | "coupons";

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
