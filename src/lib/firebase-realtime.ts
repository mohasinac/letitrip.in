/**
 * Firebase Realtime Database Service
 * FREE alternative to Socket.IO for real-time auction bidding
 */

import { database } from "@/app/api/lib/firebase/app";
import {
  ref,
  set,
  onValue,
  off,
  push,
  serverTimestamp,
  get,
  query,
  orderByChild,
  limitToLast,
  DatabaseReference,
  DataSnapshot,
} from "firebase/database";

export interface AuctionBid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: number;
  isWinning?: boolean;
}

export interface AuctionStatus {
  auctionId: string;
  currentBid: number;
  bidCount: number;
  isActive: boolean;
  endTime: number;
  winnerId?: string;
  lastUpdate: number;
}

/**
 * Subscribe to auction real-time updates
 */
export function subscribeToAuction(
  auctionId: string,
  onUpdate: (status: AuctionStatus) => void
): () => void {
  if (!database) {
    console.error("Firebase database not initialized");
    return () => {};
  }

  const statusRef = ref(database, `auctions/${auctionId}/status`);

  const unsubscribe = onValue(statusRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (data) {
      onUpdate(data as AuctionStatus);
    }
  });

  // Return cleanup function
  return () => {
    off(statusRef);
  };
}

/**
 * Subscribe to auction bids (last 10)
 */
export function subscribeToAuctionBids(
  auctionId: string,
  onBidsUpdate: (bids: AuctionBid[]) => void
): () => void {
  if (!database) {
    console.error("Firebase database not initialized");
    return () => {};
  }

  const bidsRef = ref(database, `auctions/${auctionId}/bids`);
  const recentBidsQuery = query(
    bidsRef,
    orderByChild("timestamp"),
    limitToLast(10)
  );

  const unsubscribe = onValue(recentBidsQuery, (snapshot: DataSnapshot) => {
    const bids: AuctionBid[] = [];
    snapshot.forEach((childSnapshot) => {
      bids.push({
        id: childSnapshot.key as string,
        ...childSnapshot.val(),
      } as AuctionBid);
    });
    onBidsUpdate(bids.reverse()); // Newest first
  });

  return () => {
    off(bidsRef);
  };
}

/**
 * Place a bid (call from API route)
 */
export async function placeBid(
  auctionId: string,
  userId: string,
  userName: string,
  amount: number
): Promise<{ success: boolean; bidId?: string; error?: string }> {
  if (!database) {
    return { success: false, error: "Database not initialized" };
  }

  try {
    // Add bid to bids list
    const bidsRef = ref(database, `auctions/${auctionId}/bids`);
    const newBidRef = push(bidsRef);

    const bidData: Omit<AuctionBid, "id"> = {
      auctionId,
      userId,
      userName,
      amount,
      timestamp: Date.now(),
    };

    await set(newBidRef, bidData);

    // Update auction status
    const statusRef = ref(database, `auctions/${auctionId}/status`);
    const statusSnapshot = await get(statusRef);
    const currentStatus = statusSnapshot.val() as AuctionStatus | null;

    await set(statusRef, {
      auctionId,
      currentBid: amount,
      bidCount: (currentStatus?.bidCount || 0) + 1,
      isActive: true,
      endTime: currentStatus?.endTime || Date.now() + 24 * 60 * 60 * 1000,
      winnerId: userId,
      lastUpdate: Date.now(),
    });

    return { success: true, bidId: newBidRef.key as string };
  } catch (error) {
    console.error("Failed to place bid:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Initialize auction in Realtime Database
 */
export async function initializeAuction(
  auctionId: string,
  startingBid: number,
  endTime: number
): Promise<void> {
  if (!database) {
    throw new Error("Database not initialized");
  }

  const statusRef = ref(database, `auctions/${auctionId}/status`);

  await set(statusRef, {
    auctionId,
    currentBid: startingBid,
    bidCount: 0,
    isActive: true,
    endTime,
    lastUpdate: Date.now(),
  } as AuctionStatus);
}

/**
 * End auction (call from API route)
 */
export async function endAuction(auctionId: string): Promise<void> {
  if (!database) {
    throw new Error("Database not initialized");
  }

  const statusRef = ref(database, `auctions/${auctionId}/status`);
  const statusSnapshot = await get(statusRef);
  const currentStatus = statusSnapshot.val() as AuctionStatus | null;

  if (currentStatus) {
    await set(statusRef, {
      ...currentStatus,
      isActive: false,
      lastUpdate: Date.now(),
    });
  }
}

/**
 * Get auction status (one-time read)
 */
export async function getAuctionStatus(
  auctionId: string
): Promise<AuctionStatus | null> {
  if (!database) {
    return null;
  }

  const statusRef = ref(database, `auctions/${auctionId}/status`);
  const snapshot = await get(statusRef);
  return snapshot.val() as AuctionStatus | null;
}

/**
 * Clean up old auction data (call from scheduled job)
 */
export async function cleanupOldAuctions(olderThanDays: number = 30): Promise<void> {
  if (!database) {
    throw new Error("Database not initialized");
  }

  const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  const auctionsRef = ref(database, "auctions");
  const snapshot = await get(auctionsRef);

  const deletePromises: Promise<void>[] = [];

  snapshot.forEach((auctionSnapshot) => {
    const status = auctionSnapshot.child("status").val() as AuctionStatus | null;
    if (status && status.endTime < cutoffTime && !status.isActive) {
      deletePromises.push(set(auctionSnapshot.ref, null));
    }
  });

  await Promise.all(deletePromises);
  console.log(`Cleaned up ${deletePromises.length} old auctions`);
}
