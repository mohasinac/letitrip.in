import { logServiceError } from "@/lib/error-logger";
import type {
  SearchFiltersFE,
  SearchResultFE,
} from "@/types/frontend/search.types";
import { apiService } from "./api.service";

class SearchService {
  // Global search across products, shops, and categories
  async search(filters: SearchFiltersFE): Promise<SearchResultFE> {
    try {
      // BUG FIX: Validate query parameter
      if (!filters.q || filters.q.trim() === "") {
        return {
          products: [],
          shops: [],
          categories: [],
        };
      }

      const params = new URLSearchParams();
      params.append("q", filters.q.trim());
      if (filters.type) params.append("type", filters.type);
      if (filters.limit && filters.limit > 0) {
        params.append("limit", filters.limit.toString());
      }

      const result = await apiService.get<SearchResultFE>(
        `/search?${params.toString()}`
      );

      // BUG FIX: Handle null/undefined results
      return {
        products: result?.products || [],
        shops: result?.shops || [],
        categories: result?.categories || [],
      };
    } catch (error) {
      logServiceError("SearchService", "search", error as Error);
      // Return empty results on error instead of throwing
      return {
        products: [],
        shops: [],
        categories: [],
      };
    }
  }

  // Quick search for autocomplete (limited results)
  async quickSearch(query: string): Promise<SearchResultFE> {
    return this.search({ q: query, limit: 5 });
  }
}

export const searchService = new SearchService();
