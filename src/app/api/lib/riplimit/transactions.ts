/**
 * RipLimit Transaction Database Operations
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Handles credit operations and transaction history.
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/constants/database";
import {
  RipLimitAccountBE,
  RipLimitTransactionBE,
  RipLimitTransactionType,
  RipLimitTransactionStatus,
  ripLimitToInr,
} from "@/types/backend/riplimit.types";

/**
 * Credit RipLimit to user account (purchase, admin adjustment)
 */
export async function creditBalance(
  userId: string,
  amount: number,
  type: RipLimitTransactionType,
  description: string,
  metadata?: Record<string, unknown>
): Promise<RipLimitTransactionBE> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);

  const transaction = await db.runTransaction(async (t) => {
    const accountDoc = await t.get(accountRef);
    let account: RipLimitAccountBE;

    if (!accountDoc.exists) {
      // Create account if it doesn't exist
      const now = Timestamp.now();
      account = {
        userId,
        availableBalance: 0,
        blockedBalance: 0,
        lifetimePurchases: 0,
        lifetimeSpent: 0,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        strikes: 0,
        isBlocked: false,
        createdAt: now as unknown as import("@/types/shared/common.types").FirebaseTimestamp,
        updatedAt: now as unknown as import("@/types/shared/common.types").FirebaseTimestamp,
      };
      t.set(accountRef, account);
    } else {
      account = { userId, ...accountDoc.data() } as RipLimitAccountBE;
    }

    const newBalance = account.availableBalance + amount;
    const newLifetimePurchases =
      type === RipLimitTransactionType.PURCHASE
        ? account.lifetimePurchases + amount
        : account.lifetimePurchases;

    // Update account
    t.update(accountRef, {
      availableBalance: newBalance,
      lifetimePurchases: newLifetimePurchases,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create transaction record
    const transactionRef = db.collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS).doc();
    const transactionRecord: Omit<RipLimitTransactionBE, "id"> = {
      userId,
      type,
      amount,
      inrAmount: ripLimitToInr(amount),
      balanceAfter: newBalance,
      status: RipLimitTransactionStatus.COMPLETED,
      description,
      metadata,
      createdAt: Timestamp.now() as unknown as import("@/types/shared/common.types").FirebaseTimestamp,
    };
    t.set(transactionRef, transactionRecord);

    return { id: transactionRef.id, ...transactionRecord };
  });

  return transaction as RipLimitTransactionBE;
}

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(
  userId: string,
  options: {
    type?: RipLimitTransactionType;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ transactions: RipLimitTransactionBE[]; total: number }> {
  const db = getFirestoreAdmin();
  let query = db
    .collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc");

  if (options.type) {
    query = query.where("type", "==", options.type);
  }

  // Get total count
  const countSnapshot = await query.count().get();
  const total = countSnapshot.data().count;

  // Apply pagination
  if (options.offset) {
    query = query.offset(options.offset);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();
  const transactions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RipLimitTransactionBE[];

  return { transactions, total };
}
