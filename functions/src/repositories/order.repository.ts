import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import {
  COLLECTIONS,
  QUERY_LIMIT,
  ORDER_TIMEOUT_HOURS,
} from "../config/constants";
import { getBusinessDayCutoff } from "../utils/businessDay";
import { decryptPiiFields, encryptPii } from "../lib/pii";

const ORDER_PII_FIELDS = [
  "userName",
  "userEmail",
  "sellerEmail",
] as const;

export interface OrderRow {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
}

export interface CreateOrderFromAuctionInput {
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  auctionProductId: string;
}

export const orderRepository = {
  /** Orders that are pending payment and older than ORDER_TIMEOUT_HOURS. */
  async getTimedOutPending(): Promise<
    Array<{ id: string; ref: DocumentReference; data: OrderRow }>
  > {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - ORDER_TIMEOUT_HOURS);

    const snap = await db
      .collection(COLLECTIONS.ORDERS)
      .where("status", "==", "pending")
      .where("paymentStatus", "==", "pending")
      .where("createdAt", "<", cutoff)
      .limit(QUERY_LIMIT)
      .get();

    return snap.docs.map((d) => ({
      id: d.id,
      ref: d.ref,
      data: decryptPiiFields(
        { id: d.id, ...d.data() },
        ORDER_PII_FIELDS,
      ) as OrderRow,
    }));
  },

  /**
   * Orders eligible to be bundled into a weekly payout:
   * delivered via Shiprocket with payoutStatus still 'eligible'.
   */
  async getEligibleShiprocket(): Promise<
    Array<{
      id: string;
      ref: DocumentReference;
      data: OrderRow & {
        sellerId: string;
        totalPrice: number;
        payoutStatus: string;
        shippingMethod: string;
      };
    }>
  > {
    const snap = await db
      .collection(COLLECTIONS.ORDERS)
      .where("payoutStatus", "==", "eligible")
      .where("shippingMethod", "==", "shiprocket")
      .where("status", "==", "delivered")
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => ({
      id: d.id,
      ref: d.ref,
      data: decryptPiiFields(
        { id: d.id, ...d.data() },
        ORDER_PII_FIELDS,
      ) as OrderRow & {
        sellerId: string;
        totalPrice: number;
        payoutStatus: string;
        shippingMethod: string;
      },
    }));
  },

  /** Mark orders as having a payout requested, recording the payoutId. */
  markPayoutRequested(
    batch: FirebaseFirestore.WriteBatch,
    ref: DocumentReference,
    payoutId: string,
  ): void {
    batch.update(ref, {
      payoutStatus: "requested",
      payoutId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  /**
   * Orders eligible for automatic daily payout:
   * delivered with payoutStatus='eligible', updated more than windowDays
   * business days ago (business day = 10:00 AM IST boundary).
   */
  async getEligibleAutomatic(windowDays: number): Promise<
    Array<{
      id: string;
      ref: DocumentReference;
      data: OrderRow & { sellerId: string; totalPrice: number };
    }>
  > {
    const cutoff = getBusinessDayCutoff(windowDays);
    const snap = await db
      .collection(COLLECTIONS.ORDERS)
      .where("payoutStatus", "==", "eligible")
      .where("status", "==", "delivered")
      .where("updatedAt", "<=", cutoff)
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => ({
      id: d.id,
      ref: d.ref,
      data: decryptPiiFields(
        { id: d.id, ...d.data() },
        ORDER_PII_FIELDS,
      ) as OrderRow & {
        sellerId: string;
        totalPrice: number;
      },
    }));
  },

  cancelInBatch(
    batch: FirebaseFirestore.WriteBatch,
    ref: DocumentReference,
  ): void {
    batch.update(ref, {
      status: "cancelled",
      cancellationDate: new Date(),
      cancellationReason: "payment_timeout",
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  createFromAuction(
    batch: FirebaseFirestore.WriteBatch,
    input: CreateOrderFromAuctionInput,
  ): DocumentReference {
    const ref = db.collection(COLLECTIONS.ORDERS).doc();
    batch.create(ref, {
      id: ref.id,
      productId: input.productId,
      productTitle: input.productTitle,
      userId: input.userId,
      userName: encryptPii(input.userName),
      userEmail: encryptPii(input.userEmail),
      quantity: 1,
      unitPrice: input.amount,
      totalPrice: input.amount,
      currency: input.currency,
      status: "confirmed",
      paymentStatus: "pending",
      orderDate: new Date(),
      notes: `Won via auction bid — auction product ${input.auctionProductId}`,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return ref;
  },
};
