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

  /** Add a product to the wishlist */
  add: (productId: string) =>
    apiClient.post(API_ENDPOINTS.USER.WISHLIST.ADD, { productId }),

  /** Remove a product from the wishlist */
  remove: (productId: string) =>
    apiClient.delete(API_ENDPOINTS.USER.WISHLIST.REMOVE(productId)),

  /** Check if a specific product is in the wishlist */
  check: (productId: string) =>
    apiClient.get(API_ENDPOINTS.USER.WISHLIST.CHECK(productId)),
};
