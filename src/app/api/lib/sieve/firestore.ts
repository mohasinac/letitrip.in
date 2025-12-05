/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/sieve/firestore
 * @description This file contains functionality related to firestore
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Sieve Firestore Adapter
 * Epic: E026 - Sieve-style Pagination
 *
 * Converts SieveQuery to Firestore queries with proper handling of
 * operators that Firestore doesn't support natively.
 *
 * Uses Firebase Admin SDK for server-side operations.
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  CollectionReference,
  DocumentData,
  Query,
} from "firebase-admin/firestore";
import { evaluateFilters, isFirestoreSupported } from "./operators";
import {
  ClientSideFilter,
  FirestoreAdapterResult,
  FirestoreFilter,
  FirestoreOperator,
  SieveConfig,
  SievePaginatedResponse,
  SievePaginationMeta,
  SieveQuery,
} from "./types";

// ==================== FIRESTORE QUERY BUILDING ====================

/**
 * Adapt a SieveQuery to Firestore query constraints
 */
/**
 * Performs adapt to firestore operation
 *
 * @param {SieveQuery} sieveQuery - The sieve query
 * @param {SieveConfig} [config] - The config
 *
 * @returns {any} The adapttofirestore result
 *
 * @example
 * adaptToFirestore(sieveQuery, config);
 */

/**
 * Performs adapt to firestore operation
 *
 * @returns {any} The adapttofirestore result
 *
 * @example
 * adaptToFirestore();
 */

export function adaptToFirestore(
  /** Sieve Query */
  sieveQuery: SieveQuery,
  /** Config */
  config?: SieveConfig,
): FirestoreAdapterResult {
  const firestoreFilters: FirestoreFilter[] = [];
  const clientSideFilters: ClientSideFilter[] = [];

  // Process filters
  for (const filter of sieveQuery.filters) {
    const firestoreOp = mapOperatorToFirestore(filter.operator);

    if (firestoreOp && isFirestoreSupported(filter.operator)) {
      // Map field if needed
      const field = config?.fieldMappings?.[filter.field] || filter.field;
      firestoreFilters.push({
        field,
        /** Operator */
        operator: firestoreOp,
        /** Value */
        value: filter.value,
      });
    } else {
      // Must be evaluated client-side
      clientSideFilters.push({
        /** Condition */
        condition: filter,
        /** Reason */
        reason: `Operator '${filter.operator}' is not supported by Firestore`,
      });
    }
  }

  // Calculate offset for pagination
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

  const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;

  return {
    firestoreFilters,
    clientSideFilters,
    /** Sorts */
    sorts: sieveQuery.sorts,
    offset,
    /** Limit */
    limit: sieveQuery.pageSize,
  };
}

/**
 * Map sieve operator to Firestore operator
 */
/**
 * Maps operator to firestore
 *
 * @param {string} operator - The operator
 *
 * @returns {string} The mapoperatortofirestore result
 */

/**
 * Maps operator to firestore
 *
 * @param {string} operator - The operator
 *
 * @returns {string} The mapoperatortofirestore result
 */

function mapOperatorToFirestore(operator: string): FirestoreOperator | null {
  const mapping: Record<string, FirestoreOperator> = {
    "==": "==",
    "!=": "!=",
    ">": ">",
    ">=": ">=",
    "<": "<",
    "<=": "<=",
  };
  return mapping[operator] || null;
}

// ==================== QUERY EXECUTION ====================

/**
 * Execute a sieve query against a Firestore collection
 */
/**
 * Performs execute sieve query operation
 *
 * @param {string} collectionName - Name of collection
 * @param {SieveQuery} sieveQuery - The sieve query
 * @param {SieveConfig} [config] - The config
 *
 * @returns {Promise<any>} Promise resolving to executesievequery result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeSieveQuery("example", sieveQuery, config);
 */

/**
 * Performs execute sieve query operation
 *
 * @returns {Promise<any>} Promise resolving to executesievequery result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeSieveQuery();
 */

