/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/utils/pagination
 * @description This file contains functionality related to pagination
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Pagination Utilities
 * Provides standardized cursor-based and offset-based pagination for Firestore queries
 * Location: /src/app/api/lib/utils/pagination.ts
 */

import { Query, DocumentSnapshot } from "firebase-admin/firestore";

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Limit */
  limit?: number;
  startAfter?: string; // Document ID for cursor-based pagination
  page?: number; // For offset-based pagination
  /** Default Limit */
  defaultLimit?: number;
  /** Max Limit */
  maxLimit?: number;
}

/**
 * Cursor-based pagination metadata
 */
export interface CursorPaginationMeta {
  /** Limit */
  limit: number;
  /** Has Next Page */
  hasNextPage: boolean;
  /** Next Cursor */
  nextCursor: string | null;
  /** Count */
  count: number;
}

/**
 * Offset-based pagination metadata
 */
export interface OffsetPaginationMeta {
  /** Page */
  page: number;
  /** Limit */
  limit: number;
  /** Total */
  total?: number;
  /** Has Next Page */
  hasNextPage: boolean;
  /** Has Prev Page */
  hasPrevPage: boolean;
  /** Total Pages */
  totalPages?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Success */
  success: boolean;
  /** Data */
  data: T[];
  /** Count */
  count: number;
  /** Pagination */
  pagination: CursorPaginationMeta | OffsetPaginationMeta;
}

/**
 * Parse pagination parameters from URL search params
 */
/**
 * Parses pagination params
 *
 * @param {URLSearchParams} searchParams - The search params
 * @param {number} [defaultLimit] - The default limit
 * @param {number} [maxLimit] - The max limit
 *
 * @returns {number} The parsepaginationparams result
 *
 * @example
 * parsePaginationParams(searchParams, 123, 123);
 */

/**
 * Parses pagination params
 *
 * @returns {number} The parsepaginationparams result
 *
 * @example
 * parsePaginationParams();
 */

