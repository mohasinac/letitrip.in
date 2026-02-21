/**
 * Payout Repository
 *
 * Data access layer for payout documents in Firestore.
 * Handles seller payout requests and admin payout processing.
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import type { SieveModel, FirebaseSieveResult } from "@/lib/query";
import type {
  PayoutDocument,
  PayoutCreateInput,
  PayoutStatus,
  PayoutUpdateInput,
} from "@/db/schema";
import { PAYOUT_COLLECTION, PAYOUT_FIELDS } from "@/db/schema";

class PayoutRepository extends BaseRepository<PayoutDocument> {
  constructor() {
    super(PAYOUT_COLLECTION);
  }

  /**
   * Create a new payout request
   */
  async create(input: PayoutCreateInput): Promise<PayoutDocument> {
    const now = new Date();
    const id = `payout-${input.sellerId.slice(0, 8)}-${Date.now()}`;

    const data: Omit<PayoutDocument, "id"> = {
      ...input,
      status: "pending",
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(data));

    return { id, ...data };
  }

  /**
   * Find all payouts for a specific seller, newest first
   */
  async findBySeller(sellerId: string): Promise<PayoutDocument[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where(PAYOUT_FIELDS.SELLER_ID, "==", sellerId)
      .orderBy(PAYOUT_FIELDS.CREATED_AT, "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PayoutDocument[];
  }

  /**
   * Find payouts by status
   */
  async findByStatus(status: PayoutStatus): Promise<PayoutDocument[]> {
    return this.findBy(PAYOUT_FIELDS.STATUS, status);
  }

  /**
   * Find all pending payouts across all sellers (for admin processing)
   */
  async findPending(): Promise<PayoutDocument[]> {
    return this.findByStatus("pending");
  }

  /**
   * Update payout status (admin action)
   */
  async updateStatus(
    payoutId: string,
    status: PayoutStatus,
    extra?: PayoutUpdateInput,
  ): Promise<PayoutDocument> {
    return this.update(payoutId, {
      status,
      ...extra,
      ...(status === "completed" || status === "failed"
        ? { processedAt: new Date() }
        : {}),
      updatedAt: new Date(),
    });
  }

  /**
   * Get all order IDs that have already been paid out for a seller.
   * Used to avoid double-paying the same orders.
   */
  async getPaidOutOrderIds(sellerId: string): Promise<Set<string>> {
    const snapshot = await this.db
      .collection(this.collection)
      .where(PAYOUT_FIELDS.SELLER_ID, "==", sellerId)
      .where(PAYOUT_FIELDS.STATUS, "in", ["pending", "processing", "completed"])
      .get();

    const ids = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as PayoutDocument;
      (data.orderIds ?? []).forEach((oid) => ids.add(oid));
    });
    return ids;
  }

  // ---------------------------------------------------------------------------
  // Sieve-powered list query
  // ---------------------------------------------------------------------------

  static readonly SIEVE_FIELDS = {
    id: { canFilter: true, canSort: false },
    sellerId: { canFilter: true, canSort: false },
    sellerName: { canFilter: true, canSort: true },
    status: { canFilter: true, canSort: true },
    amount: { canFilter: true, canSort: true },
    createdAt: { canFilter: true, canSort: true },
    processedAt: { canFilter: true, canSort: true },
  };

  /**
   * Paginated, Firestore-native payout list (admin use).
   */
  async list(model: SieveModel): Promise<FirebaseSieveResult<PayoutDocument>> {
    return this.sieveQuery<PayoutDocument>(
      model,
      PayoutRepository.SIEVE_FIELDS,
      {
        defaultPageSize: 50,
        maxPageSize: 200,
      },
    );
  }
}

// Export singleton instance
export const payoutRepository = new PayoutRepository();
