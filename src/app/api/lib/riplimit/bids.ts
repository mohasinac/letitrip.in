/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/riplimit/bids
 * @description This file contains functionality related to bids
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * RipLimit Bid Operations
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Handles bid blocking, releasing, and auction payment.
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { nowAsFirebaseTimestamp } from "@/lib/firebase/timestamp-helpers";
import {
  RipLimitAccountBE,
  RipLimitBlockedBidBE,
  RipLimitTransactionBE,
  RipLimitTransactionStatus,
  RipLimitTransactionType,
  inrToRipLimit,
  ripLimitToInr,
} from "@/types/backend/riplimit.types";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Block RipLimit for a bid
 */
/**
 * Performs block for bid operation
 *
 * @returns {Promise<any>} Promise resolving to blockforbid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * blockForBid();
 */

/**
 * Performs block for bid operation
 *
 * @returns {Promise<any>} Promise resolving to blockforbid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * blockForBid();
 */

export async function blockForBid(
  /** User Id */
  userId: string,
  /** Auction Id */
  auctionId: string,
  /** Bid Id */
  bidId: string,
  /** Bid Amount I N R */
  bidAmountINR: number,
): Promise<{
  /** Success */
  success: boolean;
  /** Error */
  error?: string;
  /** Transaction */
  transaction?: RipLimitTransactionBE;
}> {
  const db = getFirestoreAdmin();
  const ripLimitAmount = inrToRipLimit(bidAmountINR);

  /**
 * Performs result operation
 *
 * @param {any} async(t - The async(t
 *
 * @returns {Promise<any>} The result result
 *
 */
const result = await db.runTransaction(async (t) => {
    const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);
    const accountDoc = await t.get(accountRef);

    if (!accountDoc.exists) {
      return { success: false, error: "RipLimit account not found" };
    }

    const account = { userId, ...accountDoc.data() } as RipLimitAccountBE;

    // Check if user can bid
    if (account.isBlocked) {
      return {
        /** Success */
        success: false,
        /** Error */
        error: account.blockReason || "Account is blocked",
      };
    }
    if (account.hasUnpaidAuctions) {
      return { success: false, error: "You have unpaid won auctions" };
    }

    // Check sufficient balance
    if (account.availableBalance < ripLimitAmount) {
      return {
        /** Success */
        success: false,
        /** Error */
        error: `Insufficient RipLimit. Required: ${ripLimitAmount}, Available: ${account.availableBalance}`,
      };
    }

    // Check if already has a bid on this auction
    const blockedBidRef = accountRef
      .collection(SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS)
      .doc(auctionId);
    const existingBid = await t.get(blockedBidRef);
    let previouslyBlocked = 0;

    if (existingBid.exists) {
      // Release previous bid amount
      previouslyBlocked = (existingBid.data() as RipLimitBlockedBidBE).amount;
    }

    // Calculate new blocked amount (difference from previous)
    const netBlock = ripLimitAmount - previouslyBlocked;
    const newAvailable = account.availableBalance - netBlock;
    const newBlocked = account.blockedBalance + netBlock;

    // Update account
    t.update(accountRef, {
      /** Available Balance */
      availableBalance: newAvailable,
      /** Blocked Balance */
      blockedBalance: newBlocked,
      /** Updated At */
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update blocked bid record
    const blockedBidData: RipLimitBlockedBidBE = {
      auctionId,
      bidId,
      /** Amount */
      amount: ripLimitAmount,
      bidAmountINR,
      /** Created At */
      createdAt: nowAsFirebaseTimestamp(),
    };
    t.set(blockedBidRef, blockedBidData);

    // Create transaction record
    const transactionRef = db
      .collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS)
      .doc();
    const transactionRecord: Omit<RipLimitTransactionBE, "id"> = {
      userId,
      /** Type */
      type: RipLimitTransactionType.BID_BLOCK,
      amount: -netBlock, // Negative because it's a debit from available
      /** Inr Amount */
      inrAmount: ripLimitToInr(netBlock),
      /** Balance After */
      balanceAfter: newAvailable,
      auctionId,
      bidId,
      /** Status */
      status: RipLimitTransactionStatus.COMPLETED,
      /** Description */
      description: `Bid blocked for auction`,
      /** Created At */
      createdAt: nowAsFirebaseTimestamp(),
    };
    t.set(transactionRef, transactionRecord);

    return {
      /** Success */
      success: true,
      /** Transaction */
      transaction: {
        /** Id */
        id: transactionRef.id,
        ...transactionRecord,
      } as RipLimitTransactionBE,
    };
  });

  return result;
}