export function parsePaginationParams(
  /** Search Params */
  searchParams: URLSearchParams,
  /** Default Limit */
  defaultLimit: number = 20,
  /** Max Limit */
  maxLimit: number = 100,
): PaginationConfig {
  const limitParam = searchParams.get("limit");
  const startAfter =
    searchParams.get("startAfter") || searchParams.get("cursor");
  const pageParam = searchParams.get("page");

  let limit = defaultLimit;
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, maxLimit);
    }
  }

  let page: number | undefined;
  if (pageParam) {
    const parsedPage = parseInt(pageParam, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  return {
    limit,
    /** Start After */
    startAfter: startAfter || undefined,
    page,
    defaultLimit,
    maxLimit,
  };
}

/**
 * Apply cursor-based pagination to a Firestore query
 * Fetches limit + 1 documents to determine if there's a next page
 */
/**
 * Performs apply cursor pagination operation
 *
 * @param {Query} query - The query
 * @param {PaginationConfig} config - The config
 * @param {(id} [getStartDoc] - The get start doc
 *
 * @returns {Promise<any>} Promise resolving to applycursorpagination result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * applyCursorPagination(query, config, getStartDoc);
 */

/**
 * Performs apply cursor pagination operation
 *
 * @returns {Promise<any>} Promise resolving to applycursorpagination result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * applyCursorPagination();
 */

export async function applyCursorPagination<T = any>(
  /** Query */
  query: Query,
  /** Config */
  config: PaginationConfig,
  /** Get Start Doc */
  getStartDoc?: (id: string) => Promise<DocumentSnapshot | null>,
): Promise<{
  /** Docs */
  docs: DocumentSnapshot[];
  /** Has Next Page */
  hasNextPage: boolean;
  /** Next Cursor */
  nextCursor: string | null;
}> {
  const limit = config.limit || config.defaultLimit || 20;
  let paginatedQuery = query;

  // Apply cursor if provided
  if (config.startAfter && getStartDoc) {
    try {
      const startDoc = await getStartDoc(config.startAfter);
      if (startDoc && startDoc.exists) {
        paginatedQuery = paginatedQuery.startAfter(startDoc);
      }
    } catch (error) {
      console.error("Invalid cursor:", error);
      // Continue without cursor if invalid
    }
  }

  // Fetch limit + 1 to check if there's a next page
  paginatedQuery = paginatedQuery.limit(limit + 1);
  const snapshot = await paginatedQuery.get();
  const docs = snapshot.docs;

  // Check if there's a next page
  const hasNextPage = docs.length > limit;
  const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

  // Get next cursor (last document ID)
  const nextCursor =
    hasNextPage && resultDocs.length > 0
      ? (resultDocs.at(-1)?.id ?? null)
      : null;

  return {
    /** Docs */
    docs: resultDocs,
    hasNextPage,
    nextCursor,
  };
}

/**
 * Apply offset-based pagination to a Firestore query
 * Note: Offset-based pagination is less efficient than cursor-based for large datasets
 */
/**
 * Performs apply offset pagination operation
 *
 * @param {Query} query - The query
 * @param {PaginationConfig} config - The config
 *
 * @returns {Promise<any>} Promise resolving to applyoffsetpagination result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * applyOffsetPagination(query, config);
 */

/**
 * Performs apply offset pagination operation
 *
 * @returns {Promise<any>} Promise resolving to applyoffsetpagination result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * applyOffsetPagination();
 */

export async function applyOffsetPagination(
  /** Query */
  query: Query,
  /** Config */
  config: PaginationConfig,
): Promise<{
  /** Docs */
  docs: DocumentSnapshot[];
  /** Page */
  page: number;
  /** Has Next Page */
  hasNextPage: boolean;
  /** Has Prev Page */
  hasPrevPage: boolean;
}> {
  const page = config.page || 1;
  const limit = config.limit || config.defaultLimit || 20;
  /**
   * Performs offset operation
   *
   * @returns {any} The offset result
   */

  /**
   * Performs offset operation
   *
   * @returns {any} The offset result
   */

  const offset = (page - 1) * limit;

  // Fetch limit + 1 to check if there's a next page
  const paginatedQuery = query.limit(limit + 1).offset(offset);
  const snapshot = await paginatedQuery.get();
  const docs = snapshot.docs;

  const hasNextPage = docs.length > limit;
  const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

  return {
    /** Docs */
    docs: resultDocs,
    page,
    hasNextPage,
    /** Has Prev Page */
    hasPrevPage: page > 1,
  };
}

/**
 * Create cursor-based pagination metadata
 */
/**
 * Creates a new cursor pagination meta
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * createCursorPaginationMeta();
 */

/**
 * Creates a new cursor pagination meta
 *
 * @returns {number} The cursorpaginationmeta result
 *
 * @example
 * createCursorPaginationMeta();
 */

export function createCursorPaginationMeta(
  /** Count */
  count: number,
  /** Limit */
  limit: number,
  /** Has Next Page */
  hasNextPage: boolean,
  /** Next Cursor */
  nextCursor: string | null,
): CursorPaginationMeta {
  return {
    limit,
    hasNextPage,
    nextCursor,
    count,
  };
}

/**
 * Create offset-based pagination metadata
 */
/**
 * Creates a new offset pagination meta
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * createOffsetPaginationMeta();
 */

/**
 * Creates a new offset pagination meta
 *
 * @returns {number} The offsetpaginationmeta result
 *
 * @example
 * createOffsetPaginationMeta();
 */

export function createOffsetPaginationMeta(
  /** Page */
  page: number,
  /** Limit */
  limit: number,
  /** Count */
  count: number,
  /** Has Next Page */
  hasNextPage: boolean,
  /** Has Prev Page */
  hasPrevPage: boolean,
  /** Total */
  total?: number,
): OffsetPaginationMeta {
  return {
    page,
    limit,
    total,
    hasNextPage,
    hasPrevPage,
    /** Total Pages */
    totalPages: total ? Math.ceil(total / limit) : undefined,
  };
}

/**
 * Create a paginated response with cursor-based pagination
 */
/**
 * Creates a new cursor paginated response
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * createCursorPaginatedResponse();
 */

/**
 * Creates a new cursor paginated response
 *
 * @returns {number} The cursorpaginatedresponse result
 *
 * @example
 * createCursorPaginatedResponse();
 */

export function createCursorPaginatedResponse<T>(
  /** Data */
  data: T[],
  /** Limit */
  limit: number,
  /** Has Next Page */
  hasNextPage: boolean,
  /** Next Cursor */
  nextCursor: string | null,
): PaginatedResponse<T> {
  return {
    /** Success */
    success: true,
    data,
    /** Count */
    count: data.length,
    /** Pagination */
    pagination: createCursorPaginationMeta(
      data.length,
      limit,
      hasNextPage,
      nextCursor,
    ),
  };
}

/**
 * Create a paginated response with offset-based pagination
 */
/**
 * Creates a new offset paginated response
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * createOffsetPaginatedResponse();
 */

/**
 * Creates a new offset paginated response
 *
 * @returns {number} The offsetpaginatedresponse result
 *
 * @example
 * createOffsetPaginatedResponse();
 */

export function createOffsetPaginatedResponse<T>(
  /** Data */
  data: T[],
  /** Page */
  page: number,
  /** Limit */
  limit: number,
  /** Has Next Page */
  hasNextPage: boolean,
  /** Has Prev Page */
  hasPrevPage: boolean,
  /** Total */
  total?: number,
): PaginatedResponse<T> {
  return {
    /** Success */
    success: true,
    data,
    /** Count */
    count: data.length,
    /** Pagination */
    pagination: createOffsetPaginationMeta(
      page,
      limit,
      data.length,
      hasNextPage,
      hasPrevPage,
      total,
    ),
  };
}

/**
 * Execute a cursor-based paginated query and return formatted response
 */
/**
 * Performs execute cursor paginated query operation
 *
 * @param {Query} query - The query
 * @param {URLSearchParams} searchParams - The search params
 * @param {(id} getStartDoc - The get start doc
 *
 * @returns {Promise<any>} Promise resolving to executecursorpaginatedquery result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeCursorPaginatedQuery(query, searchParams, getStartDoc);
 */

/**
 * Performs execute cursor paginated query operation
 *
 * @returns {Promise<any>} Promise resolving to executecursorpaginatedquery result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeCursorPaginatedQuery();
 */

export async function executeCursorPaginatedQuery<T>(
  /** Query */
  query: Query,
  /** Search Params */
  searchParams: URLSearchParams,
  /** Get Start Doc */
  getStartDoc: (id: string) => Promise<DocumentSnapshot | null>,
  /** Transform Doc */
  transformDoc: (doc: DocumentSnapshot) => T,
  /** Default Limit */
  defaultLimit: number = 20,
  /** Max Limit */
  maxLimit: number = 100,
): Promise<PaginatedResponse<T>> {
  const config = parsePaginationParams(searchParams, defaultLimit, maxLimit);

  const { docs, hasNextPage, nextCursor } = await applyCursorPagination(
    query,
    config,
    getStartDoc,
  );

  const data = docs.map(transformDoc);

  return createCursorPaginatedResponse(
    data,
    config.limit || defaultLimit,
    hasNextPage,
    nextCursor,
  );
}

/**
 * Execute an offset-based paginated query and return formatted response
 */
/**
 * Performs execute offset paginated query operation
 *
 * @param {Query} query - The query
 * @param {URLSearchParams} searchParams - The search params
 * @param {(doc} transformDoc - The transform doc
 *
 * @returns {Promise<any>} Promise resolving to executeoffsetpaginatedquery result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeOffsetPaginatedQuery(query, searchParams, transformDoc);
 */

/**
 * Performs execute offset paginated query operation
 *
 * @returns {Promise<any>} Promise resolving to executeoffsetpaginatedquery result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeOffsetPaginatedQuery();
 */

export async function executeOffsetPaginatedQuery<T>(
  /** Query */
  query: Query,
  /** Search Params */
  searchParams: URLSearchParams,
  /** Transform Doc */
  transformDoc: (doc: DocumentSnapshot) => T,
  /** Default Limit */
  defaultLimit: number = 20,
  /** Max Limit */
  maxLimit: number = 100,
  /** Total */
  total?: number,
): Promise<PaginatedResponse<T>> {
  const config = parsePaginationParams(searchParams, defaultLimit, maxLimit);

  const { docs, page, hasNextPage, hasPrevPage } = await applyOffsetPagination(
    query,
    config,
  );

  const data = docs.map(transformDoc);

  return createOffsetPaginatedResponse(
    data,
    page,
    config.limit || defaultLimit,
    hasNextPage,
    hasPrevPage,
    total,
  );
}
