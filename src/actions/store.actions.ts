"use server";

/**
 * Store Server Actions — thin entrypoint
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
} from "@mohasinac/appkit/features/stores";
import type {
  StoreListParams,
  StoreContentParams,
  StoreReviewsResult,
} from "@mohasinac/appkit/features/stores";
import type { StoreDocument } from "@/db/schema/stores";
import type { ProductDocument } from "@/db/schema/products";
import type { FirebaseSieveResult } from "@mohasinac/appkit/providers/db-firebase";

export type { StoreListParams, StoreContentParams, StoreReviewsResult };

export async function listStoresAction(
  params: StoreListParams = {},
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

