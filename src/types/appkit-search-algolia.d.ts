declare module "@mohasinac/appkit/providers/search-algolia" {
  export interface AlgoliaIndexResult {
    indexed: number;
  }

  export interface AlgoliaClearResult {
    cleared: true;
  }

  export interface AlgoliaNavRecord {
    objectID: string;
    title: string;
    subtitle?: string;
    image?: string;
    type: string;
    url: string;
    priority?: number;
  }

  export interface AlgoliaSearchResult {
    items: Record<string, unknown>[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  }

  export function isAlgoliaConfigured(): boolean;
  export function algoliaSearch(
    params: Record<string, unknown>,
  ): Promise<AlgoliaSearchResult>;
  export function searchNavPages(
    query: string,
    limit?: number,
  ): Promise<AlgoliaNavRecord[]>;
  export function indexProducts(
    records: unknown[],
  ): Promise<AlgoliaIndexResult>;
  export function indexNavPages(
    records: AlgoliaNavRecord[],
  ): Promise<AlgoliaIndexResult>;
  export function indexCategories(
    records: unknown[],
  ): Promise<AlgoliaIndexResult>;
  export function indexStores(records: unknown[]): Promise<AlgoliaIndexResult>;
  export function clearAlgoliaIndex(
    indexName: string,
  ): Promise<AlgoliaClearResult>;

  export const ALGOLIA_INDEX_NAME: string;
  export const ALGOLIA_PAGES_INDEX_NAME: string;
  export const ALGOLIA_CATEGORIES_INDEX_NAME: string;
  export const ALGOLIA_STORES_INDEX_NAME: string;
}
