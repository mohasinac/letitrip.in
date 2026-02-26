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
};
