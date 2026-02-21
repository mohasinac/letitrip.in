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

import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  Query,
  Transaction,
  WriteBatch,
} from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { serverLogger } from "@/lib/server-logger";
import type {
  FirebaseSieveFields,
  FirebaseSieveOptions,
  FirebaseSieveResult,
  SieveModel,
} from "@/lib/query/firebase-sieve";
import { applySieveToFirestore } from "@/lib/query/firebase-sieve";

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
   * Note: Child classes can override with stricter input types
   */
  async create(data: Partial<T> | any): Promise<T> {
    try {
      const cleanData = prepareForFirestore({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const docRef = await this.getCollection().add(cleanData);

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
      const now = new Date();
      const cleanData = prepareForFirestore({
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      serverLogger.debug(
        `Creating document with ID: ${id} in collection: ${this.collection}`,
      );

      await this.getCollection().doc(id).set(cleanData);

      serverLogger.info(`Document created successfully: ${id}`);

      const doc = await this.getCollection().doc(id).get();
      return { id: doc.id, ...doc.data() } as unknown as T;
    } catch (error: any) {
      serverLogger.error(`Failed to create document with ID: ${id}`, {
        collection: this.collection,
        error: error.message,
        code: error.code,
      });
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
      const cleanData = prepareForFirestore({
        ...data,
        updatedAt: new Date(),
      });

      await this.getCollection().doc(id).update(cleanData);

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

  // ---------------------------------------------------------------------------
  // Sieve-powered Firestore query builder
  // All filtering, sorting, and pagination happens at the DB layer.
  // ---------------------------------------------------------------------------

  /**
   * Run a Sieve DSL query (filters / sorts / page / pageSize) against Firestore
   * natively — no in-memory array iteration.
   *
   * Usage in subclasses:
   * ```ts
   * async list(model: SieveModel) {
   *   return this.sieveQuery<ProductDocument>(model, {
   *     title:     { canFilter: true, canSort: true },
   *     createdAt: { canFilter: true, canSort: true },
   *   });
   * }
   * ```
   *
   * To pre-filter before Sieve runs (e.g. scope a query to one user):
   * ```ts
   * return this.sieveQuery<ReviewDocument>(model, fields, {
   *   baseQuery: this.getCollection().where('productId', '==', productId),
   * });
   * ```
   *
   * @param model     Sieve DSL model — parse from `request.nextUrl.searchParams`.
   * @param fields    Field allowlist with `canFilter` / `canSort` flags.
   * @param options   Override processor options or provide a pre-filtered `baseQuery`.
   */
  protected async sieveQuery<TResult extends DocumentData = T>(
    model: SieveModel,
    fields: FirebaseSieveFields,
    options?: FirebaseSieveOptions & {
      baseQuery?: CollectionReference | Query;
    },
  ): Promise<FirebaseSieveResult<TResult>> {
    const { baseQuery, ...sieveOptions } = options ?? {};
    return applySieveToFirestore<TResult>({
      baseQuery: baseQuery ?? this.getCollection(),
      model,
      fields,
      options: sieveOptions,
    });
  }

  // ---------------------------------------------------------------------------
  // Transaction-aware methods
  // Use these inside a UnitOfWork.runTransaction() callback.
  // NOTE: In Firestore transactions all reads must precede all writes.
  // ---------------------------------------------------------------------------

  /**
   * Read a document inside a transaction.
   */
  async findByIdInTx(tx: Transaction, id: string): Promise<T | null> {
    const docRef = this.getCollection().doc(id);
    const snap = await tx.get(docRef);
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as unknown as T;
  }

  /**
   * Read a document inside a transaction or throw if not found.
   */
  async findByIdOrFailInTx(tx: Transaction, id: string): Promise<T> {
    const doc = await this.findByIdInTx(tx, id);
    if (!doc) throw new NotFoundError(`Document not found: ${id}`);
    return doc;
  }

  /**
   * Stage a create (auto-generated ID) inside a transaction.
   * Returns the new DocumentReference so callers can chain writes to it.
   */
  createInTx(tx: Transaction, data: Partial<T> | any): DocumentReference {
    const docRef = this.getCollection().doc();
    const now = new Date();
    tx.set(
      docRef,
      prepareForFirestore({ ...data, createdAt: now, updatedAt: now }),
    );
    return docRef;
  }

  /**
   * Stage a create with an explicit ID inside a transaction.
   */
  createWithIdInTx(
    tx: Transaction,
    id: string,
    data: Partial<T> | any,
  ): DocumentReference {
    const docRef = this.getCollection().doc(id);
    const now = new Date();
    tx.set(
      docRef,
      prepareForFirestore({ ...data, createdAt: now, updatedAt: now }),
    );
    return docRef;
  }

  /**
   * Stage an update inside a transaction.
   */
  updateInTx(tx: Transaction, id: string, data: Partial<T>): void {
    const docRef = this.getCollection().doc(id);
    tx.update(
      docRef,
      prepareForFirestore({ ...data, updatedAt: new Date() }) as any,
    );
  }

  /**
   * Stage a delete inside a transaction.
   */
  deleteInTx(tx: Transaction, id: string): void {
    const docRef = this.getCollection().doc(id);
    tx.delete(docRef);
  }

  // ---------------------------------------------------------------------------
  // Batch-aware methods
  // Use these inside a UnitOfWork.runBatch() callback.
  // Batches support writes only – use runTransaction() when reads are needed.
  // ---------------------------------------------------------------------------

  /**
   * Stage a create (auto-generated ID) in a batch.
   * Returns the DocumentReference so callers can reference it elsewhere.
   */
  createInBatch(batch: WriteBatch, data: Partial<T> | any): DocumentReference {
    const docRef = this.getCollection().doc();
    const now = new Date();
    batch.set(
      docRef,
      prepareForFirestore({ ...data, createdAt: now, updatedAt: now }),
    );
    return docRef;
  }

  /**
   * Stage a create with an explicit ID in a batch.
   */
  createWithIdInBatch(
    batch: WriteBatch,
    id: string,
    data: Partial<T> | any,
  ): void {
    const docRef = this.getCollection().doc(id);
    const now = new Date();
    batch.set(
      docRef,
      prepareForFirestore({ ...data, createdAt: now, updatedAt: now }),
    );
  }

  /**
   * Stage an update in a batch.
   */
  updateInBatch(batch: WriteBatch, id: string, data: Partial<T>): void {
    const docRef = this.getCollection().doc(id);
    batch.update(
      docRef,
      prepareForFirestore({ ...data, updatedAt: new Date() }) as any,
    );
  }

  /**
   * Stage a delete in a batch.
   */
  deleteInBatch(batch: WriteBatch, id: string): void {
    const docRef = this.getCollection().doc(id);
    batch.delete(docRef);
  }
}
