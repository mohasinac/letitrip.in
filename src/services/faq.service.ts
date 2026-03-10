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
};
// Mutations (create/update/delete/vote) replaced by Server Actions in @/actions/faq.actions.ts
