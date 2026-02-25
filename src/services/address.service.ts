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

  /** Create a new address */
  create: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.ADDRESSES.CREATE, data),

  /** Update an address */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADDRESSES.UPDATE(id), data),

  /** Delete an address */
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.ADDRESSES.DELETE(id)),

  /** Set an address as the default */
  setDefault: (id: string) =>
    apiClient.post(API_ENDPOINTS.ADDRESSES.SET_DEFAULT(id), {}),
};
