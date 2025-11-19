import { apiService } from "./api.service";
import type {
  SearchResultFE,
  SearchFiltersFE,
} from "@/types/frontend/search.types";

class SearchService {
  // Global search across products, shops, and categories
  async search(filters: SearchFiltersFE): Promise<SearchResultFE> {
    const params = new URLSearchParams();
    params.append("q", filters.q);
    if (filters.type) params.append("type", filters.type);
    if (filters.limit) params.append("limit", filters.limit.toString());

    return apiService.get<SearchResultFE>(`/search?${params.toString()}`);
  }

  // Quick search for autocomplete (limited results)
  async quickSearch(query: string): Promise<SearchResultFE> {
    return this.search({ q: query, limit: 5 });
  }
}

export const searchService = new SearchService();
