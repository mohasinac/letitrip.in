"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Store Server Actions â€” thin entrypoint
 *
 * Delegates entirely to appkit store query actions.
 * No auth required for read-only public queries.
 */

import {
  listStores,
  getStoreBySlug,
  getStoreProducts,
  getStoreAuctions,
  getStoreReviews,
  type StoreQueryListParams,
  type StoreContentParams,
  type StoreReviewsResult,
} from "@mohasinac/appkit";
import type { StoreDocument } from "@mohasinac/appkit";
import type { ProductDocument } from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";


export async function listStoresAction(
  params: StoreQueryListParams = {},
): Promise<ActionResult<FirebaseSieveResult<StoreDocument>>> {
  return wrapAction(async () => {
    return listStores(params) as Promise<FirebaseSieveResult<StoreDocument>>;
  });
}

export async function getStoreBySlugAction(
  storeSlug: string,
): Promise<ActionResult<StoreDocument | null>> {
  return wrapAction(async () => {
    return getStoreBySlug(storeSlug) as Promise<StoreDocument | null>;
  });
}

export async function getStoreProductsAction(
  storeSlug: string,
  params: StoreContentParams = {},
): Promise<ActionResult<FirebaseSieveResult<ProductDocument>>> {
  return wrapAction(async () => {
    return getStoreProducts(storeSlug, params) as Promise<FirebaseSieveResult<ProductDocument>>;
  });
}

export async function getStoreAuctionsAction(
  storeSlug: string,
  params: StoreContentParams = {},
): Promise<ActionResult<FirebaseSieveResult<ProductDocument>>> {
  return wrapAction(async () => {
    return getStoreAuctions(storeSlug, params) as Promise<FirebaseSieveResult<ProductDocument>>;
  });
}

export async function getStoreReviewsAction(
  storeSlug: string,
): Promise<ActionResult<StoreReviewsResult>> {
  return wrapAction(async () => {
    return getStoreReviews(storeSlug) as Promise<StoreReviewsResult>;
  });
}

