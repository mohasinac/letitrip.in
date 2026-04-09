/**
 * useRealtimeBids Hook
 *
 * Subscribes to live auction bid updates via Server-Sent Events (SSE).
 *
 * Uses GET /api/realtime/bids/[id] — a streaming Next.js route that keeps a
 * Firebase Admin RTDB listener open server-side and pushes updates to the
 * browser via text/event-stream.  No Firebase client SDK required.
 *
 * @example
 * ```tsx
 * const { currentBid, bidCount, lastBid, connected } = useRealtimeBids(productId);
 * ```
 */

"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/constants";
import { logger } from "@mohasinac/appkit/core";

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
  /** Current highest bid — most recent value pushed from the server */
  currentBid: number | null;
  /** Total active bid count */
  bidCount: number | null;
  /** Info about the most recent bid placed */
  lastBid: RealtimeBidData["lastBid"];
  /** Whether the SSE connection is live */
  connected: boolean;
  /** Last time the data was updated (epoch ms) */
  updatedAt: number | null;
}

/**
 * Hook that subscribes to real-time bid updates via SSE.
 *
 * Falls back gracefully when SSE is unavailable or `productId` is null.
 *
 * @param productId - The auction product ID to subscribe to, or null to disable
 */
export function useRealtimeBids(
  productId: string | null,
): UseRealtimeBidsReturn {
  const [data, setData] = useState<RealtimeBidData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!productId || typeof EventSource === "undefined") {
      setConnected(false);
      return;
    }

    const url = API_ENDPOINTS.REALTIME.BIDS_SSE(productId);
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as {
          type: string;
          data?: RealtimeBidData | null;
        };
        if (msg.type === "connected") {
          setConnected(true);
        } else if (msg.type === "update") {
          setData(msg.data ?? null);
          setConnected(true);
        } else if (msg.type === "error") {
          setConnected(false);
        }
      } catch {
        logger.warn("[useRealtimeBids] Failed to parse SSE message");
      }
    };

    es.onerror = () => {
      // EventSource will attempt to reconnect automatically.
      setConnected(false);
      logger.warn("[useRealtimeBids] SSE connection error — will retry");
    };

    return () => {
      es.close();
      setConnected(false);
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
