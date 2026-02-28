/**
 * FAQ Service
 * Pure async functions for FAQ API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const faqService = {
  /** List FAQs with optional Sieve filters/pagination */
  list: (params?: string) =>
    apiClient.get(`${API_ENDPOINTS.FAQS.LIST}${params ? `?${params}` : ""}`),

  /** List public FAQs for the homepage FAQ section */
  listPublic: (category?: string, limit = 8) =>
    apiClient.get(
      `${API_ENDPOINTS.FAQS.LIST}?filters=isActive==true${category ? `,category==${category}` : ""}&sorts=order&pageSize=${limit}`,
    ),

  /** Get a single FAQ by ID */
  getById: (id: string) => apiClient.get(API_ENDPOINTS.FAQS.GET_BY_ID(id)),

  /** Create a new FAQ (admin only) */
  create: (data: unknown) => apiClient.post(API_ENDPOINTS.FAQS.CREATE, data),

  /** Update an FAQ (admin only) */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.FAQS.UPDATE(id), data),

  /** Delete an FAQ (admin only) */
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.FAQS.DELETE(id)),

  /** Vote an FAQ as helpful or not */
  vote: (id: string, data: { vote: "helpful" | "not-helpful" }) =>
    apiClient.post(API_ENDPOINTS.FAQS.VOTE(id), data),
};
