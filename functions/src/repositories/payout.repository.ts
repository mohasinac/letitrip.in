import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { COLLECTIONS, QUERY_LIMIT } from "../config/constants";

export interface PayoutRow {
  id: string;
  sellerId: string;
  sellerEmail: string;
  amount: number;
  currency: string;
  upiId?: string;
  bankAccount?: {
    accountNumberMasked: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  paymentMethod: "bank_transfer" | "upi";
  failureCount?: number;
  orderIds: string[];
}

export const payoutRepository = {
  /** All payouts with status === "pending". */
  async getPending(): Promise<
    Array<{ id: string; ref: DocumentReference; data: PayoutRow }>
  > {
    const snap = await db
      .collection(COLLECTIONS.PAYOUTS)
      .where("status", "==", "pending")
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => ({
      id: d.id,
      ref: d.ref,
      data: { id: d.id, ...d.data() } as PayoutRow,
    }));
  },

  markProcessing(
    ref: DocumentReference,
  ): Promise<FirebaseFirestore.WriteResult> {
    return ref.update({
      status: "processing",
      processedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  recordSuccess(
    ref: DocumentReference,
    razorpayPayoutId: string,
    razorpayStatus: string,
  ): Promise<FirebaseFirestore.WriteResult> {
    return ref.update({
      razorpayPayoutId,
      razorpayStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  recordFailure(
    ref: DocumentReference,
    failureCount: number,
    reason: string,
    isFinal: boolean,
  ): Promise<FirebaseFirestore.WriteResult> {
    return ref.update({
      status: isFinal ? "failed" : "pending",
      failureCount,
      lastFailureReason: reason,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },
};
