/**
 * Algolia Search Integration
 *
 * Provides server-side Algolia client for indexing and searching products.
 * All functions guard against missing env vars and throw clearly.
 *
 * Required environment variables:
 *   ALGOLIA_APP_ID               - Algolia application ID
 *   ALGOLIA_ADMIN_API_KEY        - Admin API key (server only, never expose to client)
 *   NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY - Read-only search key (used on client)
 *   ALGOLIA_INDEX_NAME / NEXT_PUBLIC_ALGOLIA_INDEX_NAME - Index name (default "products")
 *
 * @module lib/search/algolia
 */

import { algoliasearch } from "algoliasearch";
import type { ProductDocument } from "@/db/schema";

// ── Env var resolution ───────────────────────────────────────────────────────

const ALGOLIA_APP_ID =
  process.env.ALGOLIA_APP_ID ?? process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "";
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY ?? "";
export const ALGOLIA_INDEX_NAME =
  process.env.ALGOLIA_INDEX_NAME ??
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ??
  "products";

// ── Config check ─────────────────────────────────────────────────────────────

/**
 * Returns true when the minimum required env vars are present.
 * Both `ALGOLIA_APP_ID` AND `ALGOLIA_ADMIN_API_KEY` must be set for
 * server-side indexing and search to work.
 */
export function isAlgoliaConfigured(): boolean {
  return Boolean(ALGOLIA_APP_ID && ALGOLIA_ADMIN_KEY);
}

// ── Singleton admin client ────────────────────────────────────────────────────

let _adminClient: ReturnType<typeof algoliasearch> | null = null;

/**
 * Returns a lazy-initialised Algolia admin client.
 * Safe to call multiple times — singleton is cached after first call.
 *
 * @throws {Error} When env vars are not configured
 */
export function getAlgoliaAdminClient(): ReturnType<typeof algoliasearch> {
  if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
    throw new Error(
      "Algolia is not configured. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY.",
    );
  }
  if (!_adminClient) {
    _adminClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  }
  return _adminClient;
}

// ── Record type ───────────────────────────────────────────────────────────────

export interface AlgoliaProductRecord {
  /** Algolia primary key — maps to ProductDocument.id */
  objectID: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  currency: string;
  mainImage: string;
  tags: string[];
  sellerId: string;
  sellerName: string;
  status: string;
  isAuction: boolean;
  currentBid?: number;
  startingBid?: number;
  featured: boolean;
  isPromoted: boolean;
  /** Unix epoch ms for numeric range filters */
  createdAt: number;
}

// ── Serialisation ─────────────────────────────────────────────────────────────

/**
 * Converts a Firestore `ProductDocument` to a flat Algolia record.
 * Dates are serialised to epoch ms for Algolia numeric filtering.
 */
export function productToAlgoliaRecord(
  product: ProductDocument,
): AlgoliaProductRecord {
  const rawDate = product.createdAt;
  const createdAt =
    rawDate instanceof Date
      ? rawDate.getTime()
      : new Date(rawDate as string | number).getTime();

  return {
    objectID: product.id,
    title: product.title,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    brand: product.brand,
    price: product.price,
    currency: product.currency,
    mainImage: product.mainImage,
    tags: product.tags ?? [],
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    status: product.status,
    isAuction: product.isAuction ?? false,
    currentBid: product.currentBid,
    startingBid: product.startingBid,
    featured: product.featured,
    isPromoted: product.isPromoted ?? false,
    createdAt,
  };
}

// ── Indexing helpers ──────────────────────────────────────────────────────────

/**
 * Bulk-saves an array of products to the Algolia index.
 * Uses `saveObjects` which creates or replaces each record.
 *
 * @param products - Array of Firestore ProductDocument objects
 * @returns Count of indexed records
 */
export async function indexProducts(
  products: ProductDocument[],
): Promise<{ indexed: number }> {
  const client = getAlgoliaAdminClient();
  const objects = products.map(productToAlgoliaRecord) as unknown as Record<
    string,
    unknown
  >[];
  await client.saveObjects({ indexName: ALGOLIA_INDEX_NAME, objects });
  return { indexed: objects.length };
}

/**
 * Removes a single product from the Algolia index.
 * Safe to call even if the objectID doesn't exist (Algolia is idempotent).
 *
 * @param productId - The product ID (objectID in Algolia)
 */
export async function deleteProductFromIndex(productId: string): Promise<void> {
  const client = getAlgoliaAdminClient();
  await client.deleteObject({
    indexName: ALGOLIA_INDEX_NAME,
    objectID: productId,
  });
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface AlgoliaSearchParams {
  q: string;
  category?: string | null;
  minPrice?: number;
  maxPrice?: number;
  /** Sieve-compatible sort string or Algolia replica index name, e.g. "-price" */
  sort?: string | null;
  page?: number;
  pageSize?: number;
}

export interface AlgoliaSearchResult {
  items: AlgoliaProductRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Executes a full-text search against the Algolia products index.
 * Automatically limits results to `status:published` products.
 *
 * @param params - Search parameters
 * @returns Paginated, normalised result set
 */
export async function algoliaSearch(
  params: AlgoliaSearchParams,
): Promise<AlgoliaSearchResult> {
  const client = getAlgoliaAdminClient();
  const {
    q,
    category,
    minPrice = 0,
    maxPrice = 0,
    page = 1,
    pageSize = 20,
  } = params;

  // Numeric filters (price range)
  const numericFilters: string[] = [];
  if (minPrice > 0) numericFilters.push(`price >= ${minPrice}`);
  if (maxPrice > 0 && maxPrice >= minPrice)
    numericFilters.push(`price <= ${maxPrice}`);

  // Facet filters (category + always restrict to published)
  const facetFilters: string[][] = [["status:published"]];
  if (category) facetFilters.push([`category:${category}`]);

  const response = await client.search({
    requests: [
      {
        indexName: ALGOLIA_INDEX_NAME,
        query: q,
        page: page - 1, // Algolia pages are 0-indexed
        hitsPerPage: pageSize,
        ...(numericFilters.length > 0 && { numericFilters }),
        ...(facetFilters.length > 0 && { facetFilters }),
      },
    ],
  });

  // `search` returns `SearchResponses` — cast to access typed hits
  const result = response.results[0] as {
    hits: AlgoliaProductRecord[];
    nbHits: number;
    page: number;
    nbPages: number;
    hitsPerPage: number;
  };

  return {
    items: result.hits,
    total: result.nbHits,
    page: result.page + 1, // Convert back to 1-indexed for our API
    pageSize: result.hitsPerPage,
    totalPages: result.nbPages,
    hasMore: result.page + 1 < result.nbPages,
  };
}
