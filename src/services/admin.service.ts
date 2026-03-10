/**
 * Admin Service
 * Pure async functions for admin API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const adminService = {
  /** GET — fetch admin dashboard statistics */
  getDashboardStats: () => apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD),

  /** GET — list all sessions (admin) */
  listSessions: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.ADMIN.SESSIONS}${params ? `?${params}` : ""}`,
    ),

  /** GET — list all orders with optional Sieve query string (admin) */
  listOrders: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.ORDERS}${sieveQuery ?? ""}`),

  /** GET — analytics data (revenue + orders charts, top products) */
  getAnalytics: () => apiClient.get(API_ENDPOINTS.ADMIN.ANALYTICS),

  /** GET — list all users with optional Sieve query string */
  listUsers: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}${sieveQuery ?? ""}`),

  /** GET — list all bids with optional Sieve query string */
  listBids: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.BIDS}${sieveQuery ?? ""}`),

  /** GET — list blog posts (admin: all statuses) */
  listBlog: (query?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.BLOG}${query ?? ""}`),

  /** GET — list payouts */
  listPayouts: (query?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.PAYOUTS}${query ?? ""}`),

  /** GET — list all products (admin, unrestricted by seller) */
  listAdminProducts: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}${sieveQuery ?? ""}`),

  /** GET — paginated list of all sellers with store data (admin) */
  listStores: (query?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.STORES}${query ?? ""}`),

  /** POST — bulk re-index all published products into Algolia */
  algoliaSync: () => apiClient.post(API_ENDPOINTS.ADMIN.ALGOLIA_SYNC),

  /** POST — bulk index static pages/categories/blog/events into Algolia nav index */
  algoliaSyncPages: () =>
    apiClient.post(API_ENDPOINTS.ADMIN.ALGOLIA_SYNC_PAGES),

  /** POST — clear all records from the Algolia products index */
  algoliaClearProducts: () =>
    apiClient.post(API_ENDPOINTS.ADMIN.ALGOLIA_CLEAR_PRODUCTS),

  /** POST — clear all records from the Algolia pages_nav index */
  algoliaClearPages: () =>
    apiClient.post(API_ENDPOINTS.ADMIN.ALGOLIA_CLEAR_PAGES),
};
