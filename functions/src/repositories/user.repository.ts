import { db } from "../config/firebase-admin";
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

export const userRepository = {
  async findById(uid: string): Promise<SellerPayoutDetails | null> {
    const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    if (!snap.exists) return null;
    return { uid: snap.id, ...snap.data() } as SellerPayoutDetails;
  },
};