/**
 * Release blocked RipLimit when outbid or auction cancelled
 */
/**
 * Performs release blocked bid operation
 *
 * @param {string} userId - user identifier
 * @param {string} auctionId - auction identifier
 * @param {string} [reason] - The reason
 *
 * @returns {Promise<any>} Promise resolving to releaseblockedbid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * releaseBlockedBid("example", "example", "example");
 */

/**
 * Performs release blocked bid operation
 *
 * @returns {Promise<any>} Promise resolving to releaseblockedbid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * releaseBlockedBid();
 */

export async function releaseBlockedBid(
  /** User Id */
  userId: string,
  /** Auction Id */
  auctionId: string,
  /** Reason */
  reason: string = "Outbid",
): Promise<{
  /** Success */
  success: boolean;
  /** Released Amount */
  rel/**
 * Performs result operation
 *
 * @param {any} async(t - The async(t
 *
 * @returns {Promise<any>} The result result
 *
 */
easedAmount?: number;
  /** Transaction */
  transaction?: RipLimitTransactionBE;
}> {
  const db = getFirestoreAdmin();

  const result = await db.runTransaction(async (t) => {
    const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);
    const blockedBidRef = accountRef
      .collection(SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS)
      .doc(auctionId);

    const [accountDoc, blockedBidDoc] = await Promise.all([
      t.get(accountRef),
      t.get(blockedBidRef),
    ]);

    if (!accountDoc.exists || !blockedBidDoc.exists) {
      return { success: false };
    }

    const account = accountDoc.data() as RipLimitAccountBE;
    const blockedBid = blockedBidDoc.data() as RipLimitBlockedBidBE;
    const releaseAmount = blockedBid.amount;

    // Update account
    const newAvailable = account.availableBalance + releaseAmount;
    const newBlocked = account.blockedBalance - releaseAmount;

    t.update(accountRef, {
      /** Available Balance */
      availableBalance: newAvailable,
      /** Blocked Balance */
      blockedBalance: newBlocked,
      /** Updated At */
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Delete blocked bid record
    t.delete(blockedBidRef);

    // Create transaction record
    const transactionRef = db
      .collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS)
      .doc();
    const transactionRecord: Omit<RipLimitTransactionBE, "id"> = {
      userId,
      /** Type */
      type: RipLimitTransactionType.BID_RELEASE,
      /** Amount */
      amount: releaseAmount,
      /** Inr Amount */
      inrAmount: ripLimitToInr(releaseAmount),
      /** Balance After */
      balanceAfter: newAvailable,
      auctionId,
      /** Bid Id */
      bidId: blockedBid.bidId,
      /** Status */
      status: RipLimitTransactionStatus.COMPLETED,
      /** Description */
      description: `RipLimit released: ${reason}`,
      /** Created At */
      createdAt: nowAsFirebaseTimestamp(),
    };
    t.set(transactionRef, transactionRecord);

    return {
      /** Success */
      success: true,
      /** Released Amount */
      releasedAmount: releaseAmount,
      /** Transaction */
      transaction: {
        /** Id */
        id: transactionRef.id,
        ...transactionRecord,
      } as RipLimitTransactionBE,
    };
  });

  return result;
}

