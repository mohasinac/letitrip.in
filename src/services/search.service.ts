import { apiService } from "./api.service";

interface SearchResult {
  products: any[];
  shops: any[];
  categories: any[];
  total: number;
}

interface SearchFilters {
  q: string;
  type?: "products" | "shops" | "categories" | "all";
  limit?: number;
}

class SearchService {
  // Global search across products, shops, and categories
  async search(filters: SearchFilters): Promise<SearchResult> {
    const params = new URLSearchParams();
    params.append("q", filters.q);
    if (filters.type) params.append("type", filters.type);
    if (filters.limit) params.append("limit", filters.limit.toString());

    return apiService.get<SearchResult>(`/search?${params.toString()}`);
  }

  // Quick search for autocomplete (limited results)
  async quickSearch(query: string): Promise<SearchResult> {
    return this.search({ q: query, limit: 5 });
  }
}

export const searchService = new SearchService();
export type { SearchResult, SearchFilters };
