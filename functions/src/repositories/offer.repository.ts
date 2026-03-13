import { db } from "../config/firebase-admin";
import { COLLECTIONS, BATCH_LIMIT } from "../config/constants";

export interface OfferRow {
  id: string;
  buyerUid: string;
  sellerId: string;
  productId: string;
  productTitle: string;
  offerAmount: number;
  counterAmount?: number;
  lockedPrice?: number;
  status: string;
  expiresAt: FirebaseFirestore.Timestamp | Date;
}

export const offerRepository = {
  /**
   * Returns all pending or countered offers whose expiresAt is in the past.
   * Used by the offerExpiry scheduled job.
   */
  async findExpiredActive(now: Date): Promise<OfferRow[]> {
    const snap = await db
      .collection(COLLECTIONS.OFFERS)
      .where("status", "in", ["pending", "countered"])
      .where("expiresAt", "<=", now)
      .limit(BATCH_LIMIT)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as OfferRow);
  },

  /**
   * Batch-marks the given offer IDs as "expired".
   */
  async expireMany(offerIds: string[]): Promise<void> {
    const batches: string[][] = [];
    for (let i = 0; i < offerIds.length; i += 499) {
      batches.push(offerIds.slice(i, i + 499));
    }
    await Promise.all(
      batches.map((ids) => {
        const batch = db.batch();
        const now = new Date();
        for (const id of ids) {
          batch.update(db.collection(COLLECTIONS.OFFERS).doc(id), {
            status: "expired",
            updatedAt: now,
          });
        }
        return batch.commit();
      }),
    );
  },
};
