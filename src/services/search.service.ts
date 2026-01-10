import { logServiceError } from "@/lib/error-logger";
import type {
  SearchFiltersFE,
  SearchResultFE,
} from "@/types/frontend/search.types";
import { apiService } from "./api.service";

class SearchService {
  // Global search across products, shops, and categories
  async search(filters: SearchFiltersFE): Promise<SearchResultFE> {
    // Validate query parameter (outside try-catch so validation errors are thrown)
    if (!filters.q || filters.q.trim() === "") {
      return {
        products: [],
        shops: [],
        categories: [],
        total: 0,
      };
    }

    const cleanQuery = filters.q.trim();

    // Validate query length to prevent DoS
    if (cleanQuery.length > 500) {
      throw new Error(
        "[Search] Query too long. Maximum 500 characters allowed."
      );
    }
    if (cleanQuery.length < 2) {
      throw new Error(
        "[Search] Query too short. Minimum 2 characters required."
      );
    }

    try {
      const params = new URLSearchParams();
      params.append("q", cleanQuery);
      if (filters.type) params.append("type", filters.type);
      if (filters.limit && filters.limit > 0) {
        // Cap limit at 100 to prevent performance issues
        const safeLimit = Math.min(filters.limit, 100);
        params.append("limit", safeLimit.toString());
      }

      const result = await apiService.get<SearchResultFE>(
        `/search?${params.toString()}`
      );

      // Handle null/undefined results
      return {
        products: result?.products || [],
        shops: result?.shops || [],
        categories: result?.categories || [],
        total: result?.total || 0,
      };
    } catch (error) {
      logServiceError("SearchService", "search", error as Error);
      // Return empty results on API error instead of throwing
      return {
        products: [],
        shops: [],
        categories: [],
        total: 0,
      };
    }
  }

  // Quick search for autocomplete (limited results)
  async quickSearch(query: string): Promise<SearchResultFE> {
    return this.search({ q: query, limit: 5 });
  }
}

export const searchService = new SearchService();
