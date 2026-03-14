/**
 * Firebase Cloud Functions — LetItRip
 *
 * Entry point. All scheduled jobs and Firestore triggers are exported here
 * so the Firebase CLI can discover and deploy them.
 *
 * Plan: Blaze (pay-as-you-go). All jobs are tuned to stay within the monthly
 * free allotment (2 M invocations, 400 K GB-seconds, 3 Cloud Scheduler jobs
 * free → $0.10/job/month beyond). Current totals:
 *
 *   Cloud Scheduler jobs : 13  (10 billable  ≈ $1.00/month)
 *   Invocations/month    : ~15 K  (well under 2 M free tier)
 *   GB-seconds/month     : ~12 K  (well under 400 K free tier)
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Scheduled Jobs (Cloud Scheduler + Cloud Run)                           │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  auctionSettlement      — every 15 min    settle ended auctions          │
 * │  pendingOrderTimeout    — every 2 hrs     cancel stale orders            │
 * │  couponExpiry           — 00:05 UTC       deactivate old coupons         │
 * │  offerExpiry            — 00:15 UTC       expire stale offers + free RC  │
 * │  productStatsSync       — 01:00 UTC       recompute product avg ratings  │
 * │  dailyDataCleanup       — 02:00 UTC       purge sessions + tokens        │
 * │  countersReconcile      — 03:00 UTC       rebuild category & store stats │
 * │  payoutBatch            — 06:00 UTC       dispatch seller payouts        │
 * │  cartPrune              — Sun 04:00 UTC   remove stale carts             │
 * │  notificationPrune      — Mon 01:00 UTC   remove old read notifications  │
 * │  weeklyPayoutEligibility— Sat 05:00 UTC   create payout records          │
 * │  autoPayoutEligibility  — 04:45 UTC       auto-payout (7-day window)     │
 * │  cleanupRtdbEvents      — every 5 min     purge stale RTDB auth/pay nodes│
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  Firestore Triggers                                                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  onBidPlaced        — bids/{id} onCreate                                │
 * │  onOrderStatusChange— orders/{id} onUpdate                              │
 * │  onProductWrite     — products/{id} onWrite                             │
 * │                       → Algolia sync                                    │
 * │                       → category metrics (productCount/auctionCount)    │
 * │                       → store stats (totalProducts)                     │
 * │  onReviewWrite      — reviews/{id} onWrite                              │
 * │                       → product avgRating / reviewCount                 │
 * │                       → store totalReviews / averageRating              │
 * │  onCategoryWrite    — categories/{id} onWrite                           │
 * │                       → Algolia categories index sync                   │
 * │  onStoreWrite       — stores/{id} onWrite                               │
 * │                       → Algolia stores index sync                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// ── Scheduled jobs ────────────────────────────────────────────────────────
export { auctionSettlement } from "./jobs/auctionSettlement";
export { pendingOrderTimeout } from "./jobs/pendingOrderTimeout";
export { couponExpiry } from "./jobs/couponExpiry";
export { offerExpiry } from "./jobs/offerExpiry";
export { productStatsSync } from "./jobs/productStatsSync";
export { dailyDataCleanup } from "./jobs/dailyDataCleanup";
export { countersReconcile } from "./jobs/countersReconcile";
export { payoutBatch } from "./jobs/payoutBatch";
export { cartPrune } from "./jobs/cartPrune";
export { notificationPrune } from "./jobs/notificationPrune";
export { weeklyPayoutEligibility } from "./jobs/weeklyPayoutEligibility";
export { autoPayoutEligibility } from "./jobs/autoPayoutEligibility";
export { cleanupRtdbEvents } from "./jobs/cleanupRtdbEvents";

// ── Firestore triggers ────────────────────────────────────────────────────
export { onBidPlaced } from "./triggers/onBidPlaced";
export { onOrderStatusChange } from "./triggers/onOrderStatusChange";
export { onProductWrite } from "./triggers/onProductWrite";
export { onReviewWrite } from "./triggers/onReviewWrite";
export { onCategoryWrite } from "./triggers/onCategoryWrite";
export { onStoreWrite } from "./triggers/onStoreWrite";
