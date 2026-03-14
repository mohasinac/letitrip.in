import { db } from "../config/firebase-admin";
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
};
