/**
 * Firebase Cloud Functions — LetItRip
 *
 * Thin binding barrel. Every job/trigger/HTTPS endpoint imports its pure
 * handler from `@mohasinac/appkit/server` and wraps it with the appkit
 * Firebase runtime adapter (`bindToFirebase.{schedule,documentWritten,https}`).
 *
 * Adding a new function: write the pure handler in
 * `appkit/src/_internal/server/jobs/handlers/<name>.ts` and add a single
 * binding line here. The handler stays portable; only the binding is
 * Firebase-specific.
 *
 * Plan: Blaze (pay-as-you-go). Scheduler invocations + memory tuned to stay
 * within free tier (2 M invocations, 400 K GB-seconds). Cloud Scheduler
 * has 3 free job slots → $0.10/job/month beyond. 14 schedules ⇒ ~$1.10/mo.
 */

import {
  // Scheduled-job handlers
  auctionSettlementHandler,
  autoPayoutEligibilityHandler,
  cartPruneHandler,
  cleanupRtdbEventsHandler,
  countersReconcileHandler,
  couponExpiryHandler,
  dailyDataCleanupHandler,
  mediaTmpCleanupHandler,
  notificationPruneHandler,
  offerExpiryHandler,
  payoutBatchHandler,
  pendingOrderTimeoutHandler,
  positionsReconcileHandler,
  productStatsSyncHandler,
  weeklyPayoutEligibilityHandler,
  // Firestore-trigger handlers
  onBidPlacedHandler,
  onCategoryWriteHandler,
  onOrderCreateHandler,
  onOrderStatusChangeHandler,
  onProductStockChangeHandler,
  onProductWriteHandler,
  onReviewWriteHandler,
  onStoreWriteHandler,
  // HTTPS / callable handlers
  adminAnalyticsHandler,
  listingProcessorHandler,
  promotionsHandler,
  storeAnalyticsHandler,
  // SB1-L — S7 PrizeDraws cohort (7 functions)
  prizeRevealOpenHandler,
  prizeRevealCloseHandler,
  prizeRevealExpiryHandler,
  prizeRevealReminderHandler,
  bundleStockSyncHandler,
  triggerEventRaffleHandler,
  assignSpinPrizeHandler,
  // BAN9 — support ticket lifecycle + ban audit
  onSupportTicketCreateHandler,
  onSupportTicketUpdateHandler,
  onUserBanChangeHandler,
  // Adapter
  bindToFirebase,
} from "@mohasinac/appkit/jobs";

const REGION = "asia-south1";

// ── Scheduled jobs ────────────────────────────────────────────────────────
export const auctionSettlement = bindToFirebase.schedule(
  "auctionSettlement",
  auctionSettlementHandler,
  { schedule: "every 15 minutes", timeZone: "UTC", region: REGION, timeoutSeconds: 300, memory: "256MiB", maxInstances: 1 },
);

export const pendingOrderTimeout = bindToFirebase.schedule(
  "pendingOrderTimeout",
  pendingOrderTimeoutHandler,
  { schedule: "0 */2 * * *", region: REGION, timeoutSeconds: 120, memory: "256MiB", maxInstances: 1 },
);

export const couponExpiry = bindToFirebase.schedule(
  "couponExpiry",
  couponExpiryHandler,
  { schedule: "5 0 * * *", timeZone: "UTC", region: REGION, timeoutSeconds: 120, memory: "256MiB", maxInstances: 1 },
);

export const offerExpiry = bindToFirebase.schedule(
  "offerExpiry",
  offerExpiryHandler,
  { schedule: "15 0 * * *", timeZone: "UTC", region: REGION, timeoutSeconds: 120, memory: "256MiB", maxInstances: 1 },
);

export const productStatsSync = bindToFirebase.schedule(
  "productStatsSync",
  productStatsSyncHandler,
  { schedule: "0 1 * * *", timeZone: "UTC", region: REGION, timeoutSeconds: 540, memory: "256MiB", maxInstances: 1 },
);

export const dailyDataCleanup = bindToFirebase.schedule(
  "dailyDataCleanup",
  dailyDataCleanupHandler,
  { schedule: "0 2 * * *", timeZone: "UTC", region: REGION, timeoutSeconds: 300, memory: "256MiB", maxInstances: 1 },
);

export const countersReconcile = bindToFirebase.schedule(
  "countersReconcile",
  countersReconcileHandler,
  { schedule: "0 3 * * *", timeZone: "UTC", region: REGION, timeoutSeconds: 540, memory: "256MiB", maxInstances: 1 },
);

