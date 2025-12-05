/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/riplimit/account
 * @description This file contains functionality related to account
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * RipLimit Account Database Operations
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Handles account CRUD operations for RipLimit.
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { nowAsFirebaseTimestamp } from "@/lib/firebase/timestamp-helpers";
import {
  RipLimitAccountBE,
  RipLimitBlockedBidBE,
  ripLimitToInr,
} from "@/types/backend/riplimit.types";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Get or create RipLimit account for a user
 */
/**
 * Retrieves or create account
 *
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to orcreateaccount result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getOrCreateAccount("example");
 */

/**
 * Retrieves or create account
 *
 * @param {string} /** User Id */
  userId - /** User Id */
  user identifier
 *
 * @returns {Promise<any>} Promise resolving to orcreateaccount result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getOrCreateAccount("example");
 */

/**
 * Retrieves or create account
 *
 * @param {string} userId - The userid
 *
 * @returns {Promise<RipLimitAccountBE>} The getorcreateaccount result
 *
 * @example
 * getOrCreateAccount("example");
 */
export async function getOrCreateAccount(
  /** User Id */
  userId: string,
): Promise<RipLimitAccountBE> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);
  const accountDoc = await accountRef.get();

  if (accountDoc.exists) {
    return { userId, ...accountDoc.data() } as RipLimitAccountBE;
  }

  // Create new account
  const now = nowAsFirebaseTimestamp();
  const newAccount: Omit<RipLimitAccountBE, "userId"> = {
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

  await accountRef.set(newAccount);
  return { userId, ...newAccount };
}

/**
 * Get blocked bids for a user
 */
/**
 * Retrieves blocked bids
 *
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to blockedbids result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getBlockedBids("example");
 */

/**
 * Retrieves blocked bids
 *
 * @param {string} /** User Id */
  userId - /** User Id */
  us/**
 * Retrieves blocked bids
 *
 * @param {string} userId - The userid
 *
 * @returns {Promise<RipLimitBlockedBidBE[]>} The getblockedbids result
 *
 * @example
 * getBlockedBids("example");
 */
er identifier
 *
 * @returns {Promise<any>} Promise resolving to blockedbids result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getBlockedBids("example");
 */

export async function getBlockedBids(
  /** User Id */
  userId: string,
): Promise<RipLimitBlockedBidBE[]> {
  const db = getFirestoreAdmin();
  const blockedBidsRef = db
    .collection(COLLECTIONS.RIPLIMIT_ACCOUNTS)
    .doc(userId)
    .collection(SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS);

  /**
 * Performs snapshot operation
 *
 * @returns {any} The snapshot result
 *
 */
const snapshot = await blockedBidsRef.get();
  return snapshot.docs.map((doc) => ({
    /** Auction Id */
    auctionId: doc.id,
    ...doc.data(),
  })) as RipLimitBlockedBidBE[];
}

/**
 * Get account balance details
 */
/**
 * Retrieves balance details
 *
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to balancedetails result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getBalanceDetails("example");
 */

/**
 * Retrieves balance details
 *
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to balancedetails result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getBalanceDetails("example");
 */

