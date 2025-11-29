/**
 * RipLimit Service
 * Epic: E028 - RipLimit Bidding Currency
 *
 * Handles all RipLimit operations including:
 * - Balance management
 * - Purchase processing
 * - Bid blocking/releasing
 * - Refund processing
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
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
  inrToRipLimit,
  ripLimitToInr,
} from "@/types/backend/riplimit.types";

// ==================== COLLECTIONS ====================

const COLLECTIONS = {
  ACCOUNTS: "riplimit_accounts",
  TRANSACTIONS: "riplimit_transactions",
  PURCHASES: "riplimit_purchases",
  REFUNDS: "riplimit_refunds",
  BLOCKED_BIDS: "blocked_bids", // Sub-collection under accounts
};

// ==================== ACCOUNT OPERATIONS ====================

/**
 * Get or create RipLimit account for a user
 */
export async function getOrCreateAccount(userId: string): Promise<RipLimitAccountBE> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.ACCOUNTS).doc(userId);
  const accountDoc = await accountRef.get();

  if (accountDoc.exists) {
    return { userId, ...accountDoc.data() } as RipLimitAccountBE;
  }

  // Create new account
  const now = Timestamp.now();
  const newAccount: Omit<RipLimitAccountBE, "userId"> = {
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

  await accountRef.set(newAccount);
  return { userId, ...newAccount };
}

/**
 * Get account balance details
 */
export async function getBalance(userId: string): Promise<{
  availableBalance: number;
  blockedBalance: number;
  totalBalance: number;
  availableBalanceINR: number;
  blockedBalanceINR: number;
  totalBalanceINR: number;
  hasUnpaidAuctions: boolean;
  unpaidAuctionIds: string[];
  isBlocked: boolean;
  blockedBids: Array<{
    auctionId: string;
    bidId: string;
    amount: number;
    bidAmountINR: number;
  }>;
}> {
  const account = await getOrCreateAccount(userId);
  const blockedBids = await getBlockedBids(userId);

  const totalBalance = account.availableBalance + account.blockedBalance;

  return {
    availableBalance: account.availableBalance,
    blockedBalance: account.blockedBalance,
    totalBalance,
    availableBalanceINR: ripLimitToInr(account.availableBalance),
    blockedBalanceINR: ripLimitToInr(account.blockedBalance),
    totalBalanceINR: ripLimitToInr(totalBalance),
    hasUnpaidAuctions: account.hasUnpaidAuctions,
    unpaidAuctionIds: account.unpaidAuctionIds,
    isBlocked: account.isBlocked,
    blockedBids: blockedBids.map((bid) => ({
      auctionId: bid.auctionId,
      bidId: bid.bidId,
      amount: bid.amount,
      bidAmountINR: bid.bidAmountINR,
    })),
  };
}

/**
 * Get blocked bids for a user
 */
async function getBlockedBids(userId: string): Promise<RipLimitBlockedBidBE[]> {
  const db = getFirestoreAdmin();
  const blockedBidsRef = db
    .collection(COLLECTIONS.ACCOUNTS)
    .doc(userId)
    .collection(COLLECTIONS.BLOCKED_BIDS);

  const snapshot = await blockedBidsRef.get();
  return snapshot.docs.map((doc) => ({
    auctionId: doc.id,
    ...doc.data(),
  })) as RipLimitBlockedBidBE[];
}

// ==================== CREDIT OPERATIONS ====================

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
  const accountRef = db.collection(COLLECTIONS.ACCOUNTS).doc(userId);

  // Use transaction to ensure atomicity
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
    const transactionRef = db.collection(COLLECTIONS.TRANSACTIONS).doc();
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

// ==================== BID OPERATIONS ====================

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
    const accountRef = db.collection(COLLECTIONS.ACCOUNTS).doc(userId);
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
    const blockedBidRef = accountRef.collection(COLLECTIONS.BLOCKED_BIDS).doc(auctionId);
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
    const transactionRef = db.collection(COLLECTIONS.TRANSACTIONS).doc();
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
    const accountRef = db.collection(COLLECTIONS.ACCOUNTS).doc(userId);
    const blockedBidRef = accountRef.collection(COLLECTIONS.BLOCKED_BIDS).doc(auctionId);

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
    const transactionRef = db.collection(COLLECTIONS.TRANSACTIONS).doc();
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
    const accountRef = db.collection(COLLECTIONS.ACCOUNTS).doc(userId);
    const blockedBidRef = accountRef.collection(COLLECTIONS.BLOCKED_BIDS).doc(auctionId);

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
    const transactionRef = db.collection(COLLECTIONS.TRANSACTIONS).doc();
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

// ==================== UNPAID AUCTION HANDLING ====================

/**
 * Mark auction as unpaid (user won but hasn't paid)
 */
