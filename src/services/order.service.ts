/**
 * Order Service
 * Pure async functions for user and admin order API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const orderService = {
  /** List the current user's orders */
  list: (params?: string) =>
    apiClient.get(`${API_ENDPOINTS.ORDERS.LIST}${params ? `?${params}` : ""}`),

  /** Get a single order by ID */
  getById: (id: string) => apiClient.get(API_ENDPOINTS.ORDERS.GET_BY_ID(id)),

  /** Get live tracking info for an order */
  track: (id: string) => apiClient.get(API_ENDPOINTS.ORDERS.TRACK(id)),

  /** Cancel an order */
  cancel: (id: string) => apiClient.post(API_ENDPOINTS.ORDERS.CANCEL(id), {}),
};
