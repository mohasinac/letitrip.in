/**
 * Socket.io Server for Live Auctions
 *
 * Provides real-time updates for:
 * - New bids
 * - Bid history
 * - Countdown timers
 * - Auction status changes
 * - Auto-bid events
 */

import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { Collections } from "@/app/api/lib/firebase/collections";
import { Timestamp } from "firebase-admin/firestore";

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 */
export function initializeSocketServer(httpServer: HTTPServer) {
  if (io) {
    console.log("[Socket.io] Server already initialized");
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socketio",
  });

  console.log("[Socket.io] Server initialized");

  // Handle connections
  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join auction room
    socket.on("join-auction", (auctionId: string) => {
      socket.join(`auction-${auctionId}`);
      console.log(
        `[Socket.io] Client ${socket.id} joined auction ${auctionId}`,
      );

      // Send current auction state
      sendAuctionState(auctionId, socket.id);
    });

    // Leave auction room
    socket.on("leave-auction", (auctionId: string) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`[Socket.io] Client ${socket.id} left auction ${auctionId}`);
    });

    // Place bid (handled by API, socket just listens for confirmation)
    socket.on(
      "bid-placed",
      async (data: { auctionId: string; userId: string; amount: number }) => {
        // Broadcast to all watchers in the room
        io?.to(`auction-${data.auctionId}`).emit("new-bid", {
          auctionId: data.auctionId,
          userId: data.userId,
          amount: data.amount,
          timestamp: new Date().toISOString(),
        });

        console.log(
          `[Socket.io] Bid placed on auction ${data.auctionId}: ₹${data.amount}`,
        );
      },
    );

    // Setup auto-bid
    socket.on(
      "setup-autobid",
      (data: { auctionId: string; userId: string; maxBid: number }) => {
        socket.join(`autobid-${data.auctionId}-${data.userId}`);
        console.log(
          `[Socket.io] Auto-bid setup for user ${data.userId} on auction ${data.auctionId}: max ₹${data.maxBid}`,
        );
      },
    );

    // Cancel auto-bid
    socket.on(
      "cancel-autobid",
      (data: { auctionId: string; userId: string }) => {
        socket.leave(`autobid-${data.auctionId}-${data.userId}`);
        console.log(
          `[Socket.io] Auto-bid cancelled for user ${data.userId} on auction ${data.auctionId}`,
        );
      },
    );

    // Heartbeat for countdown sync
    socket.on("sync-countdown", (auctionId: string) => {
      sendCountdownSync(auctionId);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get Socket.io server instance
 */
export function getSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Broadcast new bid to all watchers
 */
export async function broadcastNewBid(auctionId: string, bid: any) {
  if (!io) {
    console.warn("[Socket.io] Server not initialized");
    return;
  }

  // Get auction data
  const auctionDoc = await Collections.auctions().doc(auctionId).get();
  if (!auctionDoc.exists) return;

  const auction = { id: auctionDoc.id, ...auctionDoc.data() } as any;

  // Broadcast to auction room
  io.to(`auction-${auctionId}`).emit("new-bid", {
    auctionId,
    bidId: bid.id,
    userId: bid.user_id,
    amount: bid.amount,
    currentBid: auction.current_bid,
    bidCount: auction.bid_count,
    timestamp: bid.created_at,
    isWinning: bid.is_winning,
  });

  console.log(
    `[Socket.io] Broadcast new bid: ₹${bid.amount} on auction ${auctionId}`,
  );

  // Check for auto-bidders and trigger auto-bids
  await processAutoBids(auctionId, bid.amount, bid.user_id);
}

/**
 * Process auto-bids when new bid is placed
 */
async function processAutoBids(
  auctionId: string,
  currentBid: number,
  excludeUserId: string,
) {
  // Get auto-bid settings for this auction
  const autoBidsSnapshot = await Collections.auctions()
    .doc(auctionId)
    .collection("auto_bids")
    .where("is_active", "==", true)
    .where("max_bid", ">", currentBid)
    .get();

  if (autoBidsSnapshot.empty) return;

  // Find highest auto-bidder
  let highestAutoBid: any = null;
  let highestAutoBidAmount = currentBid;

  autoBidsSnapshot.forEach((doc) => {
    const autoBid = { id: doc.id, ...doc.data() } as any;
    if (
      autoBid.user_id !== excludeUserId &&
      autoBid.max_bid > highestAutoBidAmount
    ) {
      highestAutoBid = autoBid;
      highestAutoBidAmount = autoBid.max_bid;
    }
  });

  if (highestAutoBid) {
    // Calculate auto-bid amount (current bid + minimum increment)
    const minIncrement = 100; // ₹100
    const autoBidAmount = Math.min(
      currentBid + minIncrement,
      highestAutoBid.max_bid,
    );

    // Place auto-bid via API
    console.log(
      `[Socket.io] Auto-bid triggered: User ${highestAutoBid.user_id} bids ₹${autoBidAmount}`,
    );

    // Emit auto-bid event
    io?.to(`auction-${auctionId}`).emit("auto-bid-placed", {
      auctionId,
      userId: highestAutoBid.user_id,
      amount: autoBidAmount,
      maxBid: highestAutoBid.max_bid,
      timestamp: new Date().toISOString(),
    });

    // Notify the auto-bidder
    io?.to(`autobid-${auctionId}-${highestAutoBid.user_id}`).emit(
      "autobid-executed",
      {
        auctionId,
        amount: autoBidAmount,
        remainingMax: highestAutoBid.max_bid - autoBidAmount,
      },
    );
  }
}

/**
 * Broadcast auction status change
 */
export function broadcastAuctionStatus(
  auctionId: string,
  status: string,
  data?: any,
) {
  if (!io) return;

  io.to(`auction-${auctionId}`).emit("auction-status-changed", {
    auctionId,
    status,
    ...data,
    timestamp: new Date().toISOString(),
  });

  console.log(`[Socket.io] Broadcast status change: ${auctionId} → ${status}`);
}

/**
 * Broadcast countdown sync
 */
async function sendCountdownSync(auctionId: string) {
  if (!io) return;

  const auctionDoc = await Collections.auctions().doc(auctionId).get();
  if (!auctionDoc.exists) return;

  const auction = auctionDoc.data() as any;
  const endTime =
    auction.end_time instanceof Timestamp
      ? auction.end_time.toDate()
      : new Date(auction.end_time);

  const now = new Date();
  const remainingMs = endTime.getTime() - now.getTime();

  io.to(`auction-${auctionId}`).emit("countdown-sync", {
    auctionId,
    endTime: endTime.toISOString(),
    remainingMs: Math.max(0, remainingMs),
    serverTime: now.toISOString(),
  });
}

/**
 * Send current auction state to a specific client
 */
async function sendAuctionState(auctionId: string, socketId: string) {
  if (!io) return;

  try {
    const auctionDoc = await Collections.auctions().doc(auctionId).get();
    if (!auctionDoc.exists) return;

    const auction = { id: auctionDoc.id, ...auctionDoc.data() } as any;

    // Get recent bids
    const bidsSnapshot = await Collections.bids()
      .where("auction_id", "==", auctionId)
      .orderBy("created_at", "desc")
      .limit(10)
      .get();

    const bids = bidsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get watcher count (approximate - current room size)
    const room = io.sockets.adapter.rooms.get(`auction-${auctionId}`);
    const watcherCount = room ? room.size : 0;

    // Send state to specific client
    io.to(socketId).emit("auction-state", {
      auction: {
        id: auction.id,
        name: auction.name,
        current_bid: auction.current_bid,
        bid_count: auction.bid_count,
        status: auction.status,
        end_time: auction.end_time,
        reserve_price: auction.reserve_price,
      },
      bids,
      watcherCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Socket.io] Error sending auction state:", error);
  }
}

/**
 * Broadcast ending soon alert (called by cron job)
 */
export function broadcastEndingSoon(
  auctionId: string,
  minutesRemaining: number,
) {
  if (!io) return;

  io.to(`auction-${auctionId}`).emit("ending-soon", {
    auctionId,
    minutesRemaining,
    message: `Auction ending in ${minutesRemaining} minute${minutesRemaining !== 1 ? "s" : ""}!`,
    timestamp: new Date().toISOString(),
  });

  console.log(
    `[Socket.io] Broadcast ending soon: ${auctionId} (${minutesRemaining}m remaining)`,
  );
}

/**
 * Get active watcher count for an auction
 */
export function getWatcherCount(auctionId: string): number {
  if (!io) return 0;

  const room = io.sockets.adapter.rooms.get(`auction-${auctionId}`);
  return room ? room.size : 0;
}

/**
 * Cleanup on server shutdown
 */
export function cleanupSocketServer() {
  if (io) {
    io.close();
    io = null;
    console.log("[Socket.io] Server closed");
  }
}
