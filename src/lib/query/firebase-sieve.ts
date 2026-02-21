/**
 * Firebase Sieve Query Builder
 *
 * Applies the @mohasinac/sievejs DSL (filters, sorts, page, pageSize) directly
 * to Firestore using the native Firebase adapter — pushing all query work to
 * the database instead of loading documents into memory first.
 *
 * This replaces the in-memory `applySieveToArray` helper for collection-level
 * list endpoints, making them scalable as data grows.
 *
 * --- Firebase adapter limitations ---
 * Supported natively:
 *   == != > < >= <=             → Firestore where()
 *   @= (contains)               → array-contains (for array fields)
 *   _= (startsWith)             → range query (>= value, <= value + "\uf8ff")
 *   sorts                       → orderBy()
 *   page / pageSize             → offset() + limit()
 *
 * NOT supported (fall back to applySieveToArray for these):
 *   _-= (endsWith), !@= !_= !_-=  — negated string operators
 *   @=* _=* ==* !=*               — case-insensitive operators
 *   (field1|field2)>10            — multi-field OR filters
 *   Full-text search              — use Algolia/Typesense for this
 *
 * @example
 * ```ts
 * // From a repository method:
 * async list(model: SieveModel) {
 *   return applySieveToFirestore<ProductDocument>({
 *     baseQuery: this.getCollection().where('status', '==', 'published'),
 *     model,
 *     fields: {
 *       title:     { canFilter: true, canSort: true },
 *       price:     { canFilter: true, canSort: true },
 *       createdAt: { canFilter: true, canSort: true },
 *     },
 *   });
 * }
 * // GET /api/products?sorts=-price&filters=price>=100&page=2&pageSize=20
 * ```
 */

import { SieveProcessorBase } from "@mohasinac/sievejs/services";
import { createFirebaseAdapter } from "@mohasinac/sievejs/adapters/firebase";
import type {
  CollectionReference,
  DocumentData,
  Query,
} from "firebase-admin/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Sieve field configuration — mirrors the SieveJS field config shape. */
export type FirebaseSieveFieldConfig = {
  /** Override the Firestore document field name. Defaults to the key name. */
  path?: string;
  /** Allow `filters=fieldName<operator><value>` on this field. */
  canFilter?: boolean;
  /** Allow `sorts=fieldName` or `sorts=-fieldName` on this field. */
  canSort?: boolean;
};

/** Field map for a collection, keyed by the public query-parameter name. */
export type FirebaseSieveFields = Record<string, FirebaseSieveFieldConfig>;

/** Sieve query model — parsed from HTTP query parameters. */
export interface SieveModel {
  /** Comma-delimited filter expressions, e.g. `status==published,price>=100` */
  filters?: string;
  /** Comma-delimited sort fields, `-` prefix = descending, e.g. `-createdAt,title` */
  sorts?: string;
  /** 1-based page number */
  page?: number | string;
  /** Number of items per page */
  pageSize?: number | string;
}

/** Processor options override. */
export interface FirebaseSieveOptions {
  caseSensitive?: boolean;
  defaultPageSize?: number;
  maxPageSize?: number;
  /** When true, unsupported operators throw instead of silently skipping. */
  throwExceptions?: boolean;
}

/** Paginated Firestore query result. */
export interface FirebaseSieveResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS: Required<FirebaseSieveOptions> = {
  caseSensitive: false,
  defaultPageSize: 20,
  maxPageSize: 100,
  throwExceptions: false,
};

// ─── Core helper ──────────────────────────────────────────────────────────────

/**
 * Apply Sieve DSL filtering, sorting, and pagination directly to a Firestore
 * collection reference or pre-filtered query.
 *
 * Billing impact:
 *  - 1 aggregation read  → `query.count().get()`  (total count, no docs fetched)
 *  - N document reads    → `pagedQuery.get()`      (only the current page docs)
 *
 * @param baseQuery  A Firestore CollectionReference or a pre-filtered Query
 *                   (e.g. `collection.where('status', '==', 'published')`).
 * @param model      Parsed from request query params: `{ filters, sorts, page, pageSize }`.
 * @param fields     Map of queryable fields for this collection.
 * @param options    Override default processor options.
 */
export async function applySieveToFirestore<T extends DocumentData>(params: {
  baseQuery: CollectionReference | Query;
  model: SieveModel;
  fields: FirebaseSieveFields;
  options?: FirebaseSieveOptions;
}): Promise<FirebaseSieveResult<T>> {
  const { baseQuery, model, fields, options } = params;
  const mergedOptions = { ...DEFAULTS, ...options };

  // One processor per call — stateless, cheap to create
  const processor = new SieveProcessorBase({
    adapter: createFirebaseAdapter() as any,
    autoLoadConfig: false,
    options: mergedOptions,
    fields,
  } as any);

  // ── Step 1: count (no pagination, no document reads) ──────────────────────
  // apply() with applyPagination:false returns the filtered+sorted query only
  const filteredQuery = processor.apply(model, baseQuery, {
    applyPagination: false,
  } as any) as unknown as Query;

  const countSnap = await filteredQuery.count().get();
  const total: number = countSnap.data().count;

  // ── Step 2: paginated results ─────────────────────────────────────────────
  const pagedQuery = processor.apply(model, baseQuery) as unknown as Query;
  const snapshot = await pagedQuery.get();

  const items = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as unknown as T,
  );

  // ── Step 3: pagination meta ───────────────────────────────────────────────
  const page = Math.max(1, Number(model.page ?? 1));
  const pageSize = Math.min(
    mergedOptions.maxPageSize,
    Math.max(1, Number(model.pageSize ?? mergedOptions.defaultPageSize)),
  );
  const totalPages = total === 0 ? 0 : Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}
