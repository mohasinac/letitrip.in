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
import type {
  ProductDocument,
  CategoryDocument,
  StoreDocument,
} from "@/db/schema";
import { AppError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";

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
    throw new AppError(
      500,
      ERROR_MESSAGES.GENERIC.SERVER_CONFIG_ERROR,
      "ALGOLIA_CONFIG_ERROR",
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
  slug?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  currency: string;
  mainImage: string;
  images: string[];
  tags: string[];
  sellerId: string;
  storeId?: string;
  sellerName: string;
  status: string;
  condition?: string;

  // Stock
  stockQuantity: number;
  availableQuantity: number;

  // Auction fields
  isAuction: boolean;
  currentBid?: number;
  startingBid?: number;
  bidCount?: number;
  buyNowPrice?: number;
  auctionEndDate?: number;

  // Pre-order fields
  isPreOrder: boolean;
  preOrderDeliveryDate?: number;
  preOrderCurrentCount?: number;
  preOrderMaxQuantity?: number;
  preOrderProductionStatus?: string;

  // Offers
  allowOffers: boolean;
  minOfferPercent?: number;

  // Promotion
  featured: boolean;
  isPromoted: boolean;
  promotionEndDate?: number;

  // Analytics
  avgRating: number;
  reviewCount: number;
  viewCount: number;

  /** Unix epoch ms for numeric range filters */
  createdAt: number;
  updatedAt: number;
}

// ── Serialisation ─────────────────────────────────────────────────────────────

/**
 * Converts a Firestore `ProductDocument` to a flat Algolia record.
 * Dates are serialised to epoch ms for Algolia numeric filtering.
 */
function toEpoch(date: unknown): number {
  if (date instanceof Date) return date.getTime();
  if (typeof date === "number") return date;
  if (typeof date === "string") return new Date(date).getTime();
  return 0;
}

export function productToAlgoliaRecord(
  product: ProductDocument,
): AlgoliaProductRecord {
  return {
    objectID: product.id,
    title: product.title,
    description: product.description,
    slug: product.slug,
    category: product.category,
    subcategory: product.subcategory,
    brand: product.brand,
    price: product.price,
    currency: product.currency,
    mainImage: product.mainImage,
    images: product.images ?? [],
    tags: product.tags ?? [],
    sellerId: product.sellerId,
    storeId: product.storeId,
    sellerName: product.sellerName,
    status: product.status,
    condition: product.condition,

    stockQuantity: product.stockQuantity ?? 0,
    availableQuantity: product.availableQuantity ?? 0,

    isAuction: product.isAuction ?? false,
    currentBid: product.currentBid,
    startingBid: product.startingBid,
    bidCount: product.bidCount,
    buyNowPrice: product.buyNowPrice,
    auctionEndDate: product.auctionEndDate
      ? toEpoch(product.auctionEndDate)
      : undefined,

    isPreOrder: product.isPreOrder ?? false,
    preOrderDeliveryDate: product.preOrderDeliveryDate
      ? toEpoch(product.preOrderDeliveryDate)
      : undefined,
    preOrderCurrentCount: product.preOrderCurrentCount,
    preOrderMaxQuantity: product.preOrderMaxQuantity,
    preOrderProductionStatus: product.preOrderProductionStatus,

    allowOffers: product.allowOffers ?? false,
    minOfferPercent: product.minOfferPercent,

    featured: product.featured,
    isPromoted: product.isPromoted ?? false,
    promotionEndDate: product.promotionEndDate
      ? toEpoch(product.promotionEndDate)
      : undefined,

    avgRating: product.avgRating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    viewCount: product.viewCount ?? 0,

    createdAt: toEpoch(product.createdAt),
    updatedAt: toEpoch(product.updatedAt),
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

/**
 * Clears ALL objects from the given Algolia index without deleting
 * the index itself (settings and configuration are preserved).
 *
 * @param indexName - The Algolia index to clear
 */
export async function clearAlgoliaIndex(
  indexName: string,
): Promise<{ cleared: true }> {
  const client = getAlgoliaAdminClient();
  await client.clearObjects({ indexName });
  return { cleared: true };
}

// ── Navigation / pages index ──────────────────────────────────────────────────

export const ALGOLIA_PAGES_INDEX_NAME =
  process.env.NEXT_PUBLIC_ALGOLIA_PAGES_INDEX_NAME ?? "pages_nav";

/** Record shape for the `pages_nav` navigation-suggestions index */
export interface AlgoliaNavRecord {
  /** URL path, e.g. "/blog/my-post" — used as objectID */
  objectID: string;
  title: string;
  subtitle?: string;
  type: "page" | "category" | "blog" | "event";
  url: string;
  image?: string;
  /** Higher = ranked earlier in suggestions */
  priority: number;
}

/**
 * Bulk-saves navigation page records to the `pages_nav` Algolia index.
 * Server-side only — uses the admin client.
 */
export async function indexNavPages(
  records: AlgoliaNavRecord[],
): Promise<{ indexed: number }> {
  const client = getAlgoliaAdminClient();
  await client.saveObjects({
    indexName: ALGOLIA_PAGES_INDEX_NAME,
    objects: records as unknown as Record<string, unknown>[],
  });
  return { indexed: records.length };
}

// ── Categories index ──────────────────────────────────────────────────────────

export const ALGOLIA_CATEGORIES_INDEX_NAME =
  process.env.ALGOLIA_CATEGORIES_INDEX_NAME ?? "categories";

export interface AlgoliaCategoryRecord {
  objectID: string;
  name: string;
  slug: string;
  description?: string;
  tier: number;
  path: string;
  parentIds: string[];
  rootId: string;
  isLeaf: boolean;
  isBrand: boolean;
  isFeatured: boolean;
  featuredPriority?: number;
  icon?: string;
  coverImage?: string;
  productCount: number;
  totalProductCount: number;
  auctionCount: number;
  totalItemCount: number;
  avgRating?: number;
  createdAt: number;
  updatedAt: number;
}

export function categoryToAlgoliaRecord(
  category: CategoryDocument,
): AlgoliaCategoryRecord {
  return {
    objectID: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    tier: category.tier,
    path: category.path,
    parentIds: category.parentIds,
    rootId: category.rootId,
    isLeaf: category.isLeaf,
    isBrand: category.isBrand ?? false,
    isFeatured: category.isFeatured,
    featuredPriority: category.featuredPriority,
    icon: category.display?.icon,
    coverImage: category.display?.coverImage,
    productCount: category.metrics?.productCount ?? 0,
    totalProductCount: category.metrics?.totalProductCount ?? 0,
    auctionCount: category.metrics?.auctionCount ?? 0,
    totalItemCount: category.metrics?.totalItemCount ?? 0,
    avgRating: (category.metrics as unknown as Record<string, unknown>)
      ?.avgRating as number | undefined,
    createdAt: toEpoch(category.createdAt),
    updatedAt: toEpoch(category.updatedAt),
  };
}

export async function indexCategories(
  categories: CategoryDocument[],
): Promise<{ indexed: number }> {
  const client = getAlgoliaAdminClient();
  const objects = categories.map(categoryToAlgoliaRecord) as unknown as Record<
    string,
    unknown
  >[];
  await client.saveObjects({
    indexName: ALGOLIA_CATEGORIES_INDEX_NAME,
    objects,
  });
  return { indexed: objects.length };
}

export async function deleteCategoryFromIndex(
  categoryId: string,
): Promise<void> {
  const client = getAlgoliaAdminClient();
  await client.deleteObject({
    indexName: ALGOLIA_CATEGORIES_INDEX_NAME,
    objectID: categoryId,
  });
}

// ── Stores index ──────────────────────────────────────────────────────────────

export const ALGOLIA_STORES_INDEX_NAME =
  process.env.ALGOLIA_STORES_INDEX_NAME ?? "stores";

export interface AlgoliaStoreRecord {
  objectID: string;
  storeSlug: string;
  storeName: string;
  storeDescription?: string;
  storeCategory?: string;
  storeLogoURL?: string;
  storeBannerURL?: string;
  ownerId: string;
  status: string;
  isPublic: boolean;
  isVacationMode: boolean;
  location?: string;
  totalProducts: number;
  itemsSold: number;
  totalReviews: number;
  averageRating: number;
  createdAt: number;
  updatedAt: number;
}

export function storeToAlgoliaRecord(store: StoreDocument): AlgoliaStoreRecord {
  return {
    objectID: store.id,
    storeSlug: store.storeSlug,
    storeName: store.storeName,
    storeDescription: store.storeDescription,
    storeCategory: store.storeCategory,
    storeLogoURL: store.storeLogoURL,
    storeBannerURL: store.storeBannerURL,
    ownerId: store.ownerId,
    status: store.status,
    isPublic: store.isPublic,
    isVacationMode: store.isVacationMode ?? false,
    location: store.location,
    totalProducts: store.stats?.totalProducts ?? 0,
    itemsSold: store.stats?.itemsSold ?? 0,
    totalReviews: store.stats?.totalReviews ?? 0,
    averageRating: store.stats?.averageRating ?? 0,
    createdAt: toEpoch(store.createdAt),
    updatedAt: toEpoch(store.updatedAt),
  };
}

export async function indexStores(
  stores: StoreDocument[],
): Promise<{ indexed: number }> {
  const client = getAlgoliaAdminClient();
  const objects = stores.map(storeToAlgoliaRecord) as unknown as Record<
    string,
    unknown
  >[];
  await client.saveObjects({ indexName: ALGOLIA_STORES_INDEX_NAME, objects });
  return { indexed: objects.length };
}

export async function deleteStoreFromIndex(storeId: string): Promise<void> {
  const client = getAlgoliaAdminClient();
  await client.deleteObject({
    indexName: ALGOLIA_STORES_INDEX_NAME,
    objectID: storeId,
  });
}

// ── Browser-safe search client (uses NEXT_PUBLIC_* keys) ─────────────────────

const _publicAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "";
const _searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ?? "";

export function isAlgoliaBrowserConfigured(): boolean {
  return Boolean(_publicAppId && _searchKey);
}

let _browserClient: ReturnType<typeof algoliasearch> | null = null;

function getAlgoliaBrowserClient(): ReturnType<typeof algoliasearch> | null {
  if (!isAlgoliaBrowserConfigured()) return null;
  if (!_browserClient) {
    _browserClient = algoliasearch(_publicAppId, _searchKey);
  }
  return _browserClient;
}

/**
 * Browser-safe: searches the `pages_nav` Algolia index for navigation
 * suggestions. Returns an empty array when Algolia is not configured.
 *
 * @param query - The user's search query
 * @param limit - Maximum number of suggestions to return (default 6)
 */
export async function searchNavPages(
  query: string,
  limit = 6,
): Promise<AlgoliaNavRecord[]> {
  const client = getAlgoliaBrowserClient();
  if (!client || !query.trim()) return [];
  const result = await client.searchSingleIndex<AlgoliaNavRecord>({
    indexName: ALGOLIA_PAGES_INDEX_NAME,
    searchParams: { query, hitsPerPage: limit },
  });
  return result.hits;
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface AlgoliaSearchParams {
  q: string;
  category?: string | null;
  subcategory?: string | null;
  minPrice?: number;
  maxPrice?: number;
  condition?: string | null;
  isAuction?: boolean | null;
  isPreOrder?: boolean | null;
  inStock?: boolean | null;
  minRating?: number;
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
    subcategory,
    minPrice = 0,
    maxPrice = 0,
    condition,
    isAuction,
    isPreOrder,
    inStock,
    minRating = 0,
    page = 1,
    pageSize = 20,
  } = params;

  // Numeric filters (price range, rating, stock)
  const numericFilters: string[] = [];
  if (minPrice > 0) numericFilters.push(`price >= ${minPrice}`);
  if (maxPrice > 0 && maxPrice >= minPrice)
    numericFilters.push(`price <= ${maxPrice}`);
  if (minRating > 0) numericFilters.push(`avgRating >= ${minRating}`);
  if (inStock === true) numericFilters.push(`availableQuantity > 0`);

  // Facet filters (category + always restrict to published)
  const facetFilters: string[][] = [["status:published"]];
  if (category) facetFilters.push([`category:${category}`]);
  if (subcategory) facetFilters.push([`subcategory:${subcategory}`]);
  if (condition) facetFilters.push([`condition:${condition}`]);
  if (isAuction === true) facetFilters.push(["isAuction:true"]);
  if (isAuction === false) facetFilters.push(["isAuction:false"]);
  if (isPreOrder === true) facetFilters.push(["isPreOrder:true"]);
  if (isPreOrder === false) facetFilters.push(["isPreOrder:false"]);

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
