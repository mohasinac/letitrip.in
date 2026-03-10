/**
 * Bid Service
 * Pure async functions for auction bid API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const bidService = {
  /** List bids for a product (with optional Sieve params) */
  listByProduct: (productId: string, params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.BIDS.LIST}?productId=${encodeURIComponent(productId)}${params ? `&${params}` : ""}`,
    ),

  /** Get a single bid by ID */
  getById: (id: string) => apiClient.get(API_ENDPOINTS.BIDS.GET_BY_ID(id)),
};
// Mutation (create/place bid) replaced by Server Action in @/actions/bid.actions.ts