export async function markAuctionUnpaid(userId: string, auctionId: string): Promise<void> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.ACCOUNTS).doc(userId);

  await accountRef.update({
    hasUnpaidAuctions: true,
    unpaidAuctionIds: FieldValue.arrayUnion(auctionId),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Add strike to user account
 */
export async function addStrike(userId: string): Promise<{ strikes: number; isBlocked: boolean }> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.ACCOUNTS).doc(userId);

  const result = await db.runTransaction(async (t) => {
    const accountDoc = await t.get(accountRef);
    const account = accountDoc.data() as RipLimitAccountBE;
    const newStrikes = account.strikes + 1;
    const shouldBlock = newStrikes >= 3;

    t.update(accountRef, {
      strikes: newStrikes,
      isBlocked: shouldBlock,
      blockReason: shouldBlock ? "Too many unpaid auctions (3 strikes)" : undefined,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { strikes: newStrikes, isBlocked: shouldBlock };
  });

  return result;
}

// ==================== TRANSACTION HISTORY ====================

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
    .collection(COLLECTIONS.TRANSACTIONS)
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

// ==================== ADMIN OPERATIONS ====================

/**
 * Get admin stats
 */
export async function getAdminStats(): Promise<{
  totalCirculation: number;
  totalAvailable: number;
  totalBlocked: number;
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
  userCount: number;
  unpaidUserCount: number;
}> {
  const db = getFirestoreAdmin();

  // Get all accounts
  const accountsSnapshot = await db.collection(COLLECTIONS.ACCOUNTS).get();
  
  let totalAvailable = 0;
  let totalBlocked = 0;
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
  const purchasesSnapshot = await db
    .collection(COLLECTIONS.PURCHASES)
    .where("status", "==", RipLimitPurchaseStatus.COMPLETED)
    .get();
  
  let totalRevenue = 0;
  purchasesSnapshot.docs.forEach((doc) => {
    totalRevenue += (doc.data() as RipLimitPurchaseBE).inrAmount;
  });

  // Get refund totals
  const refundsSnapshot = await db
    .collection(COLLECTIONS.REFUNDS)
    .where("status", "==", RipLimitRefundStatus.COMPLETED)
    .get();
  
  let totalRefunded = 0;
  refundsSnapshot.docs.forEach((doc) => {
    totalRefunded += (doc.data() as RipLimitRefundBE).netAmount;
  });

  return {
    totalCirculation: totalAvailable + totalBlocked,
    totalAvailable,
    totalBlocked,
    totalRevenue,
    totalRefunded,
    netRevenue: totalRevenue - totalRefunded,
    userCount: accountsSnapshot.size,
    unpaidUserCount,
  };
}

/**
 * Admin adjust user balance
 */
export async function adminAdjustBalance(
  userId: string,
  amount: number,
  reason: string,
  adminId: string
): Promise<RipLimitTransactionBE> {
  return creditBalance(userId, amount, RipLimitTransactionType.ADJUSTMENT, reason, {
    adjustedBy: adminId,
    reason,
  });
}

/**
 * Admin clear unpaid auction flag
 */
export async function adminClearUnpaidAuction(
  userId: string,
  auctionId: string,
  adminId: string
): Promise<void> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.ACCOUNTS).doc(userId);

  await db.runTransaction(async (t) => {
    const accountDoc = await t.get(accountRef);
    const account = accountDoc.data() as RipLimitAccountBE;

    const newUnpaidIds = account.unpaidAuctionIds.filter((id) => id !== auctionId);

    t.update(accountRef, {
      unpaidAuctionIds: newUnpaidIds,
      hasUnpaidAuctions: newUnpaidIds.length > 0,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Release any blocked RipLimit for this auction
    const blockedBidRef = accountRef.collection(COLLECTIONS.BLOCKED_BIDS).doc(auctionId);
    const blockedBidDoc = await t.get(blockedBidRef);

    if (blockedBidDoc.exists) {
      const blockedBid = blockedBidDoc.data() as RipLimitBlockedBidBE;
      t.update(accountRef, {
        availableBalance: FieldValue.increment(blockedBid.amount),
        blockedBalance: FieldValue.increment(-blockedBid.amount),
      });
      t.delete(blockedBidRef);

      // Create transaction record
      const transactionRef = db.collection(COLLECTIONS.TRANSACTIONS).doc();
      t.set(transactionRef, {
        userId,
        type: RipLimitTransactionType.BID_RELEASE,
        amount: blockedBid.amount,
        inrAmount: ripLimitToInr(blockedBid.amount),
        balanceAfter: account.availableBalance + blockedBid.amount,
        auctionId,
        status: RipLimitTransactionStatus.COMPLETED,
        description: `Admin cleared unpaid auction`,
        metadata: { clearedBy: adminId },
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });
}
