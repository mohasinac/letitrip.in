/**
 * Promotions Service
 * Pure async functions for promotions/deals API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const promotionsService = {
  /** Get featured products, promoted products, and active coupons */
  list: () => apiClient.get(API_ENDPOINTS.PROMOTIONS.LIST),
};
