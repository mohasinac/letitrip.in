import { db } from "../config/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "../config/constants";
import { decryptPii } from "../lib/pii";

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
    const data = snap.data()!;
    const result: SellerPayoutDetails = {
      uid: snap.id,
      displayName: decryptPii(data.displayName as string) as string | undefined,
      email: decryptPii(data.email as string) as string | undefined,
      payoutDetails: data.payoutDetails
        ? {
            method: (data.payoutDetails as Record<string, unknown>).method as
              | "upi"
              | "bank_transfer"
              | undefined,
            upiId: decryptPii(
              (data.payoutDetails as Record<string, unknown>).upiId as string,
            ) as string | undefined,
            bankAccount: (data.payoutDetails as Record<string, unknown>)
              .bankAccount
              ? {
                  accountHolderName: decryptPii(
                    (
                      (data.payoutDetails as Record<string, unknown>)
                        .bankAccount as Record<string, string>
                    ).accountHolderName,
                  ) as string,
                  accountNumberMasked: decryptPii(
                    (
                      (data.payoutDetails as Record<string, unknown>)
                        .bankAccount as Record<string, string>
                    ).accountNumberMasked,
                  ) as string,
                  ifscCode: (
                    (data.payoutDetails as Record<string, unknown>)
                      .bankAccount as Record<string, string>
                  ).ifscCode,
                  bankName: (
                    (data.payoutDetails as Record<string, unknown>)
                      .bankAccount as Record<string, string>
                  ).bankName,
                }
              : undefined,
          }
        : undefined,
    };
    return result;
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
