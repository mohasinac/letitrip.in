/**
 * Newsletter Service
 * Pure async functions for newsletter subscription API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const newsletterService = {
  /** Subscribe an email to the newsletter */
  subscribe: (data: { email: string; name?: string }) =>
    apiClient.post(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, data),

  /** Admin: list all subscribers */
  list: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.ADMIN.NEWSLETTER}${params ? `?${params}` : ""}`,
    ),

  /** Admin: get subscriber by ID */
  getById: (id: string) =>
    apiClient.get(API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID(id)),

  /** Admin: update subscriber */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID(id), data),

  /** Admin: delete subscriber */
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID(id)),
};
