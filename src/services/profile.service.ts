/**
 * Profile Service
 * Pure async functions for public profile API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const profileService = {
  /** Get a user's public profile by ID */
  getById: (userId: string) =>
    apiClient.get(API_ENDPOINTS.PROFILE.GET_BY_ID(userId)),

  /** Get seller reviews for a storefront page */
  getSellerReviews: (userId: string) =>
    apiClient.get(API_ENDPOINTS.PROFILE.GET_SELLER_REVIEWS(userId)),

  /** Get published products for a seller storefront */
  getSellerProducts: (userId: string) =>
    apiClient.get(API_ENDPOINTS.PROFILE.GET_STOREFRONT_PRODUCTS(userId)),
};
// Mutation (update profile) replaced by Server Action in @/actions/profile.actions.ts
