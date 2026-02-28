import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { COLLECTIONS } from "../config/constants";

export interface BidRow {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  bidAmount: number;
  currency: string;
  isWinning: boolean;
  status: string;
  failureCount?: number;
}

export const bidRepository = {
  /** All active bids for a product, ordered highest first. */
  async getActiveByProduct(
    productId: string,
  ): Promise<Array<{ id: string; ref: DocumentReference; data: BidRow }>> {
    const snap = await db
      .collection(COLLECTIONS.BIDS)
      .where("productId", "==", productId)
      .where("status", "==", "active")
      .orderBy("bidAmount", "desc")
      .get();
    return snap.docs.map((d) => ({
      id: d.id,
      ref: d.ref,
      data: { id: d.id, ...d.data() } as BidRow,
    }));
  },

  /** The single currently-winning bid for a product (at most 1). */
  async getWinningBid(
    productId: string,
  ): Promise<{ ref: DocumentReference; data: BidRow } | null> {
    const snap = await db
      .collection(COLLECTIONS.BIDS)
      .where("productId", "==", productId)
      .where("isWinning", "==", true)
      .where("status", "==", "active")
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { ref: d.ref, data: { id: d.id, ...d.data() } as BidRow };
  },

  markWon(batch: FirebaseFirestore.WriteBatch, ref: DocumentReference): void {
    batch.update(ref, {
      status: "won",
      isWinning: true,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  markLost(batch: FirebaseFirestore.WriteBatch, ref: DocumentReference): void {
    batch.update(ref, {
      status: "lost",
      isWinning: false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  markOutbid(
    batch: FirebaseFirestore.WriteBatch,
    ref: DocumentReference,
  ): void {
    batch.update(ref, {
      status: "outbid",
      isWinning: false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  markWinning(
    batch: FirebaseFirestore.WriteBatch,
    ref: DocumentReference,
  ): void {
    batch.update(ref, {
      isWinning: true,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },
};
