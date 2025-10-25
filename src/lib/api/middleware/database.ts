/**
 * Database Operations Middleware
 * Centralized database operations with common patterns and error handling
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { Firestore, QuerySnapshot, DocumentSnapshot, Query } from "firebase-admin/firestore";
import { throwApiError } from "./error-handler";

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
    limit: number;
  };
}

export interface FilterParams {
  [key: string]: any;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Database helper class with common operations
 */
export class DatabaseHelper {
  private static db: Firestore | null = null;

  static getDb(): Firestore {
    if (!this.db) {
      this.db = getAdminDb();
    }
    return this.db;
  }

  /**
   * Get a single document by ID
   */
  static async getDocumentById<T>(
    collection: string,
    id: string,
    includeId = true
  ): Promise<T | null> {
    try {
      const db = this.getDb();
      const doc = await db.collection(collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return includeId ? { id: doc.id, ...data } as T : data as T;
    } catch (error) {
      console.error(`Error getting document ${id} from ${collection}:`, error);
      throwApiError(`Failed to get ${collection} document`, 500);
    }
  }

  /**
   * Create a new document
   */
  static async createDocument<T>(
    collection: string,
    data: Partial<T>,
    customId?: string
  ): Promise<{ id: string; data: T }> {
    try {
      const db = this.getDb();
      const now = new Date().toISOString();
      
      const documentData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      } as any;

      let docRef;
      if (customId) {
        docRef = db.collection(collection).doc(customId);
        await docRef.set(documentData);
      } else {
        docRef = await db.collection(collection).add(documentData);
      }

      return {
        id: docRef.id,
        data: { id: docRef.id, ...documentData } as T,
      };
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throwApiError(`Failed to create ${collection} document`, 500);
    }
  }

  /**
   * Update a document by ID
   */
  static async updateDocument<T>(
    collection: string,
    id: string,
    data: Partial<T>,
    merge = true
  ): Promise<T> {
    try {
      const db = this.getDb();
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const docRef = db.collection(collection).doc(id);
      
      if (merge) {
        await docRef.update(updateData);
      } else {
        await docRef.set(updateData);
      }

      const updatedDoc = await docRef.get();
      if (!updatedDoc.exists) {
        throwApiError(`${collection} document not found`, 404);
      }

      return { id: updatedDoc.id, ...updatedDoc.data() } as T;
    } catch (error: any) {
      if (error.code === 'not-found') {
        throwApiError(`${collection} document not found`, 404);
      }
      console.error(`Error updating document ${id} in ${collection}:`, error);
      throwApiError(`Failed to update ${collection} document`, 500);
    }
  }

