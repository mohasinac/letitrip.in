/**
 * RipLimit Bid Operations
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Handles bid blocking, releasing, and auction payment.
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import {
  RipLimitAccountBE,
  RipLimitBlockedBidBE,
  RipLimitTransactionBE,
  RipLimitTransactionType,
  RipLimitTransactionStatus,
  inrToRipLimit,
  ripLimitToInr,
} from "@/types/backend/riplimit.types";

/**
 * Block RipLimit for a bid
 */
export async function blockForBid(
  userId: string,
  auctionId: string,
  bidId: string,
  bidAmountINR: number
): Promise<{ success: boolean; error?: string; transaction?: RipLimitTransactionBE }> {
  const db = getFirestoreAdmin();
  const ripLimitAmount = inrToRipLimit(bidAmountINR);

  const result = await db.runTransaction(async (t) => {
    const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);
    const accountDoc = await t.get(accountRef);

    if (!accountDoc.exists) {
      return { success: false, error: "RipLimit account not found" };
    }

    const account = { userId, ...accountDoc.data() } as RipLimitAccountBE;

    // Check if user can bid
    if (account.isBlocked) {
      return { success: false, error: account.blockReason || "Account is blocked" };
    }
    if (account.hasUnpaidAuctions) {
      return { success: false, error: "You have unpaid won auctions" };
    }

    // Check sufficient balance
    if (account.availableBalance < ripLimitAmount) {
      return {
        success: false,
        error: `Insufficient RipLimit. Required: ${ripLimitAmount}, Available: ${account.availableBalance}`,
      };
    }

    // Check if already has a bid on this auction
    const blockedBidRef = accountRef.collection(SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS).doc(auctionId);
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
      availableBalance: newAvailable,
      blockedBalance: newBlocked,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update blocked bid record
    const blockedBidData: RipLimitBlockedBidBE = {
      auctionId,
      bidId,
      amount: ripLimitAmount,
      bidAmountINR,
      createdAt: Timestamp.now() as unknown as import("@/types/shared/common.types").FirebaseTimestamp,
    };
    t.set(blockedBidRef, blockedBidData);

    // Create transaction record
    const transactionRef = db.collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS).doc();
    const transactionRecord: Omit<RipLimitTransactionBE, "id"> = {
      userId,
      type: RipLimitTransactionType.BID_BLOCK,
      amount: -netBlock, // Negative because it's a debit from available
      inrAmount: ripLimitToInr(netBlock),
      balanceAfter: newAvailable,
      auctionId,
      bidId,
      status: RipLimitTransactionStatus.COMPLETED,
      description: `Bid blocked for auction`,
      createdAt: Timestamp.now() as unknown as import("@/types/shared/common.types").FirebaseTimestamp,
    };
    t.set(transactionRef, transactionRecord);

    return {
      success: true,
      transaction: { id: transactionRef.id, ...transactionRecord } as RipLimitTransactionBE,
    };
  });

  return result;
}

/**
 * Release blocked RipLimit when outbid or auction cancelled
 */
export async function releaseBlockedBid(
  userId: string,
  auctionId: string,
  reason: string = "Outbid"
): Promise<{ success: boolean; releasedAmount?: number; transaction?: RipLimitTransactionBE }> {
  const db = getFirestoreAdmin();

  const result = await db.runTransaction(async (t) => {
    const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);
    const blockedBidRef = accountRef.collection(SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS).doc(auctionId);

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
      availableBalance: newAvailable,
      blockedBalance: newBlocked,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Delete blocked bid record
    t.delete(blockedBidRef);

    // Create transaction record
    const transactionRef = db.collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS).doc();
    const transactionRecord: Omit<RipLimitTransactionBE, "id"> = {
      userId,
      type: RipLimitTransactionType.BID_RELEASE,
      amount: releaseAmount,
      inrAmount: ripLimitToInr(releaseAmount),
      balanceAfter: newAvailable,
      auctionId,
      bidId: blockedBid.bidId,
      status: RipLimitTransactionStatus.COMPLETED,
      description: `RipLimit released: ${reason}`,
      createdAt: Timestamp.now() as unknown as import("@/types/shared/common.types").FirebaseTimestamp,
    };
    t.set(transactionRef, transactionRecord);

    return {
      success: true,
      releasedAmount: releaseAmount,
      transaction: { id: transactionRef.id, ...transactionRecord } as RipLimitTransactionBE,
    };
  });

  return result;
}

/**
 * Use blocked RipLimit for auction payment
 */
export async function useForAuctionPayment(
  userId: string,
  auctionId: string,
  orderId: string
): Promise<{
  success: boolean;
  usedAmount?: number;
  usedAmountINR?: number;
  transaction?: RipLimitTransactionBE;
}> {
  const db = getFirestoreAdmin();

  const result = await db.runTransaction(async (t) => {
    const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);
    const blockedBidRef = accountRef.collection(SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS).doc(auctionId);

    const [accountDoc, blockedBidDoc] = await Promise.all([
      t.get(accountRef),
      t.get(blockedBidRef),
    ]);

    if (!accountDoc.exists || !blockedBidDoc.exists) {
      return { success: false };
    }

    const account = accountDoc.data() as RipLimitAccountBE;
    const blockedBid = blockedBidDoc.data() as RipLimitBlockedBidBE;
    const usedAmount = blockedBid.amount;

    // Update account - deduct from blocked balance, add to lifetime spent
    const newBlocked = account.blockedBalance - usedAmount;
    const newLifetimeSpent = account.lifetimeSpent + usedAmount;

    // Remove from unpaid auctions if present
    const newUnpaidAuctionIds = account.unpaidAuctionIds.filter((id) => id !== auctionId);
    const hasUnpaidAuctions = newUnpaidAuctionIds.length > 0;

    t.update(accountRef, {
      blockedBalance: newBlocked,
      lifetimeSpent: newLifetimeSpent,
      unpaidAuctionIds: newUnpaidAuctionIds,
      hasUnpaidAuctions,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Delete blocked bid record
    t.delete(blockedBidRef);

    // Create transaction record
    const transactionRef = db.collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS).doc();
    const transactionRecord: Omit<RipLimitTransactionBE, "id"> = {
      userId,
      type: RipLimitTransactionType.AUCTION_PAYMENT,
      amount: -usedAmount,
      inrAmount: ripLimitToInr(usedAmount),
      balanceAfter: account.availableBalance, // Available unchanged
      auctionId,
      bidId: blockedBid.bidId,
      orderId,
      status: RipLimitTransactionStatus.COMPLETED,
      description: `Auction payment completed`,
      createdAt: Timestamp.now() as unknown as import("@/types/shared/common.types").FirebaseTimestamp,
    };
    t.set(transactionRef, transactionRecord);

    return {
      success: true,
      usedAmount,
      usedAmountINR: ripLimitToInr(usedAmount),
      transaction: { id: transactionRef.id, ...transactionRecord } as RipLimitTransactionBE,
    };
  });

  return result;
}
