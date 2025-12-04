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
export async function getOrCreateAccount(
  userId: string
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
    availableBalance: 0,
    blockedBalance: 0,
    lifetimePurchases: 0,
    lifetimeSpent: 0,
    hasUnpaidAuctions: false,
    unpaidAuctionIds: [],
    strikes: 0,
    isBlocked: false,
    createdAt: now,
    updatedAt: now,
  };

  await accountRef.set(newAccount);
  return { userId, ...newAccount };
}

/**
 * Get blocked bids for a user
 */
export async function getBlockedBids(
  userId: string
): Promise<RipLimitBlockedBidBE[]> {
  const db = getFirestoreAdmin();
  const blockedBidsRef = db
    .collection(COLLECTIONS.RIPLIMIT_ACCOUNTS)
    .doc(userId)
    .collection(SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS);

  const snapshot = await blockedBidsRef.get();
  return snapshot.docs.map((doc) => ({
    auctionId: doc.id,
    ...doc.data(),
  })) as RipLimitBlockedBidBE[];
}

/**
 * Get account balance details
 */
export async function getBalanceDetails(userId: string): Promise<{
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
 * Mark auction as unpaid (user won but hasn't paid)
 */
export async function markAuctionUnpaid(
  userId: string,
  auctionId: string
): Promise<void> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);

  await accountRef.update({
    hasUnpaidAuctions: true,
    unpaidAuctionIds: FieldValue.arrayUnion(auctionId),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Add strike to user account
 */
export async function addStrike(
  userId: string
): Promise<{ strikes: number; isBlocked: boolean }> {
  const db = getFirestoreAdmin();
  const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);

  const result = await db.runTransaction(async (t) => {
    const accountDoc = await t.get(accountRef);
    const account = accountDoc.data() as RipLimitAccountBE;
    const newStrikes = account.strikes + 1;
    const shouldBlock = newStrikes >= 3;

    t.update(accountRef, {
      strikes: newStrikes,
      isBlocked: shouldBlock,
      blockReason: shouldBlock
        ? "Too many unpaid auctions (3 strikes)"
        : undefined,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { strikes: newStrikes, isBlocked: shouldBlock };
  });

  return result;
}
