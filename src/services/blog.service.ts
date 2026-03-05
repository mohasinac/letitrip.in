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
  /** Get featured posts for homepage (up to `count` posts, newest first) */
  getFeatured: (count = 4) =>
    apiClient.get(
      `${API_ENDPOINTS.BLOG.LIST}?featured=true&pageSize=${count}&sorts=-publishedAt`,
    ),
  /** Latest published blog posts (for homepage fallback) */
  getLatest: (count = 4) =>
    apiClient.get(
      `${API_ENDPOINTS.BLOG.LIST}?pageSize=${count}&sorts=-publishedAt`,
    ),

  /** Get a single post by its slug */
  getBySlug: (slug: string) =>
    apiClient.get(API_ENDPOINTS.BLOG.GET_BY_SLUG(slug)),
};
