/**
 * Cart Service
 * Read-only API calls for the shopping cart.
 * Mutations (add, update, remove, clear, merge) use Server Actions from `@/actions`.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const cartService = {
  /** Get the current user's cart */
  get: () => apiClient.get(API_ENDPOINTS.CART.GET),
};
