/**
 * Review Service
 * Pure async functions for review API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const reviewService = {
  /** List reviews for a product (pass productId as param) */
  list: (params?: string) =>
    apiClient.get(`${API_ENDPOINTS.REVIEWS.LIST}${params ? `?${params}` : ""}`),

  /** List all reviews (admin endpoint — all products and tenants) */
  listAdmin: (sieveQuery?: string) =>
    apiClient.get(`${API_ENDPOINTS.ADMIN.REVIEWS}${sieveQuery ?? ""}`),

  /** List reviews for a specific product ID */
  listByProduct: (productId: string, page = 1, pageSize = 10) =>
    apiClient.get(
      `${API_ENDPOINTS.REVIEWS.LIST}?productId=${productId}&page=${page}&pageSize=${pageSize}&sorts=-createdAt`,
    ),

  /** List reviews for a specific seller (for storefront) */
  listBySeller: (sellerId: string, page = 1, pageSize = 5) =>
    apiClient.get(API_ENDPOINTS.PROFILE.GET_SELLER_REVIEWS(sellerId)),

  /** Fetch homepage customer reviews (approved, latest) */
  getHomepageReviews: () =>
    apiClient.get(
      `${API_ENDPOINTS.REVIEWS.LIST}?filters=status==approved&sorts=-createdAt&pageSize=6`,
    ),

  /** Get a single review by ID */
  getById: (id: string) => apiClient.get(API_ENDPOINTS.REVIEWS.GET_BY_ID(id)),

  /** Create a new review */
  create: (data: unknown) => apiClient.post(API_ENDPOINTS.REVIEWS.CREATE, data),

  /** Update a review */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.REVIEWS.UPDATE(id), data),

  /** Delete a review */
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.REVIEWS.DELETE(id)),

  /** Vote a review as helpful or not */
  vote: (id: string, data: { helpful: boolean }) =>
    apiClient.post(API_ENDPOINTS.REVIEWS.VOTE(id), data),
};
