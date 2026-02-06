/**
 * Base Repository
 *
 * Generic repository interface for Firestore operations.
 * All repositories should extend this base for consistent CRUD operations.
 *
 * @example
 * ```ts
 * class UserRepository extends BaseRepository<UserDocument> {
 *   constructor() {
 *     super(USER_COLLECTION);
 *   }
 * }
 * ```
 */

import { DocumentData, Firestore } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { DatabaseError, NotFoundError } from "@/lib/errors";

export abstract class BaseRepository<T extends DocumentData> {
  protected collection: string;

  constructor(collectionName: string) {
    this.collection = collectionName;
  }

  /**
   * Get Firestore instance (uses admin SDK)
   */
  protected get db(): Firestore {
    return getAdminDb();
  }

  /**
   * Get collection reference
   */
  protected getCollection() {
    return this.db.collection(this.collection);
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const doc = await this.getCollection().doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as unknown as T;
    } catch (error) {
      throw new DatabaseError(`Failed to find document by ID: ${id}`, error);
    }
  }

  /**
   * Find document by ID or throw error
   */
  async findByIdOrFail(id: string): Promise<T> {
    const doc = await this.findById(id);

    if (!doc) {
      throw new NotFoundError(`Document not found: ${id}`);
    }

    return doc;
  }

  /**
   * Find documents by field value
   */
  async findBy(field: string, value: any): Promise<T[]> {
    try {
      const snapshot = await this.getCollection()
        .where(field, "==", value)
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as unknown as T,
      );
    } catch (error) {
      throw new DatabaseError(`Failed to find documents by ${field}`, error);
    }
  }

  /**
   * Find one document by field value
   */
  async findOneBy(field: string, value: any): Promise<T | null> {
    try {
      const snapshot = await this.getCollection()
        .where(field, "==", value)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as unknown as T;
    } catch (error) {
      throw new DatabaseError(`Failed to find document by ${field}`, error);
    }
  }

  /**
   * Get all documents
   */
  async findAll(limit?: number): Promise<T[]> {
    try {
      let query = this.getCollection();

      if (limit) {
        query = query.limit(limit) as any;
      }

      const snapshot = await query.get();
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as unknown as T,
      );
    } catch (error) {
      throw new DatabaseError("Failed to fetch all documents", error);
    }
  }

  /**
   * Create new document
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const docRef = await this.getCollection().add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as unknown as T;
    } catch (error) {
      throw new DatabaseError("Failed to create document", error);
    }
  }

  /**
   * Create document with specific ID
   */
  async createWithId(id: string, data: Partial<T>): Promise<T> {
    try {
      await this.getCollection()
        .doc(id)
        .set({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const doc = await this.getCollection().doc(id).get();
      return { id: doc.id, ...doc.data() } as unknown as T;
    } catch (error) {
      throw new DatabaseError(
        `Failed to create document with ID: ${id}`,
        error,
      );
    }
  }

  /**
   * Update document by ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      await this.getCollection()
        .doc(id)
        .update({
          ...data,
          updatedAt: new Date(),
        });

      return this.findByIdOrFail(id);
    } catch (error) {
      throw new DatabaseError(`Failed to update document: ${id}`, error);
    }
  }

  /**
   * Delete document by ID
   */
  async delete(id: string): Promise<void> {
    try {
      await this.getCollection().doc(id).delete();
    } catch (error) {
      throw new DatabaseError(`Failed to delete document: ${id}`, error);
    }
  }

  /**
   * Check if document exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const doc = await this.getCollection().doc(id).get();
      return doc.exists;
    } catch (error) {
      throw new DatabaseError(
        `Failed to check document existence: ${id}`,
        error,
      );
    }
  }

  /**
   * Count documents
   */
  async count(): Promise<number> {
    try {
      const snapshot = await this.getCollection().get();
      return snapshot.size;
    } catch (error) {
      throw new DatabaseError("Failed to count documents", error);
    }
  }
}