/**
 * Use blocked RipLimit for auction payment
 */
/**
 * Custom React hook for for auction payment
 *
 * @param {string} userId - user identifier
 * @param {string} auctionId - auction identifier
 * @param {string} orderId - order identifier
 *
 * @returns {Promise<any>} Promise resolving to useforauctionpayment result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useForAuctionPayment("example", "example", "example");
 */

/**
 * Custom React hook for for auction payment
 *
 * @returns {Promise<any>} Promise resolving to useforauctionpayment result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useForAuctionPayment();
 */

export async function useForAuctionPayment(
  /** User Id */
  userId: string,
  /** Auction Id */
  auctionId: string,
  /** Order Id */
  orderId: string,/**
 * Performs result operation
 *
 * @param {any} async(t - The async(t
 *
 * @returns {Promise<any>} The result result
 *
 */

): Promise<{
  /** Success */
  success: boolean;
  /** Used Amount */
  usedAmount?: number;
  /** Used Amount I N R */
  usedAmountINR?: number;
  /** Transaction */
  transaction?: RipLimitTransactionBE;
}> {
  const db = getFirestoreAdmin();

  const result = await db.runTransaction(async (t) => {
    const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);
    const blockedBidRef = accountRef
      .collection(SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS)
      .doc(auctionId);

    const [accountDoc, blockedBidDoc] = await Promise.all([
      t.get(accountRef),
      t.get(blockedBidRef),
    ]);

    if (!accountDoc.exists || !blockedBidDoc.exists) {
      return { success: false };
    }

    const account = accountDoc.data() as RipL/**
 * Performs new unpaid auction ids operation
 *
 * @param {any} (id - The (id
 *
 * @returns {any} The newunpaidauctionids result
 *
 */
imitAccountBE;
    const blockedBid = blockedBidDoc.data() as RipLimitBlockedBidBE;
    const usedAmount = blockedBid.amount;

    // Update account - deduct from blocked balance, add to lifetime spent
    const newBlocked = account.blockedBalance - usedAmount;
    const newLifetimeSpent = account.lifetimeSpent + usedAmount;

    // Remove from unpaid auctions if present
    const newUnpaidAuctionIds = account.unpaidAuctionIds.filter(
      (id) => id !== auctionId,
    );
    const hasUnpaidAuctions = newUnpaidAuctionIds.length > 0;

    t.update(accountRef, {
      /** Blocked Balance */
      blockedBalance: newBlocked,
      /** Lifetime Spent */
      lifetimeSpent: newLifetimeSpent,
      /** Unpaid Auction Ids */
      unpaidAuctionIds: newUnpaidAuctionIds,
      hasUnpaidAuctions,
      /** Updated At */
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Delete blocked bid record
    t.delete(blockedBidRef);

    // Create transaction record
    const transactionRef = db
      .collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS)
      .doc();
    const transactionRecord: Omit<RipLimitTransactionBE, "id"> = {
      userId,
      /** Type */
      type: RipLimitTransactionType.AUCTION_PAYMENT,
      /** Amount */
      amount: -usedAmount,
      /** Inr Amount */
      inrAmount: ripLimitToInr(usedAmount),
      balanceAfter: account.availableBalance, // Available unchanged
      auctionId,
      /** Bid Id */
      bidId: blockedBid.bidId,
      orderId,
      /** Status */
      status: RipLimitTransactionStatus.COMPLETED,
      /** Description */
      description: `Auction payment completed`,
      /** Created At */
      createdAt: nowAsFirebaseTimestamp(),
    };
    t.set(transactionRef, transactionRecord);

    return {
      /** Success */
      success: true,
      usedAmount,
      /** Used Amount I N R */
      usedAmountINR: ripLimitToInr(usedAmount),
      /** Transaction */
      transaction: {
        /** Id */
        id: transactionRef.id,
        ...transactionRecord,
      } as RipLimitTransactionBE,
    };
  });

  return result;
}
