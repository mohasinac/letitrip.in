/**
 * Seller Service
 * Pure async functions for seller-portal API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const sellerService = {
  /** List orders for the current seller with optional Sieve query string */
  listOrders: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.SELLER.ORDERS}${params ? `?${params}` : ""}`,
    ),

  /** Seller analytics stats */
  getAnalytics: () => apiClient.get(API_ENDPOINTS.SELLER.ANALYTICS),

  /** List seller payout requests */
  listPayouts: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.SELLER.PAYOUTS}${params ? `?${params}` : ""}`,
    ),

  /** Request a new payout */
  requestPayout: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.SELLER.PAYOUTS, data),

  /** List products owned by a specific seller (dashboard overview) */
  listProducts: (uid: string) =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}?filters=${encodeURIComponent(`sellerId==${uid}`)}&pageSize=200`,
    ),

  /** List seller's own products via seller API (paginated, Sieve) */
  listMyProducts: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.SELLER.PRODUCTS}${params ? `?${params}` : ""}`,
    ),

  /** Create a new product listing for the authenticated seller */
  createProduct: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.SELLER.PRODUCTS, data),
};
