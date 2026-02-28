import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { COLLECTIONS, QUERY_LIMIT } from "../config/constants";

export const couponRepository = {
  /** Active coupons whose `validity.endDate` is at or before `now`. */
  async getExpiredActiveRefs(now: Date): Promise<DocumentReference[]> {
    const snap = await db
      .collection(COLLECTIONS.COUPONS)
      .where("validity.isActive", "==", true)
      .where("validity.endDate", "<=", now)
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => d.ref);
  },

  deactivateInBatch(
    batch: FirebaseFirestore.WriteBatch,
    ref: DocumentReference,
  ): void {
    batch.update(ref, {
      "validity.isActive": false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },
};
