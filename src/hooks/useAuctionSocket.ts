/**
 * Firebase Realtime Database Hook for Live Auctions
 *
 * Provides real-time auction updates to React components
 *
 * Usage:
 *   const { connected, currentBid, bidCount, bids, placeBid } = useAuctionSocket(auctionId);
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  subscribeToAuction,
  subscribeToAuctionBids,
  type AuctionStatus,
  type AuctionBid,
} from "@/lib/firebase-realtime";

interface AuctionState {
  currentBid: number;
  bidCount: number;
  isActive: boolean;
  endTime: number;
  winnerId?: string;
  lastUpdate: number;
}

export function useAuctionSocket(auctionId: string | null) {
  const [connected, setConnected] = useState(false);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [bids, setBids] = useState<AuctionBid[]>([]);
  const [latestBid, setLatestBid] = useState<AuctionBid | null>(null);

  // Subscribe to auction status updates
  useEffect(() => {
    if (!auctionId) return;

    setConnected(true);
    console.log("[Firebase] Subscribing to auction:", auctionId);

    const unsubscribeStatus = subscribeToAuction(
      auctionId,
      (status: AuctionStatus) => {
        console.log("[Firebase] Auction status updated:", status);
        setAuctionState({
          currentBid: status.currentBid,
          bidCount: status.bidCount,
          isActive: status.isActive,
          endTime: status.endTime,
          winnerId: status.winnerId,
          lastUpdate: status.lastUpdate,
        });
      }
    );

    const unsubscribeBids = subscribeToAuctionBids(
      auctionId,
      (updatedBids: AuctionBid[]) => {
        console.log("[Firebase] Bids updated:", updatedBids);
        setBids(updatedBids);
        if (updatedBids.length > 0) {
          setLatestBid(updatedBids[0]); // Most recent bid
        }
      }
    );

    return () => {
      console.log("[Firebase] Unsubscribing from auction:", auctionId);
      unsubscribeStatus();
      unsubscribeBids();
      setConnected(false);
    };
  }, [auctionId]);

  // Place a bid through API
  const placeBid = useCallback(
    async (userId: string, userName: string, amount: number) => {
      if (!auctionId) return { success: false, error: "No auction ID" };

      try {
        // Call API route to place bid (which will update Firebase)
        const response = await fetch("/api/auctions/bid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auctionId, userId, userName, amount }),
        });

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("[Firebase] Failed to place bid:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [auctionId]
  );

  return {
    connected,
    auctionState,
    currentBid: auctionState?.currentBid ?? 0,
    bidCount: auctionState?.bidCount ?? 0,
    isActive: auctionState?.isActive ?? false,
    endTime: auctionState?.endTime ?? 0,
    winnerId: auctionState?.winnerId,
    bids,
    latestBid,
    placeBid,
  };
}