export async function executeSieveQuery<T extends DocumentData>(
  /** Collection Name */
  collectionName: string,
  /** Sieve Query */
  sieveQuery: SieveQuery,
  /** Config */
  config?: SieveConfig,
): Promise<SievePaginatedResponse<T>> {
  const db = getFirestoreAdmin();
  const collectionRef = db.collection(collectionName);
  const adapted = adaptToFirestore(sieveQuery, config);

  // Build base query with Firestore filters
  let q: Query = collectionRef;

  // Apply Firestore-compatible filters
  for (const filter of adapted.firestoreFilters) {
    q = q.where(filter.field, filter.operator, filter.value);
  }

  // Apply sorts
  for (const sort of adapted.sorts) {
    q = q.orderBy(sort.field, sort.direction);
  }

  // Get total count (before pagination)
  const countSnapshot = await q.count().get();
  let totalCount = countSnapshot.data().count;

  // If we have client-side filters, we need to fetch more and filter
  const hasClientFilters = adapted.clientSideFilters.length > 0;

  let data: T[];

  if (hasClientFilters) {
    // Fetch all matching documents and filter client-side
    // This is less efficient but necessary for operators Firestore doesn't support
    const allDocs = await q.get();
    // Type assertion needed: Firestore DocumentData to generic T
    // Caller is responsible for ensuring T matches the collection schema
    /**
 * Performs all data operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The alldata result
 *
 */
let allData = allDocs.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    })) as unknown as T[];

    // Apply client-side filters
    allData = allData.filter((record) =>
      evaluateFilters(
        adapted.clientSideFilters.map((f) => f.condition),
        record as Record<string, unknown>,
      ),
    );

    // Update count after client-side filtering
    totalCount = allData.length;

    // Apply pagination manually
    const start = adapted.offset;
    const end = start + adapted.limit;
    data = allData.slice(start, end);
  } else {
    // Use Firestore pagination (more efficient)
    // For page > 1, we need cursor-based pagination
    // This requires knowing the last document of the previous page
    if (adapted.offset > 0) {
      // Fetch documents up to the offset to get the cursor
      const cursorSnapshot = await q.limit(adapted.offset).get();

      const lastVisible = cursorSnapshot.docs.at(-1);
      if (lastVisible) {
        q = q.startAfter(lastVisible).limit(adapted.limit);
      } else {
        // No documents before this page, just apply limit
        q = q.limit(adapted.limit);
      }
    } else {
      q = q.limit(adapted.limit);
    }

    const snapshot = await q.get();
    // Type assertion needed: Firestore DocumentData to generic T
    // Caller is responsible for ensuring T matches the collection schema
    data = snapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    })) as unknown as T[];
  }

  // Build pagination meta
  const totalPages = Math.ceil(totalCount / sieveQuery.pageSize);
  const pagination: SievePaginationMeta = {
    /** Page */
    page: sieveQuery.page,
    /** Page Size */
    pageSize: sieveQuery.pageSize,
    totalCount,
    totalPages,
    /** Has Next Page */
    hasNextPage: sieveQuery.page < totalPages,
    /** Has Previous Page */
    hasPreviousPage: sieveQuery.page > 1,
  };

  return {
    /** Success */
    success: true,
    data,
    pagination,
    /** Meta */
    meta: {
      /** Applied Filters */
      appliedFilters: sieveQuery.filters,
      /** Applied Sorts */
      appliedSorts: sieveQuery.sorts,
      /** Warnings */
      warnings:
        adapted.clientSideFilters.length > 0
          ? [
              `${adapted.clientSideFilters.length} filter(s) applied client-side`,
            ]
          : undefined,
    },
  };
}

// ==================== HELPER FOR EXISTING QUERIES ====================

/**
 * Apply sieve query to an existing Firestore query
 * Useful when you have pre-built queries with complex conditions
 */
/**
 * Performs apply sieve to query operation
 *
 * @param {Query} baseQuery - The base query
 * @param {SieveQuery} sieveQuery - The sieve query
 * @param {SieveConfig} [config] - The config
 *
 * @returns {any} The applysievetoquery result
 *
 * @example
 * applySieveToQuery(baseQuery, sieveQuery, config);
 */

/**
 * Performs apply sieve to query operation
 *
 * @returns {any} The applysievetoquery result
 *
 * @example
 * applySieveToQuery();
 */

