/**
 * Wishlist Service
 * Pure async functions for user wishlist API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const wishlistService = {
  /** Get the current user's wishlist */
  list: () => apiClient.get(API_ENDPOINTS.USER.WISHLIST.LIST),
};
// Mutations (add, remove, check) replaced by Server Actions in @/actions/wishlist.actions.ts
