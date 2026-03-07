/**
 * Store Repository
 *
 * Data access layer for the `stores` Firestore collection.
 * One store per seller; identified by storeSlug (used as document ID).
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import type { SieveModel, FirebaseSieveResult } from "@/lib/query";
import {
  StoreDocument,
  STORE_COLLECTION,
  STORE_FIELDS,
  DEFAULT_STORE_DATA,
} from "@/db/schema";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { applySieveToFirestore } from "@/lib/query/firebase-sieve";

export class StoreRepository extends BaseRepository<StoreDocument> {
  constructor() {
    super(STORE_COLLECTION);
  }

  /**
   * Create a new store.
   * The document ID is set to storeSlug for easy URL-based lookups.
   */
  async create(
    input: Omit<StoreDocument, "id" | "createdAt" | "updatedAt">,
  ): Promise<StoreDocument> {
    const storeData: Omit<StoreDocument, "id"> = {
      ...DEFAULT_STORE_DATA,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db
      .collection(this.collection)
      .doc(input.storeSlug)
      .set(prepareForFirestore(storeData));

    return { id: input.storeSlug, ...storeData };
  }

  /**
   * Find a store by its URL slug (also the document ID).
   */
  async findBySlug(storeSlug: string): Promise<StoreDocument | null> {
    return this.findById(storeSlug);
  }

  /**
   * Find the store owned by a specific user UID.
   */
  async findByOwnerId(ownerId: string): Promise<StoreDocument | null> {
    return this.findOneBy(STORE_FIELDS.OWNER_ID, ownerId);
  }

  /**
   * Update store fields (partial).
   */
  async updateStore(
    storeSlug: string,
    data: Partial<
      Omit<StoreDocument, "id" | "storeSlug" | "ownerId" | "createdAt">
    >,
  ): Promise<StoreDocument> {
    return this.update(storeSlug, {
      ...data,
      updatedAt: new Date(),
    } as Partial<StoreDocument>);
  }

  /**
   * Admin: approve or reject a store.
   */
  async setStatus(
    storeSlug: string,
    status: StoreDocument["status"],
  ): Promise<StoreDocument> {
    return this.update(storeSlug, {
      status,
      // Auto-set isPublic when approved
      ...(status === "active" && { isPublic: true }),
      ...(status !== "active" && { isPublic: false }),
      updatedAt: new Date(),
    } as Partial<StoreDocument>);
  }

  /**
   * Paginated list of stores with Sieve filtering/sorting.
   * Filters to active + public stores for the public listing.
   */
  async listStores(
    model: SieveModel,
    activeOnly = true,
  ): Promise<FirebaseSieveResult<StoreDocument>> {
    const sieveFields = {
      [STORE_FIELDS.STORE_NAME]: { canFilter: true, canSort: true },
      [STORE_FIELDS.STORE_CATEGORY]: { canFilter: true, canSort: false },
      [STORE_FIELDS.STATUS]: { canFilter: true, canSort: false },
      [STORE_FIELDS.IS_PUBLIC]: { canFilter: true, canSort: false },
      [STORE_FIELDS.CREATED_AT]: { canFilter: false, canSort: true },
    };

    let baseQuery = this.getCollection() as FirebaseFirestore.Query;
    if (activeOnly) {
      baseQuery = baseQuery
        .where(STORE_FIELDS.STATUS, "==", "active")
        .where(STORE_FIELDS.IS_PUBLIC, "==", true);
    }

    return applySieveToFirestore<StoreDocument>({
      baseQuery,
      model,
      fields: sieveFields,
    });
  }

  /**
   * Admin: list all stores regardless of status.
   */
  async listAllStores(
    model: SieveModel,
  ): Promise<FirebaseSieveResult<StoreDocument>> {
    return this.listStores(model, false);
  }
}

export const storeRepository = new StoreRepository();
