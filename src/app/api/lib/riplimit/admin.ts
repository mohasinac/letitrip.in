/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/riplimit/admin
 * @description This file contains functionality related to admin
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * RipLimit Admin Database Operations
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Handles admin-only operations.
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import {
  RipLimitAccountBE,
  RipLimitBlockedBidBE,
  RipLimitTransactionBE,
  RipLimitTransactionType,
  RipLimitTransactionStatus,
  RipLimitPurchaseBE,
  RipLimitPurchaseStatus,
  RipLimitRefundBE,
  RipLimitRefundStatus,
  ripLimitToInr,
} from "@/types/backend/riplimit.types";
import { creditBalance } from "./transactions";

/**
 * Get admin stats
 */
/**
 * Retrieves admin stats
 *
 * @returns {Promise<any>} Promise resolving to adminstats result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAdminStats();
 */

/**
 * Retrieves admin stats
 *
 * @returns {Promise<any>} Promise resolving to adminstats result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAdminStats();
 */

export async function getAdminStats(): Promise<{
  /** Total Circulation */
  totalCirculation: number;
  /** Total Available */
  totalAvailable: number;
  /** Total Blocked */
  totalBlocked: number;
  /** Total Revenue */
  totalRevenue: number;
  /** Total Refunded */
  totalRefunded: number;
  /** Net Revenue */
  netRevenue: number;
  /** User Count */
  userCount: number;
  /** Unpaid User Count */
  unpaidUserCount: number;
}> {
  const db = getFirestoreAdmin();

  // Get all accounts
  const accountsSnapshot = await db
    .collection(COLLECTIONS.RIPLIMIT_ACCOUNTS)
    .get();

  let totalAvailable = 0;
  let totalBlocked = 0;
  /**
 * Performs unpaid user count operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The unpaidusercount result
 *
 */
let unpaidUserCount = 0;

  accountsSnapshot.docs.forEach((doc) => {
    const account = doc.data() as RipLimitAccountBE;
    totalAvailable += account.availableBalance;
    totalBlocked += account.blockedBalance;
    if (account.hasUnpaidAuctions) {
      unpaidUserCount++;
    }
  });

  // Get purchase totals
  const purchasesSnapshot = awai/**
 * Performs total revenue operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The totalrevenue result
 *
 */
t db
    .collection(COLLECTIONS.RIPLIMIT_PURCHASES)
    .where("status", "==", RipLimitPurchaseStatus.COMPLETED)
    .get();

  let totalRevenue = 0;
  purchasesSnapshot.docs.forEach((doc) => {/**
 * Performs total refunded operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The totalrefunded result
 *
 */

    totalRevenue += (doc.data() as RipLimitPurchaseBE).inrAmount;
  });

  // Get refund totals
  const refundsSnapshot = await db
    .collection(COLLECTIONS.RIPLIMIT_REFUNDS)
    .where("status", "==", RipLimitRefundStatus.COMPLETED)
    .get();

  let totalRefunded = 0;
  refundsSnapshot.docs.forEach((doc) => {
    totalRefunded += (doc.data() as RipLimitRefundBE).netAmount;
  });

  return {
    /** Total Circulation */
    totalCirculation: totalAvailable + totalBlocked,
    totalAvailable,
    totalBlocked,
    totalRevenue,
    totalRefunded,
    /** Net Revenue */
    netRevenue: totalRevenue - totalRefunded,
    /** User Count */
    userCount: accountsSnapshot.size,
    unpaidUserCount,
  };
}

/**
 * Admin adjust user balance
 */
/**
 * Performs admin adjust balance operation
 *
 * @returns {Promise<any>} Promise resolving to adminadjustbalance result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * adminAdjustBalance();
 */

/**
 * Performs admin adjust balance operation
 *
 * @returns {Promise<any>} Promise resolving to adminadjustbalance result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * adminAdjustBalance();
 */

export async function adminAdjustBalance(
  /** User Id */
  userId: string,
  /** Amount */
  amount: number,
  /** Reason */
  reason: string,
  /** Admin Id */
  adminId: string,
): Promise<RipLimitTransactionBE> {
  return creditBalance(
    userId,
    amount,
    RipLimitTransactionType.ADJUSTMENT,
    reason,
    {
      /** Adjusted By */
      adjustedBy: adminId,
      reason,
    },
  );
}

/**
 * Admin clear unpaid auction flag
 */
/**
 * Performs admin clear unpaid auction operation
 *
 * @param {string} userId - user identifier
 * @param {string} auctionId - auction identifier
 * @param {string} adminId - admin identifier
 *
 * @returns {Promise<any>} Promise resolving to adminclearunpaidauction result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * adminClearUnpaidAuction("example", "example", "example");
 */

