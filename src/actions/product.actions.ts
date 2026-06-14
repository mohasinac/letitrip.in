"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
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
  getStoreStorefrontProducts,
  type ProductListActionParams,
} from "@mohasinac/appkit";
import type { ProductDocument } from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";

export type ProductListResult = FirebaseSieveResult<ProductDocument>;

export async function listProductsAction(
  params: ProductListActionParams = {},
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return listProducts(params);
  });
}

export async function getProductByIdAction(
  id: string,
): Promise<ActionResult<ProductDocument | null>> {
  return wrapAction(async () => {
    return getProductById(id);
  });
}

export async function getFeaturedProductsAction(
  pageSize = 8,
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return getFeaturedProducts(pageSize);
  });
}

export async function getFeaturedAuctionsAction(
  pageSize = 6,
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return getFeaturedAuctions(pageSize);
  });
}

export async function getLatestProductsAction(
  pageSize = 12,
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return getLatestProducts(pageSize);
  });
}

export async function getLatestAuctionsAction(
  pageSize = 12,
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return getLatestAuctions(pageSize);
  });
}

export async function listAuctionsAction(
  params: ProductListActionParams = {},
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return listAuctions(params);
  });
}

export async function getFeaturedPreOrdersAction(
  pageSize = 6,
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return getFeaturedPreOrders(pageSize);
  });
}

export async function getLatestPreOrdersAction(
  pageSize = 12,
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return getLatestPreOrders(pageSize);
  });
}

export async function listPreOrdersAction(
  params: ProductListActionParams = {},
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return listPreOrders(params);
  });
}

export async function getRelatedProductsAction(
  categoryId: string,
  excludeId: string,
  limit = 6,
): Promise<ActionResult<ProductListResult>> {
  return wrapAction(async () => {
    return getRelatedProducts(categoryId, excludeId, limit);
  });
}

export async function getSellerStorefrontProductsAction(
  storeId: string,
): Promise<ActionResult<ProductDocument[]>> {
  return wrapAction(async () => {
    return getStoreStorefrontProducts(storeId);
  });
}
