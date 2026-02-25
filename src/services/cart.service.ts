/**
 * Cart Service
 * Pure async functions for shopping cart API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const cartService = {
  /** Get the current user's cart */
  get: () => apiClient.get(API_ENDPOINTS.CART.GET),

  /** Add an item to the cart */
  addItem: (data: {
    productId: string;
    quantity: number;
    [key: string]: unknown;
  }) => apiClient.post(API_ENDPOINTS.CART.ADD_ITEM, data),

  /** Update an item's quantity in the cart */
  updateItem: (itemId: string, data: { quantity: number }) =>
    apiClient.patch(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), data),

  /** Remove an item from the cart */
  removeItem: (itemId: string) =>
    apiClient.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemId)),

  /** Clear the entire cart */
  clear: () => apiClient.delete(API_ENDPOINTS.CART.CLEAR),
};
