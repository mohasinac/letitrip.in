/**
 * Carousel Service
 * Pure async functions for carousel slide API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const carouselService = {
  /** List all carousel slides */
  list: () => apiClient.get(API_ENDPOINTS.CAROUSEL.LIST),

  /** List only active (published) carousel slides — used on the homepage */
  getActive: () => apiClient.get(`${API_ENDPOINTS.CAROUSEL.LIST}?active=true`),

  /** Get a single carousel slide by ID */
  getById: (id: string) => apiClient.get(API_ENDPOINTS.CAROUSEL.GET_BY_ID(id)),

  /** Reorder carousel slides (admin only) */
  reorder: (data: { orderedIds: string[] }) =>
    apiClient.post(API_ENDPOINTS.CAROUSEL.REORDER, data),
};
