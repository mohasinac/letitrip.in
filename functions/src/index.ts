/**
 * Firebase Cloud Functions — LetItRip
 *
 * Entry point. All scheduled jobs and Firestore triggers are exported here
 * so the Firebase CLI can discover and deploy them.
 *
 * Free-tier optimisation summary
 * ─────────────────────────────────────────────────────────────────────────
 * Schedule frequencies and memory allocations are tuned to stay within the
 * Blaze plan's monthly free allotment (2 M invocations, 400 K GB-seconds).
 * All jobs set maxInstances: 1 to prevent overlapping runs.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Scheduled Jobs (Cloud Scheduler + Cloud Run)                       │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  auctionSettlement  — every 15 min    settle ended auctions         │
 * │  pendingOrderTimeout— every 2 hrs     cancel stale orders           │
 * │  couponExpiry       — 00:05 UTC       deactivate old coupons        │
 * │  dailyDataCleanup   — 02:00 UTC       purge sessions + tokens       │
 * │  payoutBatch        — 06:00 UTC       dispatch seller payouts       │
 * │  productStatsSync   — 01:00 UTC       recompute avg ratings         │
 * │  cartPrune          — Sun 04:00 UTC   remove stale carts            │
 * │  notificationPrune  — Mon 01:00 UTC   remove old read notifications │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  Firestore Triggers                                                 │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  onBidPlaced        — bids/{id} onCreate                            │
 * │  onOrderStatusChange— orders/{id} onUpdate                          │
 * └─────────────────────────────────────────────────────────────────────┘
 */

// ── Scheduled jobs ────────────────────────────────────────────────────────
export { auctionSettlement } from "./jobs/auctionSettlement";
export { pendingOrderTimeout } from "./jobs/pendingOrderTimeout";
export { couponExpiry } from "./jobs/couponExpiry";
export { dailyDataCleanup } from "./jobs/dailyDataCleanup";
export { payoutBatch } from "./jobs/payoutBatch";
export { productStatsSync } from "./jobs/productStatsSync";
export { cartPrune } from "./jobs/cartPrune";
export { notificationPrune } from "./jobs/notificationPrune";

// ── Firestore triggers ────────────────────────────────────────────────────
export { onBidPlaced } from "./triggers/onBidPlaced";
export { onOrderStatusChange } from "./triggers/onOrderStatusChange";
