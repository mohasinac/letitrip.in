"use client";

import { useEffect, useState } from "react";

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
  currentBid: number | null;
  bidCount: number | null;
  lastBid: RealtimeBidData["lastBid"];
  connected: boolean;
  updatedAt: number | null;
}

export function useRealtimeBids(
  productId: string | null,
  getEndpoint: (id: string) => string = (id) => `/api/realtime/bids/${id}`,
): UseRealtimeBidsReturn {
  const [data, setData] = useState<RealtimeBidData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!productId || typeof EventSource === "undefined") {
      setConnected(false);
      return;
    }

    const es = new EventSource(getEndpoint(productId));

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as {
          type: string;
          data?: RealtimeBidData | null;
        };

        if (msg.type === "connected") {
          setConnected(true);
          return;
        }

        if (msg.type === "update") {
          setData(msg.data ?? null);
          setConnected(true);
          return;
        }

        if (msg.type === "error") {
          setConnected(false);
        }
      } catch {
        console.warn("[useRealtimeBids] Failed to parse SSE message");
      }
    };

    es.onerror = () => {
      setConnected(false);
      console.warn("[useRealtimeBids] SSE connection error");
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [getEndpoint, productId]);

  return {
    currentBid: data?.currentBid ?? null,
    bidCount: data?.bidCount ?? null,
    lastBid: data?.lastBid ?? null,
    connected,
    updatedAt: data?.updatedAt ?? null,
  };
}