export async function getBalanceDetails(userId: string): Promise<{
  /** Available Balance */
  availableBalance: number;
  /** Blocked Balance */
  blockedBalance: number;
  /** Total Balance */
  totalBalance: number;
  /** Available Balance I N R */
  availableBalanceINR: number;
  /** Blocked Balance I N R */
  blockedBalanceINR: number;
  /** Total Balance I N R */
  totalBalanceINR: number;
  /** Has Unpaid Auctions */
  hasUnpaidAuctions: boolean;
  /** Unpaid Auction Ids */
  unpaidAuctionIds: string[];
  /** Is Blocked */
  isBlocked: boolean;
  /** Blocked Bids */
  blockedBids: Array<{
    /** Auction Id */
    auctionId: string;
    /** Bid Id */
    bidId: string;
    /** Amount */
    amount: number;
    /** Bid Amount I N R */
    bidAmountINR: number;
  }>;
}> {
  const account = await get/**
 * Performs total balance operation
 *
 * @param {any} account.availableBalance - The account.availablebalance
 *
 * @returns {any} The totalbalance result
 *
 */
OrCreateAccount(userId);
  const blockedBids = await getBlockedBids(userId);

  const totalBalance = account.availableBalance + account.blockedBalance;

  return {
    /** Available Balance */
    availableBalance: account.availableBalance,
    /** Blocked Balance */
    blockedBalance: account.blockedBalance,
    totalBalance,
    /** Available Balance I N R */
    availableBalanceINR: ripLimitToInr(account.availableBalance),
    /** Blocked Balance I N R */
    blockedBalanceINR: ripLimitToInr(account.blockedBalance),
    /** Total Balance I N R */
    totalBalanceINR: ripLimitToInr(totalBalance),
    /** Has Unpaid Auctions */
    hasUnpaidAuctions: account.hasUnpaidAuctions,
    /** Unpaid Auction Ids */
    unpaidAuctionIds: account.unpaidAuctionIds,
    /** Is Blocked */
    isBlocked: account.isBlocked,
    /** Blocked Bids */
    blockedBids: blockedBids.map((bid) => ({
      /** Auction Id */
      auctionId: bid.auctionId,
      /** Bid Id */
      bidId: bid.bidId,
      /** Amount */
      amount: bid.amount,
      /** Bid Amount I N R */
      bidAmountINR: bid.bidAmountINR,
    })),
  };
}

/**
 * Mark auction as unpaid (user won but hasn't paid)
 */
/**
 * Performs mark auction unpaid operation
 *
 * @param {string} userId - user identifier
 * @param {string} auctionId - auction identifier
 *
 * @returns {Promise<any>} Promise resolving to markauctionunpaid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * markAuctionUnpaid("example", "example");
 */

/**
 * Performs mark auction unpaid operation
 *
 * @returns {Promise<any>} Promise resolving to markauctionunpaid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * markAuctionUnpaid();
 */

export async function markAuctionUnpaid(
  /** User Id */
  userId: string,
  /** Auction Id */
  auctionId: string,
): Promise<void> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);

  await accountRef.update({
    /** Has Unpaid Auctions */
    hasUnpaidAuctions: true,
    /** Unpaid Auction Ids */
    unpaidAuctionIds: FieldValue.arrayUnion(auctionId),
    /** Updated At */
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Add strike to user account
 */
/**
 * Performs add strike operation
 *
 * @param {string} userId - user identifier
 *
 * @returns {Promise<any>} Promise resolving to addstrike result
 *
 * @throws {E/**
 * Performs add strike operation
 *
 * @param {string} userId - The userid
 *
 * @returns {Promise<} The addstrike result
 *
 * @example
 * addStrike("example");
 */
rror} When operation fails or validation errors occur
 *
 * @example
 * addStrike("example");
 */

/**
 * Performs add strike operation
 *
 * @param {string} /** User Id */
  userId - /** User Id */
  user identifier
 *
 * @returns {Promise<any>} Promise resolving to addstrike result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * addStrike("example");/**
 * Performs result operation
 *
 * @param {any} async(t - The async(t
 *
 * @returns {Promise<any>} The result result
 *
 */

 */

export async function addStrike(
  /** User Id */
  userId: string,
): Promise<{ strikes: number; isBlocked: boolean }> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);

  const result = await db.runTransaction(async (t) => {
    const accountDoc = await t.get(accountRef);
    const account = accountDoc.data() as RipLimitAccountBE;
    const newStrikes = account.strikes + 1;
    const shouldBlock = newStrikes >= 3;

    t.update(accountRef, {
      /** Strikes */
      strikes: newStrikes,
      /** Is Blocked */
      isBlocked: shouldBlock,
      /** Block Reason */
      blockReason: shouldBlock
        ? "Too many unpaid auctions (3 strikes)"
        : undefined,
      /** Updated At */
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { strikes: newStrikes, isBlocked: shouldBlock };
  });

  return result;
}