/**
 * Performs admin clear unpaid auction operation
 *
 * @returns {Promise<any>} Pro/**
 * Performs account ref operation
 *
 * @param {any} COLLECTIONS.RIPLIMIT_ACCOUNTS - The collections.riplimit_accounts
 *
 * @returns {Promise<any>} The accountref result
 *
 */
mise resolving to adminclearunpaidauction result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * adminClearUnpaidAuction();
 */

export async function adminClearUnpaidAuction(
  /** User Id */
  userId: string,
  /** Auction Id */
  auctionId: string,
  /** Admin Id */
  adminId: string,
): Promise<void> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);

  await db.runTransaction(async (t) => {
    const accountDoc = await t.get(accountRef);
    const account = accountDoc.data() as RipLimitAccountBE;

    const newUnpaidIds = account.unpaidAuctionIds.filter(
      (id) => id !== auctionId,
    );

    t.update(accountRef, {
      /** Unpaid Auction Ids */
      unpaidAuctionIds: newUnpaidIds,
      /** Has Unpaid Auctions */
      hasUnpaidAuctions: newUnpaidIds.length > 0,
      /** Updated At */
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Release any blocked RipLimit for this auction
    const blockedBidRef = accountRef
      .collection(SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS)
      .doc(auctionId);
    const blockedBidDoc = await t.get(blockedBidRef);

    if (blockedBidDoc.exists) {
      const blockedBid = blockedBidDoc.data() as RipLimitBlockedBidBE;
      t.update(accountRef, {
        /** Available Balance */
        availableBalance: FieldValue.increment(blockedBid.amount),
        /** Blocked Balance */
        blockedBalance: FieldValue.increment(-blockedBid.amount),
      });
      t.delete(blockedBidRef);

      // Create transaction record
      const transactionRef = db
        .collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS)
        .doc();
      t.set(transactionRef, {
        userId,
        /** Type */
        type: RipLimitTransactionType.BID_RELEASE,
        /** Amount */
        amount: blockedBid.amount,
        /** Inr Amount */
        inrAmount: ripLimitToInr(blockedBid.amount),
        /** Balance After */
        balanceAfter: account.availableBalance + blockedBid.amount,
        auctionId,
        /** Status */
        status: RipLimitTransactionStatus.COMPLETED,
        /** Description */
        description: `Admin cleared unpaid auction`,
        /** Metadata */
        metadata: { clearedBy: adminId },
        /** Created At */
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });
}

/**
 * Get user account details for admin
 */
/**
 * Retrieves admin user details
 *
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to adminuserdetails result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAdminUserDetails("example");
 */

/**
 * Retrieves admin user details
 *
 * @param {string} /** User Id */
  userId - /** User Id */
  user identifier
 *
 * @returns {Promise<any>} Promise resolving to adminuserdetails result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAdminUserDetails("example");
 */

/**
 * Retrieves admin user details
 *
 * @param {string} userId - The userid
 *
 * @returns {Promise<RipLimitAccountBE | null>} The getadminuserdetails result
 *
 * @example
 * getAdminUserDetails("example");
 */
export async function getAdminUserDetails(
  /** User Id */
  userId: string,
): Promise<RipLimitAccountBE | null> {
  const db = getFirestoreAdmin();
  const accountDoc = await db
    .collection(COLLECTIONS.RIPLIMIT_ACCOUNTS)
    .doc(userId)
    .get();

  if (!accountDoc.exists) {
    return null;
  }

  return { userId, ...accountDoc.data() } as RipLimitAccountBE;
}

/**
 * List all user accounts with pagination for admin
 */
/**
 * Performs list all accounts operation
 *
 * @returns {Promise<any>} Promise resolving to listallaccounts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * listAllAccounts();
 */

/**
 * Performs list all accounts operation
 *
 * @returns {Promise<any>} Promise resolving to listallaccounts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * listAllAccounts();
 */

export async function listAllAccounts(
  /** Options */
  options: {
    /** Limit */
    limit?: number;
    /** Offset */
    offset?: number;
    /** Filter */
    filter?: "unpaid" | "blocked" | "all";
  } = {},
): Promise<{ accounts: RipLimitAccountBE[]; total: number }> {
  const db = getFirestoreAdmin();
  let query = db
    .collection(COLLECTIONS.RIPLIMIT_ACCOUNTS)
    .orderBy("createdAt", "de/**
 * Performs accounts operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The accounts result
 *
 */
sc");

  if (options.filter === "unpaid") {
    query = query.where("hasUnpaidAuctions", "==", true) as typeof query;
  } else if (options.filter === "blocked") {
    query = query.where("isBlocked", "==", true) as typeof query;
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
  const accounts = snapshot.docs.map((doc) => ({
    /** User Id */
    userId: doc.id,
    ...doc.data(),
  })) as RipLimitAccountBE[];

  return { accounts, total };
}
