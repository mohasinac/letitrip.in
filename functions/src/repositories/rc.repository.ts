import { db } from "../config/firebase-admin";
import { COLLECTIONS } from "../config/constants";
import { randomUUID } from "crypto";

export type RCTransactionType =
  | "purchase"
  | "engage"
  | "release"
  | "forfeit"
  | "return"
  | "refund"
  | "admin_grant"
  | "admin_deduct"
  | "earn_purchase"
  | "earn_event";

export interface CreateRCTransactionInput {
  userId: string;
  type: RCTransactionType;
  coins: number;
  balanceBefore: number;
  balanceAfter: number;
  productId?: string;
  productTitle?: string;
  notes?: string;
}

export const rcRepository = {
  async create(input: CreateRCTransactionInput): Promise<void> {
    const id = randomUUID();
    await db
      .collection(COLLECTIONS.RC_TRANSACTIONS)
      .doc(id)
      .set({
        ...input,
        createdAt: new Date(),
      });
  },
};
