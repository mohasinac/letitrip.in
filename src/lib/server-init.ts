/**
 * Server Initialization
 * Initializes server-side services when the app starts
 * Import this in instrumentation.ts or root layout
 */

import { startAuctionScheduler } from './auction-scheduler';

let initialized = false;

export function initializeServer() {
  if (initialized) {
    console.log('[Server Init] Already initialized, skipping...');
    return;
  }

  console.log('[Server Init] Starting server initialization...');

  try {
    // Start auction scheduler
    startAuctionScheduler();
    
    initialized = true;
    console.log('[Server Init] Server initialization complete');
  } catch (error) {
    console.error('[Server Init] Failed to initialize server:', error);
    throw error;
  }
}

// Auto-initialize on import (for production)
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
  initializeServer();
}
