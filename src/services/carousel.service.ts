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

  /** Create a new carousel slide (admin only) */
  create: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.CAROUSEL.CREATE, data),

  /** Update a carousel slide (admin only) */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.CAROUSEL.UPDATE(id), data),

  /** Delete a carousel slide (admin only) */
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.CAROUSEL.DELETE(id)),

  /** Reorder carousel slides (admin only) */
  reorder: (data: { orderedIds: string[] }) =>
    apiClient.post(API_ENDPOINTS.CAROUSEL.REORDER, data),
};
