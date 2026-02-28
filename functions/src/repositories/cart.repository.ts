import { type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { COLLECTIONS, QUERY_LIMIT, CART_TTL_DAYS } from "../config/constants";

export const cartRepository = {
  /** Cart refs not updated for more than CART_TTL_DAYS. */
  async getStaleRefs(): Promise<DocumentReference[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CART_TTL_DAYS);

    const snap = await db
      .collection(COLLECTIONS.CARTS)
      .where("updatedAt", "<", cutoff)
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => d.ref);
  },
};
