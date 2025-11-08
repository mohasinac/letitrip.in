/**
 * Socket.io Client Hook for Live Auctions
 * 
 * Provides real-time auction updates to React components
 * 
 * Usage:
 *   const { socket, connected, bid, setupAutoBid } = useAuctionSocket(auctionId);
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface AuctionState {
  auction: {
    id: string;
    name: string;
    current_bid: number;
    bid_count: number;
    status: string;
    end_time: string;
    reserve_price?: number;
  };
  bids: any[];
  watcherCount: number;
  timestamp: string;
}

interface NewBid {
  auctionId: string;
  bidId: string;
  userId: string;
  amount: number;
  currentBid: number;
  bidCount: number;
  timestamp: string;
  isWinning: boolean;
}

interface CountdownSync {
  auctionId: string;
  endTime: string;
  remainingMs: number;
  serverTime: string;
}

export function useAuctionSocket(auctionId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [latestBid, setLatestBid] = useState<NewBid | null>(null);
  const [countdown, setCountdown] = useState<CountdownSync | null>(null);
  const [watcherCount, setWatcherCount] = useState(0);
  const [autoBidActive, setAutoBidActive] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!auctionId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    
    const newSocket = io(socketUrl, {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server');
      setConnected(true);
      
      // Join auction room
      if (auctionId) {
        newSocket.emit('join-auction', auctionId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });

    // Auction state
    newSocket.on('auction-state', (state: AuctionState) => {
      console.log('[Socket] Received auction state:', state);
      setAuctionState(state);
      setWatcherCount(state.watcherCount);
    });

    // New bid
    newSocket.on('new-bid', (bid: NewBid) => {
      console.log('[Socket] New bid received:', bid);
      setLatestBid(bid);
      
      // Update auction state
      setAuctionState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          auction: {
            ...prev.auction,
            current_bid: bid.currentBid,
            bid_count: bid.bidCount,
          },
          bids: [
            { 
              id: bid.bidId,
              user_id: bid.userId,
              amount: bid.amount,
              created_at: bid.timestamp,
              is_winning: bid.isWinning,
            },
            ...prev.bids.slice(0, 9),
          ],
        };
      });
    });

    // Auto-bid placed
    newSocket.on('auto-bid-placed', (data: any) => {
      console.log('[Socket] Auto-bid placed:', data);
      // Show notification
    });

    // Auto-bid executed (for the auto-bidder)
    newSocket.on('autobid-executed', (data: any) => {
      console.log('[Socket] Your auto-bid was executed:', data);
      // Show notification to user
    });

    // Auction status changed
    newSocket.on('auction-status-changed', (data: any) => {
      console.log('[Socket] Auction status changed:', data);
      setAuctionState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          auction: {
            ...prev.auction,
            status: data.status,
          },
        };
      });
    });

    // Countdown sync
    newSocket.on('countdown-sync', (data: CountdownSync) => {
      setCountdown(data);
    });

    // Ending soon alert
    newSocket.on('ending-soon', (data: any) => {
      console.log('[Socket] Ending soon:', data);
      // Show alert/notification
    });

    return () => {
      if (auctionId) {
        newSocket.emit('leave-auction', auctionId);
      }
      newSocket.close();
      socketRef.current = null;
    };
  }, [auctionId]);

  // Request countdown sync
  const syncCountdown = useCallback(() => {
    if (socket && connected && auctionId) {
      socket.emit('sync-countdown', auctionId);
    }
  }, [socket, connected, auctionId]);

  // Setup auto-bid
  const setupAutoBid = useCallback((maxBid: number, userId: string) => {
    if (socket && connected && auctionId) {
      socket.emit('setup-autobid', { auctionId, userId, maxBid });
      setAutoBidActive(true);
    }
  }, [socket, connected, auctionId]);

  // Cancel auto-bid
  const cancelAutoBid = useCallback((userId: string) => {
    if (socket && connected && auctionId) {
      socket.emit('cancel-autobid', { auctionId, userId });
      setAutoBidActive(false);
    }
  }, [socket, connected, auctionId]);

  // Notify server of new bid (after API call)
  const notifyBidPlaced = useCallback((userId: string, amount: number) => {
    if (socket && connected && auctionId) {
      socket.emit('bid-placed', { auctionId, userId, amount });
    }
  }, [socket, connected, auctionId]);

  return {
    socket,
    connected,
    auctionState,
    latestBid,
    countdown,
    watcherCount,
    autoBidActive,
    syncCountdown,
    setupAutoBid,
    cancelAutoBid,
    notifyBidPlaced,
  };
}
