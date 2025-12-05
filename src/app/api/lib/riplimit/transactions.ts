/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/riplimit/transactions
 * @description This file contains functionality related to transactions
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * RipLimit Transaction Database Operations
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Handles credit operations and transaction history.
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { nowAsFirebaseTimestamp } from "@/lib/firebase/timestamp-helpers";
import {
  RipLimitAccountBE,
  RipLimitTransactionBE,
  RipLimitTransactionStatus,
  RipLimitTransactionType,
  ripLimitToInr,
} from "@/types/backend/riplimit.types";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Credit RipLimit to user account (purchase, admin adjustment)
 */
/**
 * Performs credit balance operation
 *
 * @returns {Promise<any>} Promise resolving to creditbalance result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * creditBalance();
 */

/**
 * Performs credit balance operation
 *
 * @returns {Promise<any>} Promise resolving to creditbalance result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * creditBalance();
 */

export async function creditBalance(
  /** User Id */
  userId: string,
  /** Amount */
  amount: number,
  /** Type */
  type: RipLimitTransactionType,
  /** Description */
  description: string,
  /** Metadata */
  metadata?: Record<string, unknown>,
): Promise<RipLimitTransactionBE> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);

  /**
 * Performs transaction operation
 *
 * @param {any} async(t - The async(t
 *
 * @returns {Promise<any>} The transaction result
 *
 */
const transaction = await db.runTransaction(async (t) => {
    const accountDoc = await t.get(accountRef);
    let account: RipLimitAccountBE;

    if (!accountDoc.exists) {
      // Create account if it doesn't exist
      const now = nowAsFirebaseTimestamp();
      account = {
        userId,
        /** Available Balance */
        availableBalance: 0,
        /** Blocked Balance */
        blockedBalance: 0,
        /** Lifetime Purchases */
        lifetimePurchases: 0,
        /** Lifetime Spent */
        lifetimeSpent: 0,
        /** Has Unpaid Auctions */
        hasUnpaidAuctions: false,
        /** Unpaid Auction Ids */
        unpaidAuctionIds: [],
        /** Strikes */
        strikes: 0,
        /** Is Blocked */
        isBlocked: false,
        /** Created At */
        createdAt: now,
        /** Updated At */
        updatedAt: now,
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
      /** Available Balance */
      availableBalance: newBalance,
      /** Lifetime Purchases */
      lifetimePurchases: newLifetimePurchases,
      /** Updated At */
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create transaction record
    const transactionRef = db
      .collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS)
      .doc();
    const transactionRecord: Omit<RipLimitTransactionBE, "id"> = {
      userId,
      type,
      amount,
      /** Inr Amount */
      inrAmount: ripLimitToInr(amount),
      /** Balance After */
      balanceAfter: newBalance,
      /** Status */
      status: RipLimitTransactionStatus.COMPLETED,
      description,
      metadata,
      /** Created At */
      createdAt: nowAsFirebaseTimestamp(),
    };
    t.set(transactionRef, transactionRecord);

    return { id: transactionRef.id, ...transactionRecord };
  });

  return transaction as RipLimitTransactionBE;
}

/**
 * Get transaction history for a user
 */
/**
 * Retrieves transaction history
 *
 * @returns {Promise<any>} Promise resolving to transactionhistory result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getTransactionHistory();
 */

/**
 * Retrieves transaction history
 *
 * @returns {Promise<any>} Promise resolving to transactionhistory result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getTransactionHistory();
 */

export async function getTransactionHistory(
  /** User Id */
  userId: string,
  /** Options */
  options: {
    /** Type */
    type?: RipLimitTransactionType;
    /** Limit */
    limit?: number;
    /** Offset */
    offset?: number;
  } = {},
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
    query = query.offs/**
 * Performs transactions operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The transactions result
 *
 */
et(options.offset);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();
  const transactions = snapshot.docs.map((doc) => ({
    /** Id */
    id: doc.id,
    ...doc.data(),
  })) as RipLimitTransactionBE[];

  return { transactions, total };
}
