/**
 * useRealtimeBids Hook
 *
 * Subscribes to Firebase Realtime Database for live auction bid updates.
 * Replaces polling-based updates with push-based streaming.
 *
 * @example
 * ```tsx
 * const { currentBid, bidCount, lastBid, connected } = useRealtimeBids(productId);
 * ```
 */

"use client";

import { useEffect, useState } from "react";
import { ref, onValue, off, type DatabaseReference } from "firebase/database";
import { realtimeDb } from "@/lib/firebase/config";

export interface RealtimeBidData {
  currentBid: number;
  bidCount: number;
  lastBid: {
    amount: number;
    bidderName: string;
    timestamp: number;
  } | null;
  updatedAt: number;
}

export interface UseRealtimeBidsReturn {
  /** Current highest bid from Realtime DB (most up-to-date) */
  currentBid: number | null;
  /** Total active bid count */
  bidCount: number | null;
  /** Info about the most recent bid placed */
  lastBid: RealtimeBidData["lastBid"];
  /** Whether the RTDB connection is live */
  connected: boolean;
  /** Last time the data was updated (epoch ms) */
  updatedAt: number | null;
}

/**
 * Hook that subscribes to real-time bid updates via Firebase Realtime Database.
 *
 * Falls back gracefully when RTDB is unavailable or `productId` is null.
 * In development, RTDB may not be configured — hook works silently with null values.
 *
 * @param productId - The auction product ID to subscribe to, or null to disable
 */
export function useRealtimeBids(
  productId: string | null,
): UseRealtimeBidsReturn {
  const [data, setData] = useState<RealtimeBidData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!productId || !realtimeDb) {
      setConnected(false);
      return;
    }

    const bidRef: DatabaseReference = ref(
      realtimeDb,
      `/auction-bids/${productId}`,
    );

    const unsubscribe = onValue(
      bidRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val() as RealtimeBidData;
          setData(val);
        } else {
          setData(null);
        }
        setConnected(true);
      },
      (error) => {
        // RTDB error — fall back to polling
        console.warn(
          "[useRealtimeBids] RTDB subscription error:",
          error.message,
        );
        setConnected(false);
      },
    );

    return () => {
      off(bidRef);
    };
  }, [productId]);

  return {
    currentBid: data?.currentBid ?? null,
    bidCount: data?.bidCount ?? null,
    lastBid: data?.lastBid ?? null,
    connected,
    updatedAt: data?.updatedAt ?? null,
  };
}
