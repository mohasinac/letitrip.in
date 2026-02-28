import { type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { COLLECTIONS, QUERY_LIMIT } from "../config/constants";

export const sessionRepository = {
  /** Session docs whose `expiresAt` is in the past. */
  async getExpiredRefs(now: Date): Promise<DocumentReference[]> {
    const snap = await db
      .collection(COLLECTIONS.SESSIONS)
      .where("expiresAt", "<", now)
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => d.ref);
  },
};
