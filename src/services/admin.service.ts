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

  /** DELETE — revoke (terminate) a session by ID (admin) */
  revokeSession: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.REVOKE_SESSION(id)),

  /** POST — revoke all sessions for a specific user (admin) */
  revokeUserSessions: (userId: string) =>
    apiClient.post(API_ENDPOINTS.ADMIN.REVOKE_USER_SESSIONS, { userId }),

  /** GET — list all orders with optional Sieve query string (admin) */
  listOrders: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.ORDERS}${sieveQuery ?? ""}`),

  /** PATCH — update order status/tracking (admin) */
  updateOrder: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.ORDER_BY_ID(id), data),

  /** GET — analytics data (revenue + orders charts, top products) */
  getAnalytics: () => apiClient.get(API_ENDPOINTS.ADMIN.ANALYTICS),

  /** GET — list all users with optional Sieve query string */
  listUsers: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}${sieveQuery ?? ""}`),

  /** PATCH — update a user (role, status, etc.) */
  updateUser: (uid: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.USER_BY_ID(uid), data),

  /** DELETE — delete a user account */
  deleteUser: (uid: string) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.USER_BY_ID(uid)),

  /** GET — list all bids with optional Sieve query string */
  listBids: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.BIDS}${sieveQuery ?? ""}`),

  /** GET — list blog posts (admin: all statuses) */
  listBlog: (query?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.BLOG}${query ?? ""}`),

  /** POST — create a blog post */
  createBlogPost: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.ADMIN.BLOG, data),

  /** PATCH — update a blog post */
  updateBlogPost: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.BLOG_BY_ID(id), data),

  /** DELETE — delete a blog post */
  deleteBlogPost: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.BLOG_BY_ID(id)),

  /** GET — list payouts */
  listPayouts: (query?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.PAYOUTS}${query ?? ""}`),

  /** PATCH — update payout status */
  updatePayout: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.PAYOUT_BY_ID(id), data),

  /** GET — list all products (admin, unrestricted by seller) */
  listAdminProducts: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}${sieveQuery ?? ""}`),

  /** POST — create a product (admin) */
  createAdminProduct: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.ADMIN.PRODUCTS, data),

  /** PATCH — update any product (admin) */
  updateAdminProduct: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.PRODUCT_BY_ID(id), data),

  /** DELETE — delete any product (admin) */
  deleteAdminProduct: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.PRODUCT_BY_ID(id)),

  /** GET — paginated list of all sellers with store data (admin) */
  listStores: (query?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.STORES}${query ?? ""}`),

  /** PATCH — approve or reject a seller store */
  updateStoreStatus: (uid: string, action: "approve" | "reject") =>
    apiClient.patch(API_ENDPOINTS.ADMIN.STORE_BY_UID(uid), { action }),
};
