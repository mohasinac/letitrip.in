"use server";

/**
 * Product Server Actions � Query
 *
 * Read-only actions for product data, replacing the former
 * productService ? apiClient ? API route chain (5 hops ? 2 hops).
 * Mutations (create/update/delete) are in admin.actions.ts.
 */

import { productRepository } from "@/repositories";
import type { ProductDocument } from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@mohasinac/appkit/providers/db-firebase";

export interface ProductListParams {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
  isAuction?: boolean;
  isPreOrder?: boolean;
  featured?: boolean;
  sellerId?: string;
  categoriesIn?: string[];
}

export type ProductListResult = FirebaseSieveResult<ProductDocument>;

export async function listProductsAction(
  params: ProductListParams = {},
): Promise<ProductListResult> {
  const {
    filters,
    sorts = "-createdAt",
    page = 1,
    pageSize = 20,
    isAuction,
    isPreOrder,
    featured,
    sellerId,
    categoriesIn,
  } = params;

  const compoundFilters: string[] = [];
  if (isAuction !== undefined) compoundFilters.push(`isAuction==${isAuction}`);
  if (isPreOrder !== undefined)
    compoundFilters.push(`isPreOrder==${isPreOrder}`);
  if (featured === true) compoundFilters.push("featured==true");
  if (sellerId) compoundFilters.push(`sellerId==${sellerId}`);
  if (filters) compoundFilters.push(filters);
  const mergedFilters =
    compoundFilters.length > 0 ? compoundFilters.join(",") : undefined;

  const sieve: SieveModel = {
    filters: mergedFilters,
    sorts,
    page,
    pageSize,
  };

  return productRepository.list(sieve, { categoriesIn });
}

export async function getProductByIdAction(
  id: string,
): Promise<ProductDocument | null> {
  return productRepository.findById(id);
}

export async function getFeaturedProductsAction(
  pageSize = 8,
): Promise<ProductListResult> {
  return productRepository.list({
    filters: "featured==true,status==published",
    sorts: "-createdAt",
    page: 1,
    pageSize,
  });
}

export async function getFeaturedAuctionsAction(
  pageSize = 6,
): Promise<ProductListResult> {
  return productRepository.list({
    filters: "isAuction==true,status==published",
    sorts: "auctionEndDate",
    page: 1,
    pageSize,
  });
}

export async function getLatestProductsAction(
  pageSize = 12,
): Promise<ProductListResult> {
  return productRepository.list({
    filters: "status==published",
    sorts: "-createdAt",
    page: 1,
    pageSize,
  });
}

export async function getLatestAuctionsAction(
  pageSize = 12,
): Promise<ProductListResult> {
  return productRepository.list({
    filters: "isAuction==true,status==published",
    sorts: "-createdAt",
    page: 1,
    pageSize,
  });
}

export async function listAuctionsAction(
  params: ProductListParams = {},
): Promise<ProductListResult> {
  const { filters, sorts = "auctionEndDate", page = 1, pageSize = 20 } = params;
  const base = "isAuction==true,status==published";
  return productRepository.list({
    filters: filters ? `${base},${filters}` : base,
    sorts,
    page,
    pageSize,
  });
}

export async function getFeaturedPreOrdersAction(
  pageSize = 6,
): Promise<ProductListResult> {
  return productRepository.list({
    filters: "isPreOrder==true,status==published",
    sorts: "preOrderDeliveryDate",
    page: 1,
    pageSize,
  });
}

export async function getLatestPreOrdersAction(
  pageSize = 12,
): Promise<ProductListResult> {
  return productRepository.list({
    filters: "isPreOrder==true,status==published",
    sorts: "-createdAt",
    page: 1,
    pageSize,
  });
}

export async function listPreOrdersAction(
  params: ProductListParams = {},
): Promise<ProductListResult> {
  const {
    filters,
    sorts = "preOrderDeliveryDate",
    page = 1,
    pageSize = 20,
  } = params;
  const base = "isPreOrder==true,status==published";
  return productRepository.list({
    filters: filters ? `${base},${filters}` : base,
    sorts,
    page,
    pageSize,
  });
}

export async function getRelatedProductsAction(
  categoryId: string,
  excludeId: string,
  limit = 6,
): Promise<ProductListResult> {
  const result = await productRepository.list({
    filters: `categoryId==${categoryId},status==published`,
    sorts: "-createdAt",
    page: 1,
    pageSize: limit + 1,
  });
  // Exclude the current product from related results
  return {
    ...result,
    items: result.items.filter((p) => p.id !== excludeId).slice(0, limit),
  };
}

export async function getSellerStorefrontProductsAction(
  sellerId: string,
): Promise<ProductDocument[]> {
  const products = await productRepository.findBySeller(sellerId);
  return products.filter((p) => p.status === "published");
}

