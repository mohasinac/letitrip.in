/**
 * Category Service
 * Pure async functions for category API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const categoryService = {
  /** List categories with optional Sieve filters (returns tree by default) */
  list: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.CATEGORIES.LIST}${params ? `?${params}` : ""}`,
    ),

  /** List top-level (tier 0) categories for homepage display */
  listTopLevel: (limit = 12) =>
    apiClient.get(`${API_ENDPOINTS.CATEGORIES.LIST}?tier=0&pageSize=${limit}`),

  /** Get a single category by ID */
  getById: (id: string) =>
    apiClient.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id)),

  /** Create a new category (admin only) */
  create: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, data),

  /** Update a category (admin only) */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.CATEGORIES.UPDATE(id), data),

  /** Get a single category by slug (public) */
  getBySlug: (slug: string) =>
    apiClient.get(
      `${API_ENDPOINTS.CATEGORIES.LIST}?slug=${encodeURIComponent(slug)}`,
    ),

  /** Get direct children of a category */
  getChildren: (parentId: string) =>
    apiClient.get(
      `${API_ENDPOINTS.CATEGORIES.LIST}?parentId=${encodeURIComponent(parentId)}`,
    ),

  /** Delete a category (admin only) */
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id)),
};
