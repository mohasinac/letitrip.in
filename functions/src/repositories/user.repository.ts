import { db } from "../config/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "../config/constants";

export interface SellerPayoutDetails {
  uid: string;
  displayName?: string;
  email?: string;
  payoutDetails?: {
    method?: "upi" | "bank_transfer";
    upiId?: string;
    bankAccount?: {
      accountHolderName: string;
      accountNumberMasked: string;
      ifscCode: string;
      bankName: string;
    };
  };
}

export interface UserRC {
  uid: string;
  rcBalance: number;
  engagedRC: number;
}

export const userRepository = {
  async findById(uid: string): Promise<SellerPayoutDetails | null> {
    const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    if (!snap.exists) return null;
    return { uid: snap.id, ...snap.data() } as SellerPayoutDetails;
  },

  async findRCBalance(uid: string): Promise<UserRC | null> {
    const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    if (!snap.exists) return null;
    const data = snap.data()!;
    return {
      uid: snap.id,
      rcBalance: data.rcBalance ?? 0,
      engagedRC: data.engagedRC ?? 0,
    };
  },

  /**
   * Atomically adjust RC balance fields.
   * @param balanceDelta — positive to credit, negative to debit
   * @param engagedDelta — positive to lock, negative to release
   */
  async incrementRCBalance(
    uid: string,
    balanceDelta: number,
    engagedDelta: number = 0,
  ): Promise<void> {
    const updateFields: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (balanceDelta !== 0) {
      updateFields["rcBalance"] = FieldValue.increment(balanceDelta);
    }
    if (engagedDelta !== 0) {
      updateFields["engagedRC"] = FieldValue.increment(engagedDelta);
    }
    await db.collection(COLLECTIONS.USERS).doc(uid).update(updateFields);
  },
};
