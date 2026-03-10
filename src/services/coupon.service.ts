/**
 * Coupon Service
 * Pure async functions for coupon/promo-code API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const couponService = {
  /** List coupons with optional Sieve params (admin only) */
  list: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.COUPONS}${sieveQuery ?? ""}`),
};
// Mutations (create/update/delete) replaced by Server Actions in @/actions/admin-coupon.actions.ts
