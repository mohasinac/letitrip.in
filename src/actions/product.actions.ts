"use server";

/**
 * Product Server Actions -- thin entrypoints.
 * Business logic lives in @mohasinac/appkit/features/products/actions.
 */

import {
  listProducts,
  getProductById,
  getFeaturedProducts,
  getFeaturedAuctions,
  getLatestProducts,
  getLatestAuctions,
  listAuctions,
  getFeaturedPreOrders,
  getLatestPreOrders,
  listPreOrders,
  getRelatedProducts,
  getSellerStorefrontProducts,
  type ProductListActionParams,
} from "@mohasinac/appkit";
import type { ProductDocument } from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";

export type ProductListResult = FirebaseSieveResult<ProductDocument>;

export async function listProductsAction(
  params: ProductListActionParams = {},
): Promise<ProductListResult> {
  return listProducts(params);
}

export async function getProductByIdAction(
  id: string,
): Promise<ProductDocument | null> {
  return getProductById(id);
}

export async function getFeaturedProductsAction(
  pageSize = 8,
): Promise<ProductListResult> {
  return getFeaturedProducts(pageSize);
}

export async function getFeaturedAuctionsAction(
  pageSize = 6,
): Promise<ProductListResult> {
  return getFeaturedAuctions(pageSize);
}

export async function getLatestProductsAction(
  pageSize = 12,
): Promise<ProductListResult> {
  return getLatestProducts(pageSize);
}

export async function getLatestAuctionsAction(
  pageSize = 12,
): Promise<ProductListResult> {
  return getLatestAuctions(pageSize);
}

export async function listAuctionsAction(
  params: ProductListActionParams = {},
): Promise<ProductListResult> {
  return listAuctions(params);
}

export async function getFeaturedPreOrdersAction(
  pageSize = 6,
): Promise<ProductListResult> {
  return getFeaturedPreOrders(pageSize);
}

export async function getLatestPreOrdersAction(
  pageSize = 12,
): Promise<ProductListResult> {
  return getLatestPreOrders(pageSize);
}

export async function listPreOrdersAction(
  params: ProductListActionParams = {},
): Promise<ProductListResult> {
  return listPreOrders(params);
}

export async function getRelatedProductsAction(
  categoryId: string,
  excludeId: string,
  limit = 6,
): Promise<ProductListResult> {
  return getRelatedProducts(categoryId, excludeId, limit);
}

export async function getSellerStorefrontProductsAction(
  sellerId: string,
): Promise<ProductDocument[]> {
  return getSellerStorefrontProducts(sellerId);
}
