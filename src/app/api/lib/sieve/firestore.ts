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
export function adaptToFirestore(
  sieveQuery: SieveQuery,
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
        operator: firestoreOp,
        value: filter.value,
      });
    } else {
      // Must be evaluated client-side
      clientSideFilters.push({
        condition: filter,
        reason: `Operator '${filter.operator}' is not supported by Firestore`,
      });
    }
  }

  // Calculate offset for pagination
  const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;

  return {
    firestoreFilters,
    clientSideFilters,
    sorts: sieveQuery.sorts,
    offset,
    limit: sieveQuery.pageSize,
  };
}

/**
 * Map sieve operator to Firestore operator
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
export async function executeSieveQuery<T extends DocumentData>(
  collectionName: string,
  sieveQuery: SieveQuery,
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
    let allData = allDocs.docs.map((doc) => ({
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
      id: doc.id,
      ...doc.data(),
    })) as unknown as T[];
  }

  // Build pagination meta
  const totalPages = Math.ceil(totalCount / sieveQuery.pageSize);
  const pagination: SievePaginationMeta = {
    page: sieveQuery.page,
    pageSize: sieveQuery.pageSize,
    totalCount,
    totalPages,
    hasNextPage: sieveQuery.page < totalPages,
    hasPreviousPage: sieveQuery.page > 1,
  };

  return {
    success: true,
    data,
    pagination,
    meta: {
      appliedFilters: sieveQuery.filters,
      appliedSorts: sieveQuery.sorts,
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
export function applySieveToQuery(
  baseQuery: Query,
  sieveQuery: SieveQuery,
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
export function postProcessResults<T extends Record<string, unknown>>(
  results: T[],
  sieveQuery: SieveQuery,
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
export function getCollectionRef(collectionName: string): CollectionReference {
  const db = getFirestoreAdmin();
  return db.collection(collectionName);
}

/**
 * Create empty pagination response
 */
export function createEmptyResponse<T>(): SievePaginatedResponse<T> {
  return {
    success: true,
    data: [],
    pagination: {
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

/**
 * Create pagination meta from count and query
 */
export function createPaginationMeta(
  totalCount: number,
  sieveQuery: SieveQuery,
): SievePaginationMeta {
  const totalPages = Math.ceil(totalCount / sieveQuery.pageSize);
  return {
    page: sieveQuery.page,
    pageSize: sieveQuery.pageSize,
    totalCount,
    totalPages,
    hasNextPage: sieveQuery.page < totalPages,
    hasPreviousPage: sieveQuery.page > 1,
  };
}
