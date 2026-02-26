/**
 * Blog Service
 * Pure async functions for blog post API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const blogService = {
  /** List published blog posts with optional pagination/category params */
  list: (params?: string) =>
    apiClient.get(`${API_ENDPOINTS.BLOG.LIST}${params ? `?${params}` : ""}`),

  /** Get a single post by its slug */
  getBySlug: (slug: string) =>
    apiClient.get(API_ENDPOINTS.BLOG.GET_BY_SLUG(slug)),
};