export function applySieveToQuery(
  /** Base Query */
  baseQuery: Query,
  /** Sieve Query */
  sieveQuery: SieveQuery,
  /** Config */
  config?: SieveConfig,
): Query {
  const adapted = adaptToFirestore(sieveQuery, config);
  let q = baseQuery;

  // Apply Firestore-compatible filters
  for (const filter of adapted.firestoreFilters) {
    q = q.where(filter.field, filter.operator, filter.value);
  }

  // Apply sorts
  for (const sort of adapted.sorts) {
    q = q.orderBy(sort.field, sort.direction);
  }

  // Apply limit
  q = q.limit(adapted.limit);

  return q;
}

/**
 * Post-process query results with client-side filters and pagination
 */
/**
 * Performs post process results operation
 *
 * @param {T[]} results - The results
 * @param {SieveQuery} sieveQuery - The sieve query
 * @param {SieveConfig} [config] - The config
 *
 * @returns {number} The postprocessresults result
 *
 * @example
 * postProcessResults(results, sieveQuery, config);
 */

/**
 * Performs post process results operation
 *
 * @returns {any} The postprocessresults result
 *
 * @example
 * postProcessResults();
 */

export function postProcessResults<T extends Record<string, unknown>>(
  /** Results */
  results: T[],
  /** Sieve Query */
  sieveQuery: SieveQuery,
  /** Config */
  config?: SieveConfig,
): { data: T[]; totalCount: number } {
  const adapted = adaptToFirestore(sieveQuery, config);

  // Apply client-side filters
  let filtered = results;
  if (adapted.clientSideFilters.length > 0) {
    filtered = results.filter((record) =>
      evaluateFilters(
        adapted.clientSideFilters.map((f) => f.condition),
        record,
      ),
    );
  }

  const totalCount = filtered.length;

  // Apply pagination
  const start = adapted.offset;
  const end = start + adapted.limit;
  const data = filtered.slice(start, end);

  return { data, totalCount };
}

// ==================== COLLECTION HELPERS ====================

/**
 * Get collection reference
 */
/**
 * Retrieves collection ref
 *
 * @param {string} collectionName - Name of collection
 *
 * @returns {string} The collectionref result
 *
 * @example
 * getCollectionRef("example");
 */

/**
 * Retrieves collection ref
 *
 * @param {string} collectionName - Name of collection
 *
 * @returns {string} The collectionref result
 *
 * @example
 * getCollectionRef("example");
 */

export function getCollectionRef(collectionName: string): CollectionReference {
  const db = getFirestoreAdmin();
  return db.collection(collectionName);
}

/**
 * Create empty pagination response
 */
/**
 * Creates a new empty response
 *
 * @returns {any} The emptyresponse result
 *
 * @example
 * createEmptyResponse();
 */

/**
 * Creates a new empty response
 *
 * @returns {any} The emptyresponse result
 *
 * @example
 * createEmptyResponse();
 */

export function createEmptyResponse<T>(): SievePaginatedResponse<T> {
  return {
    /** Success */
    success: true,
    /** Data */
    data: [],
    /** Pagination */
    pagination: {
      /** Page */
      page: 1,
      /** Page Size */
      pageSize: 20,
      /** Total Count */
      totalCount: 0,
      /** Total Pages */
      totalPages: 0,
      /** Has Next Page */
      hasNextPage: false,
      /** Has Previous Page */
      hasPreviousPage: false,
    },
  };
}

/**
 * Create pagination meta from count and query
 */
/**
 * Creates a new pagination meta
 *
 * @param {number} totalCount - Number of total
 * @param {SieveQuery} sieveQuery - The sieve query
 *
 * @returns {number} The paginationmeta result
 *
 * @example
 * createPaginationMeta(123, sieveQuery);
 */

/**
 * Creates a new pagination meta
 *
 * @returns {number} The paginationmeta result
 *
 * @example
 * createPaginationMeta();
 */

export function createPaginationMeta(
  /** Total Count */
  totalCount: number,
  /** Sieve Query */
  sieveQuery: SieveQuery,
): SievePaginationMeta {
  const totalPages = Math.ceil(totalCount / sieveQuery.pageSize);
  return {
    /** Page */
    page: sieveQuery.page,
    /** Page Size */
    pageSize: sieveQuery.pageSize,
    totalCount,
    totalPages,
    /** Has Next Page */
    hasNextPage: sieveQuery.page < totalPages,
    /** Has Previous Page */
    hasPreviousPage: sieveQuery.page > 1,
  };
}
