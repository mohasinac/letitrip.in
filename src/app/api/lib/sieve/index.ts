/**
 * Sieve Pagination & Filtering Library
 * Epic: E026 - Sieve-style Pagination
 *
 * A Sieve-inspired pagination and filtering system for Next.js + Firestore.
 *
 * Usage in API routes:
 * ```typescript
 * import { parseSieveQuery, getSieveConfig } from '@/lib/sieve';
 *
 * export async function GET(request: Request) {
 *   const { searchParams } = new URL(request.url);
 *   const config = getSieveConfig('products');
 *   const { query, errors } = parseSieveQuery(searchParams, config);
 *
 *   // Use query.filters, query.sorts, query.page, query.pageSize
 * }
 * ```
 *
 * Query Format:
 * - Pagination: ?page=1&pageSize=20
 * - Sorting: ?sorts=-createdAt,price
 * - Filtering: ?filters=status==published,price>100
 */

// Types
export type {
  FilterOperator,
  FilterValue,
  SortDirection,
  FilterCondition,
  SortField,
  SieveQuery,
  FilterableField,
  SieveConfig,
  SievePaginationMeta,
  SieveAppliedMeta,
  SievePaginatedResponse,
  SieveError,
  SieveParseResult,
  FirestoreOperator,
  FirestoreFilter,
  ClientSideFilter,
  FirestoreAdapterResult,
} from "./types";

// Parser
export {
  parseSieveQuery,
  buildSieveQueryString,
  mergeSieveQuery,
  createDefaultSieveQuery,
  parseSieveFromURL,
  updateURLWithSieve,
} from "./parser";

// Operators
export {
  evaluateFilter,
  evaluateFilters,
  getNestedValue,
  getOperatorDescription,
  isFirestoreSupported,
  getOperatorsForType,
} from "./operators";

// Firestore Adapter
export {
  adaptToFirestore,
  executeSieveQuery,
  applySieveToQuery,
  postProcessResults,
  getCollectionRef,
  createEmptyResponse,
  createPaginationMeta,
} from "./firestore";

// Configurations
export {
  productsSieveConfig,
  auctionsSieveConfig,
  ordersSieveConfig,
  usersSieveConfig,
  shopsSieveConfig,
  reviewsSieveConfig,
  categoriesSieveConfig,
  couponsSieveConfig,
  returnsSieveConfig,
  ticketsSieveConfig,
  blogSieveConfig,
  heroSlidesSieveConfig,
  payoutsSieveConfig,
  favoritesSieveConfig,
  notificationsSieveConfig,
  getSieveConfig,
  getAllSieveConfigs,
} from "./config";
