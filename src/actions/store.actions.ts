"use server";

/**
 * Store Server Actions — Query
 *
 * Read-only actions for store data, replacing the former
 * storeService → apiClient → API route chain (5 hops → 2 hops).
 */

import {
  storeRepository,
  productRepository,
  reviewRepository,
} from "@/repositories";
import { NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import type { StoreDocument } from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@/lib/query";

export interface StoreListParams {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
  q?: string;
}

export async function listStoresAction(
  params: StoreListParams = {},
): Promise<FirebaseSieveResult<StoreDocument>> {
  const { filters, sorts = "-createdAt", page = 1, pageSize = 24, q } = params;

  const model: SieveModel = {
    filters,
    sorts,
    page,
    pageSize,
  };

  const filtersArr: string[] = [];
  if (q) filtersArr.push(`storeName_=${q}`);
  if (filters) filtersArr.push(filters);
  model.filters = filtersArr.join(",") || undefined;

  return storeRepository.listStores(model);
}

export async function getStoreBySlugAction(
  storeSlug: string,
): Promise<StoreDocument | null> {
  return storeRepository.findBySlug(storeSlug);
}

export interface StoreContentParams {
  sorts?: string;
  page?: number;
  pageSize?: number;
  filters?: string;
}

export async function getStoreProductsAction(
  storeSlug: string,
  params: StoreContentParams = {},
): Promise<FirebaseSieveResult<import("@/db/schema").ProductDocument>> {
  const { sorts = "-createdAt", page = 1, pageSize = 24, filters } = params;

  const storeDoc = await storeRepository.findBySlug(storeSlug);
  if (!storeDoc || storeDoc.status !== "active" || !storeDoc.isPublic) {
    throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
  }

  const filtersArr = [
    `sellerId==${storeDoc.ownerId}`,
    "status==published",
    "isAuction==false",
  ];
  if (filters) filtersArr.push(filters);

  return productRepository.list({
    filters: filtersArr.join(","),
    sorts,
    page,
    pageSize,
  });
}

export async function getStoreAuctionsAction(
  storeSlug: string,
  params: StoreContentParams = {},
): Promise<FirebaseSieveResult<import("@/db/schema").ProductDocument>> {
  const { sorts = "auctionEndDate", page = 1, pageSize = 24, filters } = params;

  const storeDoc = await storeRepository.findBySlug(storeSlug);
  if (!storeDoc || storeDoc.status !== "active" || !storeDoc.isPublic) {
    throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
  }

  const filtersArr = [
    `sellerId==${storeDoc.ownerId}`,
    "status==published",
    "isAuction==true",
  ];
  if (filters) filtersArr.push(filters);

  return productRepository.list({
    filters: filtersArr.join(","),
    sorts,
    page,
    pageSize,
  });
}

export interface StoreReviewsResult {
  reviews: import("@/db/schema").ReviewDocument[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export async function getStoreReviewsAction(
  storeSlug: string,
): Promise<StoreReviewsResult> {
  const storeDoc = await storeRepository.findBySlug(storeSlug);
  if (!storeDoc || storeDoc.status !== "active" || !storeDoc.isPublic) {
    throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
  }

  const allProducts = await productRepository.findBySeller(storeDoc.ownerId);
  const publishedProducts = allProducts
    .filter((p) => p.status === "published")
    .slice(0, 20);

  const reviewArrays = await Promise.all(
    publishedProducts.map((p) => reviewRepository.findApprovedByProduct(p.id)),
  );

  const allReviews = reviewArrays
    .flat()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  const ratingDistribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let ratingSum = 0;

  for (const reviews of reviewArrays) {
    for (const r of reviews) {
      const rating = Math.round(r.rating);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating] = (ratingDistribution[rating] ?? 0) + 1;
        ratingSum += r.rating;
      }
    }
  }

  const totalReviews = reviewArrays.flat().length;
  const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

  return {
    reviews: allReviews,
    averageRating,
    totalReviews,
    ratingDistribution,
  };
}
