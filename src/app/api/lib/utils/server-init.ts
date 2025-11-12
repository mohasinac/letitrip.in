/**
 * Server Initialization
 * Initializes server-side services when the app starts
 *
 * IMPORTANT: This only works for local development!
 *
 * For Vercel/Production:
 * - Use Vercel Cron Jobs (defined in vercel.json)
 * - Cron endpoint: /api/cron/process-auctions
 * - node-cron doesn't work on serverless platforms
 *
 * This file is kept for local development where we have a persistent Node.js process.
 */

import { startAuctionScheduler } from "./auction-scheduler";

let initialized = false;

export function initializeServer() {
  if (initialized) {
    console.log("[Server Init] Already initialized, skipping...");
    return;
  }

  // Check if we're on Vercel (serverless)
  const isVercel = process.env.VERCEL === "1";

  if (isVercel) {
    console.log(
      "[Server Init] Running on Vercel - skipping node-cron (use Vercel Cron instead)"
    );
    console.log(
      "[Server Init] Vercel Cron configured at: /api/cron/process-auctions"
    );
    initialized = true;
    return;
  }

  console.log(
    "[Server Init] Starting server initialization (local development)..."
  );

  try {
    // Start auction scheduler (only for local development)
    startAuctionScheduler();

    initialized = true;
    console.log("[Server Init] Server initialization complete");
  } catch (error) {
    console.error("[Server Init] Failed to initialize server:", error);
    throw error;
  }
}

// Auto-initialize on import (for local development)
if (
  process.env.NODE_ENV === "development" ||
  process.env.ENABLE_CRON === "true"
) {
  initializeServer();
}
