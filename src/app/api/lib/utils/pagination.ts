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
  limit?: number;
  startAfter?: string; // Document ID for cursor-based pagination
  page?: number; // For offset-based pagination
  defaultLimit?: number;
  maxLimit?: number;
}

/**
 * Cursor-based pagination metadata
 */
export interface CursorPaginationMeta {
  limit: number;
  hasNextPage: boolean;
  nextCursor: string | null;
  count: number;
}

/**
 * Offset-based pagination metadata
 */
export interface OffsetPaginationMeta {
  page: number;
  limit: number;
  total?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  pagination: CursorPaginationMeta | OffsetPaginationMeta;
}

/**
 * Parse pagination parameters from URL search params
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaultLimit: number = 20,
  maxLimit: number = 100
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
export async function applyCursorPagination<T = any>(
  query: Query,
  config: PaginationConfig,
  getStartDoc?: (id: string) => Promise<DocumentSnapshot | null>
): Promise<{
  docs: DocumentSnapshot[];
  hasNextPage: boolean;
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
      ? resultDocs[resultDocs.length - 1].id
      : null;

  return {
    docs: resultDocs,
    hasNextPage,
    nextCursor,
  };
}

/**
 * Apply offset-based pagination to a Firestore query
 * Note: Offset-based pagination is less efficient than cursor-based for large datasets
 */
export async function applyOffsetPagination(
  query: Query,
  config: PaginationConfig
): Promise<{
  docs: DocumentSnapshot[];
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}> {
  const page = config.page || 1;
  const limit = config.limit || config.defaultLimit || 20;
  const offset = (page - 1) * limit;

  // Fetch limit + 1 to check if there's a next page
  const paginatedQuery = query.limit(limit + 1).offset(offset);
  const snapshot = await paginatedQuery.get();
  const docs = snapshot.docs;

  const hasNextPage = docs.length > limit;
  const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

  return {
    docs: resultDocs,
    page,
    hasNextPage,
    hasPrevPage: page > 1,
  };
}

/**
 * Create cursor-based pagination metadata
 */
export function createCursorPaginationMeta(
  count: number,
  limit: number,
  hasNextPage: boolean,
  nextCursor: string | null
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
export function createOffsetPaginationMeta(
  page: number,
  limit: number,
  count: number,
  hasNextPage: boolean,
  hasPrevPage: boolean,
  total?: number
): OffsetPaginationMeta {
  return {
    page,
    limit,
    total,
    hasNextPage,
    hasPrevPage,
    totalPages: total ? Math.ceil(total / limit) : undefined,
  };
}

/**
 * Create a paginated response with cursor-based pagination
 */
export function createCursorPaginatedResponse<T>(
  data: T[],
  limit: number,
  hasNextPage: boolean,
  nextCursor: string | null
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    count: data.length,
    pagination: createCursorPaginationMeta(
      data.length,
      limit,
      hasNextPage,
      nextCursor
    ),
  };
}

/**
 * Create a paginated response with offset-based pagination
 */
export function createOffsetPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  hasNextPage: boolean,
  hasPrevPage: boolean,
  total?: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    count: data.length,
    pagination: createOffsetPaginationMeta(
      page,
      limit,
      data.length,
      hasNextPage,
      hasPrevPage,
      total
    ),
  };
}

/**
 * Execute a cursor-based paginated query and return formatted response
 */
export async function executeCursorPaginatedQuery<T>(
  query: Query,
  searchParams: URLSearchParams,
  getStartDoc: (id: string) => Promise<DocumentSnapshot | null>,
  transformDoc: (doc: DocumentSnapshot) => T,
  defaultLimit: number = 20,
  maxLimit: number = 100
): Promise<PaginatedResponse<T>> {
  const config = parsePaginationParams(searchParams, defaultLimit, maxLimit);

  const { docs, hasNextPage, nextCursor } = await applyCursorPagination(
    query,
    config,
    getStartDoc
  );

  const data = docs.map(transformDoc);

  return createCursorPaginatedResponse(
    data,
    config.limit || defaultLimit,
    hasNextPage,
    nextCursor
  );
}

/**
 * Execute an offset-based paginated query and return formatted response
 */
export async function executeOffsetPaginatedQuery<T>(
  query: Query,
  searchParams: URLSearchParams,
  transformDoc: (doc: DocumentSnapshot) => T,
  defaultLimit: number = 20,
  maxLimit: number = 100,
  total?: number
): Promise<PaginatedResponse<T>> {
  const config = parsePaginationParams(searchParams, defaultLimit, maxLimit);

  const { docs, page, hasNextPage, hasPrevPage } = await applyOffsetPagination(
    query,
    config
  );

  const data = docs.map(transformDoc);

  return createOffsetPaginatedResponse(
    data,
    page,
    config.limit || defaultLimit,
    hasNextPage,
    hasPrevPage,
    total
  );
}