  /**
   * Delete a document by ID
   */
  static async deleteDocument(collection: string, id: string): Promise<void> {
    try {
      const db = this.getDb();
      await db.collection(collection).doc(id).delete();
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collection}:`, error);
      throwApiError(`Failed to delete ${collection} document`, 500);
    }
  }

  /**
   * Check if a document exists
   */
  static async documentExists(collection: string, id: string): Promise<boolean> {
    try {
      const db = this.getDb();
      const doc = await db.collection(collection).doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error(`Error checking document existence ${id} in ${collection}:`, error);
      return false;
    }
  }

  /**
   * Query documents with filters, sorting, and pagination
   */
  static async queryDocuments<T>(
    collection: string,
    options: {
      filters?: FilterParams;
      sort?: SortParams[];
      pagination?: PaginationParams;
      includeId?: boolean;
    } = {}
  ): Promise<PaginationResult<T>> {
    try {
      const db = this.getDb();
      const {
        filters = {},
        sort = [],
        pagination = {},
        includeId = true,
      } = options;

      const {
        page = 1,
        limit = 50,
        offset,
      } = pagination;

      let query: Query = db.collection(collection);

      // Apply filters
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle 'in' queries (max 10 items for Firestore)
            if (value.length <= 10) {
              query = query.where(field, 'in', value);
            }
          } else if (typeof value === 'object' && value.operator) {
            // Handle complex queries like { operator: '>=', value: 100 }
            query = query.where(field, value.operator, value.value);
          } else {
            // Simple equality
            query = query.where(field, '==', value);
          }
        }
      });

      // Apply sorting
      sort.forEach(({ field, direction }) => {
        query = query.orderBy(field, direction);
      });

      // Get total count for pagination
      const countSnapshot = await query.count().get();
      const totalItems = countSnapshot.data().count;

      // Apply pagination
      const actualOffset = offset ?? (page - 1) * limit;
      query = query.limit(limit).offset(actualOffset);

      const snapshot = await query.get();
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return includeId ? { id: doc.id, ...docData } : docData;
      }) as T[];

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasMore: actualOffset + limit < totalItems,
          limit,
        },
      };
    } catch (error) {
      console.error(`Error querying ${collection}:`, error);
      throwApiError(`Failed to query ${collection} documents`, 500);
    }
  }

  /**
   * Batch operations helper
   */
  static async batchOperations(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      collection: string;
      id?: string;
      data?: any;
    }>
  ): Promise<void> {
    try {
      const db = this.getDb();
      const batch = db.batch();

      operations.forEach(({ type, collection, id, data }) => {
        const collectionRef = db.collection(collection);

        switch (type) {
          case 'create':
            if (id) {
              batch.set(collectionRef.doc(id), data);
            } else {
              batch.set(collectionRef.doc(), data);
            }
            break;
          case 'update':
            if (!id) throw new Error('ID required for update operation');
            batch.update(collectionRef.doc(id), data);
            break;
          case 'delete':
            if (!id) throw new Error('ID required for delete operation');
            batch.delete(collectionRef.doc(id));
            break;
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error in batch operations:', error);
      throwApiError('Failed to execute batch operations', 500);
    }
  }

  /**
   * Search documents with text-based search (client-side filtering)
   * For production, consider using a proper search service like Algolia
   */
  static async searchDocuments<T>(
    collection: string,
    searchQuery: string,
    searchFields: string[],
    options: {
      filters?: FilterParams;
      sort?: SortParams[];
      pagination?: PaginationParams;
      includeId?: boolean;
    } = {}
  ): Promise<PaginationResult<T>> {
    try {
      // First get all documents that match filters (without text search)
      const result = await this.queryDocuments<T>(collection, {
        ...options,
        pagination: { ...options.pagination, limit: 1000 }, // Get more for search
      });

      // Apply text search client-side
      const searchLower = searchQuery.toLowerCase();
      const filteredData = result.data.filter((item: any) =>
        searchFields.some((field) => {
          const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], item);
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(searchLower);
          }
          if (Array.isArray(fieldValue)) {
            return fieldValue.some((val) =>
              typeof val === 'string' && val.toLowerCase().includes(searchLower)
            );
          }
          return false;
        })
      );

      // Apply pagination to filtered results
      const { page = 1, limit = 50 } = options.pagination || {};
      const offset = (page - 1) * limit;
      const paginatedData = filteredData.slice(offset, offset + limit);

      return {
        data: paginatedData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredData.length / limit),
          totalItems: filteredData.length,
          hasMore: offset + limit < filteredData.length,
          limit,
        },
      };
    } catch (error) {
      console.error(`Error searching ${collection}:`, error);
      throwApiError(`Failed to search ${collection} documents`, 500);
    }
  }

  /**
   * Get documents by field value with optional relation population
   */
  static async getDocumentsByField<T>(
    collection: string,
    field: string,
    value: any,
    options: {
      limit?: number;
      populate?: Array<{ field: string; collection: string; as?: string }>;
      includeId?: boolean;
    } = {}
  ): Promise<T[]> {
    try {
      const db = this.getDb();
      const { limit = 100, populate = [], includeId = true } = options;

      let query = db.collection(collection).where(field, '==', value);
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      let documents = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return includeId ? { id: doc.id, ...data } : data;
      }) as T[];

      // Populate related documents
      if (populate.length > 0) {
        documents = await this.populateDocuments(documents, populate);
      }

      return documents;
    } catch (error) {
      console.error(`Error getting documents by ${field} from ${collection}:`, error);
      throwApiError(`Failed to get ${collection} documents`, 500);
    }
  }

  /**
   * Populate related documents
   */
  private static async populateDocuments<T>(
    documents: T[],
    populate: Array<{ field: string; collection: string; as?: string }>
  ): Promise<T[]> {
    const populatedDocuments = await Promise.all(
      documents.map(async (doc: any) => {
        const populatedDoc = { ...doc };

        for (const { field, collection, as } of populate) {
          const relatedId = doc[field];
          if (relatedId) {
            const relatedDoc = await this.getDocumentById(collection, relatedId);
            populatedDoc[as || `${field}_data`] = relatedDoc;
          }
        }

        return populatedDoc;
      })
    );

    return populatedDocuments;
  }
}
