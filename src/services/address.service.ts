/**
 * Address Service
 * Pure async functions for user address API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const addressService = {
  /** List user addresses */
  list: () => apiClient.get(API_ENDPOINTS.ADDRESSES.LIST),

  /** Get a single address by ID */
  getById: (id: string) => apiClient.get(API_ENDPOINTS.ADDRESSES.GET_BY_ID(id)),
};
// Mutations (create, update, delete, setDefault) replaced by Server Actions in @/actions/address.actions.ts
