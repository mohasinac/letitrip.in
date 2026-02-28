import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import {
  COLLECTIONS,
  QUERY_LIMIT,
  ORDER_TIMEOUT_HOURS,
} from "../config/constants";

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
      data: { id: d.id, ...d.data() } as OrderRow,
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
      userName: input.userName,
      userEmail: input.userEmail,
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
