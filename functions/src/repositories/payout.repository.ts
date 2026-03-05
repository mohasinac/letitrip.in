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

export interface CreatePayoutInput {
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  orderIds: string[];
  amount: number;
  grossAmount: number;
  platformFee: number;
  platformFeeRate: number;
  currency: string;
  status: "pending";
  paymentMethod: "upi" | "bank_transfer";
  upiId?: string;
  bankAccount?: {
    accountHolderName: string;
    accountNumberMasked: string;
    ifscCode: string;
    bankName: string;
  };
  notes: string;
  requestedAt: Date;
}

export const payoutRepository = {
  /** Create a new payout record and return its document reference + id. */
  async create(input: CreatePayoutInput): Promise<{ id: string; ref: DocumentReference }> {
    const ref = db.collection(COLLECTIONS.PAYOUTS).doc();
    await ref.set({
      id: ref.id,
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { id: ref.id, ref };
  },

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
