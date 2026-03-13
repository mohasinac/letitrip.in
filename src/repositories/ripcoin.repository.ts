/**
 * RipCoin Repository
 *
 * Data access layer for RipCoin transaction documents in Firestore.
 * Handles the coin ledger: purchases, engagements, releases, forfeits, returns.
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { DatabaseError } from "@/lib/errors";
import type { SieveModel, FirebaseSieveResult } from "@/lib/query";
import type {
  RipCoinTransactionDocument,
  RipCoinTransactionCreateInput,
  RipCoinTransactionType,
} from "@/db/schema";
import { RIPCOIN_COLLECTION, RIPCOIN_SIEVE_FIELDS } from "@/db/schema";

class RipCoinRepository extends BaseRepository<RipCoinTransactionDocument> {
  constructor() {
    super(RIPCOIN_COLLECTION);
  }

  /**
   * Create a new transaction entry (purchase, engage, release, forfeiture, return)
   */
  async create(
    input: RipCoinTransactionCreateInput,
  ): Promise<RipCoinTransactionDocument> {
    const id = this.db.collection(this.collection).doc().id;

    const doc: Omit<RipCoinTransactionDocument, "id"> = {
      ...input,
      createdAt: new Date(),
    };

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(doc));

    return { id, ...doc };
  }

  /**
   * Get all transactions for a user (most recent first), paginated via Sieve
   */
  async listForUser(
    userId: string,
    model: SieveModel,
  ): Promise<FirebaseSieveResult<RipCoinTransactionDocument>> {
    return this.sieveQuery<RipCoinTransactionDocument>(
      model,
      RIPCOIN_SIEVE_FIELDS,
      {
        baseQuery: this.getCollection().where("userId", "==", userId),
      },
    );
  }

  /**
   * Find all transactions for a specific bid (used to look up engaged/released/forfeited coins)
   */
  async findByBid(bidId: string): Promise<RipCoinTransactionDocument[]> {
    try {
      const snap = await this.getCollection()
        .where("bidId", "==", bidId)
        .orderBy("createdAt", "desc")
        .get();

      return snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as RipCoinTransactionDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to find transactions for bid: ${bidId}`,
        error,
      );
    }
  }

  /**
   * Find a transaction by Razorpay order ID (used for payment verification de-duplication)
   */
  async findByRazorpayOrderId(
    razorpayOrderId: string,
  ): Promise<RipCoinTransactionDocument | null> {
    try {
      const snap = await this.getCollection()
        .where("razorpayOrderId", "==", razorpayOrderId)
        .limit(1)
        .get();

      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as RipCoinTransactionDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to find transaction by Razorpay order ID: ${razorpayOrderId}`,
        error,
      );
    }
  }

  /**
   * Find the most recent "engage" transaction for a bid
   * (to know how many coins were locked)
   */
  async findEngageTransactionForBid(
    bidId: string,
  ): Promise<RipCoinTransactionDocument | null> {
    try {
      const snap = await this.getCollection()
        .where("bidId", "==", bidId)
        .where("type", "==", "engage" as RipCoinTransactionType)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as RipCoinTransactionDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to find engage transaction for bid: ${bidId}`,
        error,
      );
    }
  }

  /**
   * Find a single transaction by ID
   */
  async findById(id: string): Promise<RipCoinTransactionDocument | null> {
    try {
      const snap = await this.getCollection().doc(id).get();
      if (!snap.exists) return null;
      return this.mapDoc<RipCoinTransactionDocument>(snap);
    } catch (error) {
      throw new DatabaseError(
        `Failed to find ripcoin transaction: ${id}`,
        error,
      );
    }
  }

  /**
   * Mark a purchase transaction as refunded
   */
  async markRefunded(
    id: string,
    refundedAt: Date,
    razorpayRefundId?: string,
  ): Promise<void> {
    try {
      const update: Record<string, unknown> = { refunded: true, refundedAt };
      if (razorpayRefundId) update.razorpayRefundId = razorpayRefundId;
      await this.getCollection().doc(id).update(update);
    } catch (error) {
      throw new DatabaseError(
        `Failed to mark transaction as refunded: ${id}`,
        error,
      );
    }
  }
}

export const ripcoinRepository = new RipCoinRepository();
