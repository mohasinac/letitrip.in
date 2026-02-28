import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { COLLECTIONS, QUERY_LIMIT } from "../config/constants";

export interface AuctionProductRow {
  id: string;
  title: string;
  sellerId: string;
  currentBid?: number;
  startingBid?: number;
  currency: string;
}

export const productRepository = {
  /** Products whose auction has ended and are still published. */
  async getExpiredAuctions(
    now: Date,
  ): Promise<
    Array<{ id: string; ref: DocumentReference; data: AuctionProductRow }>
  > {
    const snap = await db
      .collection(COLLECTIONS.PRODUCTS)
      .where("isAuction", "==", true)
      .where("auctionEndDate", "<", now)
      .where("status", "==", "published")
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => ({
      id: d.id,
      ref: d.ref,
      data: { id: d.id, ...d.data() } as AuctionProductRow,
    }));
  },

  /** All published products (for stats sync). */
  async getPublishedIds(): Promise<string[]> {
    const snap = await db
      .collection(COLLECTIONS.PRODUCTS)
      .where("status", "==", "published")
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => d.id);
  },

  ref(id: string): DocumentReference {
    return db.collection(COLLECTIONS.PRODUCTS).doc(id);
  },

  async updateStatus(
    batch: FirebaseFirestore.WriteBatch,
    id: string,
    status: string,
  ): Promise<void> {
    batch.update(db.collection(COLLECTIONS.PRODUCTS).doc(id), {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  async updateStats(
    productId: string,
    avgRating: number,
    reviewCount: number,
  ): Promise<void> {
    await db.collection(COLLECTIONS.PRODUCTS).doc(productId).update({
      avgRating,
      reviewCount,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  incrementBidCount(
    batch: FirebaseFirestore.WriteBatch,
    productId: string,
    currentBid: number,
  ): void {
    batch.update(db.collection(COLLECTIONS.PRODUCTS).doc(productId), {
      currentBid,
      bidCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  },
};
