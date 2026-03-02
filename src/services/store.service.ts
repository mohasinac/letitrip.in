import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const storeService = {
  /**
   * List all seller stores (paginated, searchable).
   * @param params URLSearchParams string, e.g. "page=1&pageSize=24&q=trek"
   */
  listStores: (params?: string) =>
    apiClient.get(`${API_ENDPOINTS.STORES.LIST}${params ? `?${params}` : ""}`),

  /**
   * Get a single store by its storeSlug.
   */
  getBySlug: (storeSlug: string) =>
    apiClient.get(API_ENDPOINTS.STORES.GET_BY_SLUG(storeSlug)),

  /**
   * Get published products for a store.
   * @param params URLSearchParams string, e.g. "page=1&pageSize=24&sorts=-createdAt"
   */
  getProducts: (storeSlug: string, params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.STORES.PRODUCTS(storeSlug)}${params ? `?${params}` : ""}`,
    ),

  /**
   * Get published auction listings for a store.
   * @param params URLSearchParams string, e.g. "page=1&pageSize=24"
   */
  getAuctions: (storeSlug: string, params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.STORES.AUCTIONS(storeSlug)}${params ? `?${params}` : ""}`,
    ),

  /**
   * Get aggregated approved reviews for a store.
   */
  getReviews: (storeSlug: string) =>
    apiClient.get(API_ENDPOINTS.STORES.REVIEWS(storeSlug)),
};
