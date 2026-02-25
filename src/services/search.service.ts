/**
 * Search Service
 * Pure async function for Algolia-backed product search.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const searchService = {
  /** Full-text product search with filters */
  query: (params: string) =>
    apiClient.get(`${API_ENDPOINTS.SEARCH.QUERY}?${params}`),
};
