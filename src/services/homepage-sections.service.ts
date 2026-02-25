/**
 * Homepage Sections Service
 * Pure async functions for homepage section API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const homepageSectionsService = {
  /** List all homepage sections (admin: all, public: enabled only) */
  list: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}${params ? `?${params}` : ""}`,
    ),

  /** List only enabled homepage sections (for public rendering) */
  listEnabled: () =>
    apiClient.get(`${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}?enabled=true`),

  /** Get a single section by ID */
  getById: (id: string) =>
    apiClient.get(API_ENDPOINTS.HOMEPAGE_SECTIONS.GET_BY_ID(id)),

  /** Create a new homepage section (admin only) */
  create: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.HOMEPAGE_SECTIONS.CREATE, data),

  /** Update a homepage section (admin only) */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.HOMEPAGE_SECTIONS.UPDATE(id), data),

  /** Delete a homepage section (admin only) */
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.HOMEPAGE_SECTIONS.DELETE(id)),

  /** Reorder homepage sections (admin only) */
  reorder: (data: { orderedIds: string[] }) =>
    apiClient.post(API_ENDPOINTS.HOMEPAGE_SECTIONS.REORDER, data),
};
