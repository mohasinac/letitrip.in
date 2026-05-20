/**
 * Shared helper for calling the listingProcessor Firebase Function.
 *
 * When FIREBASE_FUNCTION_LISTING_URL + LETITRIP_INTERNAL_SECRET are set,
 * the function is used for listing queries (better read performance, cursor
 * pagination). When either env var is absent the caller falls through to the
 * local repository (dev workflow and staging without the Function deployed).
 */

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
  baseOpts?: { status?: string; storeId?: string; categoriesIn?: string[] };
}

/**
 * Call the listingProcessor Firebase Function.
 *
 * Returns `null` when the function is not configured (no env vars) so the
 * caller can fall through to the local repository query.
 *
 * Throws on HTTP errors so callers can decide whether to surface them or
 * swallow and fall back — wrap in try/catch accordingly.
 */
export async function callListingProcessor(
  collection: "products",
  args: ListingProcessorArgs,
): Promise<ListingProcessorResponse | null> {
  const url = process.env.FIREBASE_FUNCTION_LISTING_URL;
  const secret = process.env.LETITRIP_INTERNAL_SECRET;
  if (!url || !secret) return null;

  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": secret,
    },
    body: JSON.stringify({
      collection,
      f: args.filters,
      s: args.sorts,
      p: args.page,
      ps: args.pageSize,
      cursor: args.cursor ?? undefined,
      baseOpts: args.baseOpts,
    }),
  });

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    const err = new Error(`listingProcessor returned ${upstream.status}: ${body}`);
    logError("callListingProcessor", err.message, err);
    throw err;
  }

  return (await upstream.json()) as ListingProcessorResponse;
}
