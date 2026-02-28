import { type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { COLLECTIONS, QUERY_LIMIT } from "../config/constants";

export const tokenRepository = {
  /** Email-verification token refs whose `expiresAt` is in the past. */
  async getExpiredEmailVerificationRefs(
    now: Date,
  ): Promise<DocumentReference[]> {
    const snap = await db
      .collection(COLLECTIONS.EMAIL_VERIFICATION_TOKENS)
      .where("expiresAt", "<", now)
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => d.ref);
  },

  /** Password-reset token refs whose `expiresAt` is in the past. */
  async getExpiredPasswordResetRefs(now: Date): Promise<DocumentReference[]> {
    const snap = await db
      .collection(COLLECTIONS.PASSWORD_RESET_TOKENS)
      .where("expiresAt", "<", now)
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => d.ref);
  },
};
