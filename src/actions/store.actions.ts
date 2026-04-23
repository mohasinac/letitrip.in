"use server";

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
): Promise<FirebaseSieveResult<StoreDocument>> {
  return listStores(params) as Promise<FirebaseSieveResult<StoreDocument>>;
}

export async function getStoreBySlugAction(
  storeSlug: string,
): Promise<StoreDocument | null> {
  return getStoreBySlug(storeSlug) as Promise<StoreDocument | null>;
}

export async function getStoreProductsAction(
  storeSlug: string,
  params: StoreContentParams = {},
): Promise<FirebaseSieveResult<ProductDocument>> {
  return getStoreProducts(storeSlug, params) as Promise<FirebaseSieveResult<ProductDocument>>;
}

export async function getStoreAuctionsAction(
  storeSlug: string,
  params: StoreContentParams = {},
): Promise<FirebaseSieveResult<ProductDocument>> {
  return getStoreAuctions(storeSlug, params) as Promise<FirebaseSieveResult<ProductDocument>>;
}

export async function getStoreReviewsAction(
  storeSlug: string,
): Promise<StoreReviewsResult> {
  return getStoreReviews(storeSlug) as Promise<StoreReviewsResult>;
}