export const positionsReconcile = bindToFirebase.schedule(
  "positionsReconcile",
  positionsReconcileHandler,
  { schedule: "30 3 * * *", timeZone: "UTC", region: REGION, timeoutSeconds: 120, memory: "256MiB", maxInstances: 1 },
);

export const payoutBatch = bindToFirebase.schedule(
  "payoutBatch",
  payoutBatchHandler,
  { schedule: "0 6 * * *", timeZone: "UTC", region: REGION, timeoutSeconds: 540, memory: "256MiB", maxInstances: 1 },
);

export const cartPrune = bindToFirebase.schedule(
  "cartPrune",
  cartPruneHandler,
  { schedule: "0 4 * * 0", timeZone: "UTC", region: REGION, timeoutSeconds: 120, memory: "256MiB", maxInstances: 1 },
);

export const notificationPrune = bindToFirebase.schedule(
  "notificationPrune",
  notificationPruneHandler,
  { schedule: "0 1 * * 1", timeZone: "UTC", region: REGION, timeoutSeconds: 120, memory: "256MiB", maxInstances: 1 },
);

export const weeklyPayoutEligibility = bindToFirebase.schedule(
  "weeklyPayoutEligibility",
  weeklyPayoutEligibilityHandler,
  { schedule: "0 5 * * 6", timeZone: "UTC", region: REGION, timeoutSeconds: 540, memory: "256MiB", maxInstances: 1 },
);

export const autoPayoutEligibility = bindToFirebase.schedule(
  "autoPayoutEligibility",
  autoPayoutEligibilityHandler,
  { schedule: "45 4 * * *", timeZone: "UTC", region: REGION, timeoutSeconds: 540, memory: "256MiB", maxInstances: 1 },
);

export const cleanupRtdbEvents = bindToFirebase.schedule(
  "cleanupRtdbEvents",
  cleanupRtdbEventsHandler,
  { schedule: "every 5 minutes", region: REGION, timeoutSeconds: 60, memory: "256MiB", maxInstances: 1 },
);

export const mediaTmpCleanup = bindToFirebase.schedule(
  "mediaTmpCleanup",
  mediaTmpCleanupHandler,
  { schedule: "30 4 * * *", timeZone: "Asia/Kolkata", region: REGION, timeoutSeconds: 540, memory: "256MiB", maxInstances: 1 },
);

// ── Firestore triggers ────────────────────────────────────────────────────
export const onBidPlaced = bindToFirebase.documentCreated(
  "onBidPlaced",
  onBidPlacedHandler,
  { document: "bids/{bidId}", region: REGION },
);

export const onOrderCreate = bindToFirebase.documentCreated(
  "onOrderCreate",
  onOrderCreateHandler,
  { document: "orders/{orderId}", region: REGION },
);

export const onOrderStatusChange = bindToFirebase.documentUpdated(
  "onOrderStatusChange",
  onOrderStatusChangeHandler,
  { document: "orders/{orderId}", region: REGION },
);

export const onProductWrite = bindToFirebase.documentWritten(
  "onProductWrite",
  onProductWriteHandler,
  { document: "products/{productId}", region: REGION },
);

// SB-UNI-V — recomputes bundleStockStatus on bundle categories +
// activeMemberCount on groupedListings when a product's available/
// unavailable state flips.
export const onProductStockChange = bindToFirebase.documentWritten(
  "onProductStockChange",
  onProductStockChangeHandler,
  { document: "products/{productId}", region: REGION },
);

export const onReviewWrite = bindToFirebase.documentWritten(
  "onReviewWrite",
  onReviewWriteHandler,
  { document: "reviews/{reviewId}", region: REGION },
);

export const onCategoryWrite = bindToFirebase.documentWritten(
  "onCategoryWrite",
  onCategoryWriteHandler,
  { document: "categories/{categoryId}", region: REGION },
);

export const onStoreWrite = bindToFirebase.documentWritten(
  "onStoreWrite",
  onStoreWriteHandler,
  { document: "stores/{storeId}", region: REGION },
);

// ── HTTPS endpoints (server-to-server, x-internal-secret auth) ────────────
export const adminAnalytics = bindToFirebase.https(
  "adminAnalytics",
  adminAnalyticsHandler,
  { region: REGION, timeoutSeconds: 120, memory: "512MiB", maxInstances: 10, cors: false, secretEnvVar: "LETITRIP_INTERNAL_SECRET" },
);

