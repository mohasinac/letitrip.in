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
  const accountsSnapshot = await db
    .collection(COLLECTIONS.RIPLIMIT_ACCOUNTS)
    .get();

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
    .collection(COLLECTIONS.RIPLIMIT_PURCHASES)
    .where("status", "==", RipLimitPurchaseStatus.COMPLETED)
    .get();

  let totalRevenue = 0;
  purchasesSnapshot.docs.forEach((doc) => {
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
  adminId: string,
): Promise<RipLimitTransactionBE> {
  return creditBalance(
    userId,
    amount,
    RipLimitTransactionType.ADJUSTMENT,
    reason,
    {
      adjustedBy: adminId,
      reason,
    },
  );
}

/**
 * Admin clear unpaid auction flag
 */
export async function adminClearUnpaidAuction(
  userId: string,
  auctionId: string,
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
      unpaidAuctionIds: newUnpaidIds,
      hasUnpaidAuctions: newUnpaidIds.length > 0,
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
        availableBalance: FieldValue.increment(blockedBid.amount),
        blockedBalance: FieldValue.increment(-blockedBid.amount),
      });
      t.delete(blockedBidRef);

      // Create transaction record
      const transactionRef = db
        .collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS)
        .doc();
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

/**
 * Get user account details for admin
 */
export async function getAdminUserDetails(
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
export async function listAllAccounts(
  options: {
    limit?: number;
    offset?: number;
    filter?: "unpaid" | "blocked" | "all";
  } = {},
): Promise<{ accounts: RipLimitAccountBE[]; total: number }> {
  const db = getFirestoreAdmin();
  let query = db
    .collection(COLLECTIONS.RIPLIMIT_ACCOUNTS)
    .orderBy("createdAt", "desc");

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
    userId: doc.id,
    ...doc.data(),
  })) as RipLimitAccountBE[];

  return { accounts, total };
}
