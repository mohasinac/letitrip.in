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

  /** Create a coupon (admin only) */
  create: (data: unknown) => apiClient.post(API_ENDPOINTS.ADMIN.COUPONS, data),

  /** Update a coupon by ID (admin only) */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.COUPON_BY_ID(id), data),

  /** Delete a coupon by ID (admin only) */
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.COUPON_BY_ID(id)),

  /** Validate a promo code at checkout */
  validate: (data: { code: string; orderTotal?: number }) =>
    apiClient.post(API_ENDPOINTS.COUPONS.VALIDATE, data),
};
