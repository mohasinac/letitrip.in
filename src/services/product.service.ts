/**
 * Product Service
 * Pure async functions for all product-related API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const productService = {
  /** List products with optional Sieve filter/sort/pagination query string */
  list: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}${params ? `?${params}` : ""}`,
    ),

  /** Fetch a single product by ID */
  getById: (id: string) => apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)),

  /** Homepage featured products (featured==true, sorted by newest, 8 items) */
  getFeatured: () =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=featured==true&sorts=-createdAt&pageSize=8`,
    ),

  /** Homepage featured auctions (type==auction, active, sorted by end date) */
  getFeaturedAuctions: () =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=type==auction,status==published&sorts=auctionEndDate&pageSize=6`,
    ),

  /** Latest published products (sorted by newest, for homepage fallback) */
  getLatest: (pageSize = 12) =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}?status=published&sorts=-createdAt&pageSize=${pageSize}`,
    ),

  /** Latest published auctions (for homepage fallback) */
  getLatestAuctions: (pageSize = 12) =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}?isAuction=true&status=published&sorts=-createdAt&pageSize=${pageSize}`,
    ),

  /** List live auctions with optional Sieve filter/sort/pagination query string */
  listAuctions: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}${params ? `?${params}` : "?filters=isAuction==true,status==published&sorts=auctionEndDate"}`,
    ),

  /** Homepage featured pre-orders (active, sorted by delivery date) */
  getFeaturedPreOrders: () =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=isPreOrder==true,status==published&sorts=preOrderDeliveryDate&pageSize=6`,
    ),

  /** Latest published pre-orders (for homepage fallback) */
  getLatestPreOrders: (pageSize = 12) =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}?isPreOrder=true&status=published&sorts=-createdAt&pageSize=${pageSize}`,
    ),

  /** List live pre-orders with optional Sieve filter/sort/pagination query string */
  listPreOrders: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}${params ? `?${params}` : "?filters=isPreOrder==true,status==published&sorts=preOrderDeliveryDate"}`,
    ),

  /** Related products by category, excluding a given product ID */
  getRelated: (categoryId: string, excludeId: string, limit = 6) =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=categoryId==${categoryId},status==published&sorts=-createdAt&pageSize=${limit}&exclude=${excludeId}`,
    ),

  /** Products for a specific seller (for storefront page) */
  getBySeller: (sellerId: string, pageSize = 12) =>
    apiClient.get(API_ENDPOINTS.PROFILE.GET_STOREFRONT_PRODUCTS(sellerId)),

  /** Create a new product */
  create: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data),

  /** Update an existing product */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.PRODUCTS.UPDATE(id), data),

  /** Delete a product */
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id)),
};
