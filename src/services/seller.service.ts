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

  /** Get the authenticated seller's store profile */
  getStore: () => apiClient.get(API_ENDPOINTS.SELLER.STORE),

  /** Create the seller's store for the first time (POST) */
  createStore: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.SELLER.STORE, data),

  /** Update the authenticated seller's store profile */
  updateStore: (data: unknown) =>
    apiClient.patch(API_ENDPOINTS.SELLER.STORE, data),

  // ── Shipping config ──────────────────────────────────────────────────────

  /** Get the authenticated seller's shipping configuration */
  getShipping: () => apiClient.get(API_ENDPOINTS.SELLER.SHIPPING),

  /** Update shipping config (custom or Shiprocket) */
  updateShipping: (data: unknown) =>
    apiClient.patch(API_ENDPOINTS.SELLER.SHIPPING, data),

  /** Verify Shiprocket pickup address OTP */
  verifyPickupOtp: (data: { otp: number; pickupLocationId: number }) =>
    apiClient.post(API_ENDPOINTS.SELLER.SHIPPING_VERIFY_PICKUP, data),

  // ── Payout settings ──────────────────────────────────────────────────────

  /** Get the authenticated seller's payout details (account number masked) */
  getPayoutSettings: () => apiClient.get(API_ENDPOINTS.SELLER.PAYOUT_SETTINGS),

  /** Save/update payout details (UPI or bank transfer) */
  updatePayoutSettings: (data: unknown) =>
    apiClient.patch(API_ENDPOINTS.SELLER.PAYOUT_SETTINGS, data),

  // ── Order actions ────────────────────────────────────────────────────────

  /** Ship an order (custom or Shiprocket) */
  shipOrder: (id: string, data: unknown) =>
    apiClient.post(API_ENDPOINTS.SELLER.ORDER_SHIP(id), data),

  /** Bulk actions on orders (e.g. request_payout) */
  bulkOrderAction: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.SELLER.ORDERS_BULK, data),
};