export const storeAnalytics = bindToFirebase.https(
  "storeAnalytics",
  storeAnalyticsHandler,
  { region: REGION, timeoutSeconds: 120, memory: "256MiB", maxInstances: 20, cors: false, secretEnvVar: "LETITRIP_INTERNAL_SECRET" },
);

export const promotionsApi = bindToFirebase.https(
  "promotionsApi",
  promotionsHandler,
  { region: REGION, timeoutSeconds: 60, memory: "256MiB", maxInstances: 10, cors: false, secretEnvVar: "LETITRIP_INTERNAL_SECRET" },
);

export const listingProcessor = bindToFirebase.https(
  "listingProcessor",
  listingProcessorHandler,
  { region: REGION, timeoutSeconds: 30, memory: "256MiB", maxInstances: 20, minInstances: 0, cors: false, secretEnvVar: "LETITRIP_INTERNAL_SECRET" },
);

// ── S7 PrizeDraws cohort (SB1-L) ─────────────────────────────────────────
// Scheduled jobs:
//   prizeRevealOpen     every 5 min  — flip pending→open + notify (SB8-D)
//   prizeRevealClose    every 5 min  — flip open→closed
//   prizeRevealExpiry   every 6 hrs  — auto-refund unrevealed past deadline (SB8-B)
//   prizeRevealReminder daily 10 IST — nudge buyers <24h to deadline (SB8-E)
//   bundleStockSync     daily 10 IST — flip bundle isSold if any item OOS
// Callables (internal secret-gated):
//   triggerEventRaffle  — pick raffle winner via crypto.randomInt (SB9-D)
//   assignSpinPrize     — weighted random spin prize + coupon issue (SB9-E)

export const prizeRevealOpen = bindToFirebase.schedule(
  "prizeRevealOpen",
  prizeRevealOpenHandler,
  { schedule: "every 5 minutes", region: REGION, timeoutSeconds: 120, memory: "256MiB", maxInstances: 1 },
);

export const prizeRevealClose = bindToFirebase.schedule(
  "prizeRevealClose",
  prizeRevealCloseHandler,
  { schedule: "every 5 minutes", region: REGION, timeoutSeconds: 60, memory: "256MiB", maxInstances: 1 },
);

export const prizeRevealExpiry = bindToFirebase.schedule(
  "prizeRevealExpiry",
  prizeRevealExpiryHandler,
  { schedule: "0 */6 * * *", timeZone: "UTC", region: REGION, timeoutSeconds: 300, memory: "256MiB", maxInstances: 1 },
);

export const prizeRevealReminder = bindToFirebase.schedule(
  "prizeRevealReminder",
  prizeRevealReminderHandler,
  { schedule: "0 10 * * *", timeZone: "Asia/Kolkata", region: REGION, timeoutSeconds: 300, memory: "256MiB", maxInstances: 1 },
);

export const bundleStockSync = bindToFirebase.schedule(
  "bundleStockSync",
  bundleStockSyncHandler,
  { schedule: "5 10 * * *", timeZone: "Asia/Kolkata", region: REGION, timeoutSeconds: 540, memory: "256MiB", maxInstances: 1 },
);

export const triggerEventRaffle = bindToFirebase.https(
  "triggerEventRaffle",
  triggerEventRaffleHandler,
  { region: REGION, timeoutSeconds: 60, memory: "256MiB", maxInstances: 5, cors: false, secretEnvVar: "LETITRIP_INTERNAL_SECRET" },
);

export const assignSpinPrize = bindToFirebase.https(
  "assignSpinPrize",
  assignSpinPrizeHandler,
  { region: REGION, timeoutSeconds: 30, memory: "256MiB", maxInstances: 10, cors: false, secretEnvVar: "LETITRIP_INTERNAL_SECRET" },
);

// ── BAN9 — support ticket lifecycle + user ban audit trail ────────────────
// onSupportTicketCreate  — confirm to user + (future) auto-assign routing
// onSupportTicketUpdate  — notify user on status changes (resolved/closed/waiting)
// onUserBanChange        — append audit entries to users/{uid}/banHistory

export const onSupportTicketCreate = bindToFirebase.documentCreated(
  "onSupportTicketCreate",
  onSupportTicketCreateHandler,
  { document: "supportTickets/{ticketId}", region: REGION },
);

export const onSupportTicketUpdate = bindToFirebase.documentUpdated(
  "onSupportTicketUpdate",
  onSupportTicketUpdateHandler,
  { document: "supportTickets/{ticketId}", region: REGION },
);

export const onUserBanChange = bindToFirebase.documentUpdated(
  "onUserBanChange",
  onUserBanChangeHandler,
  { document: "users/{uid}", region: REGION },
);
