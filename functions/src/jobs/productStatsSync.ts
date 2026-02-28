/**
 * Job: Product Stats Sync
 *
 * Runs daily at 01:00 UTC.
 * Recomputes `avgRating` and `reviewCount` on each product document from the
 * `reviews` collection (only approved reviews). Corrects any drift that can
 * accumulate from partial writes, review deletions, or moderation changes
 * during the day.
 *
 * Free-tier notes:
 *   - Memory kept at 256 MiB — work is I/O-bound (Firestore reads), not RAM-bound.
 *   - Concurrency capped at 5 to avoid Firestore read-rate spikes that would
 *     trigger quota errors and force costly retries.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logInfo, logError } from "../utils/logger";
import { SCHEDULES, REGION } from "../config/constants";
import { productRepository, reviewRepository } from "../repositories";

const JOB = "productStatsSync";

async function syncProductStats(productId: string): Promise<void> {
  const { count, avgRating } =
    await reviewRepository.getApprovedRatingAggregate(productId);
  await productRepository.updateStats(productId, avgRating, count);
}

export const productStatsSync = onSchedule(
  {
    schedule: SCHEDULES.DAILY_0100,
    timeZone: "UTC",
    region: REGION,
    // Generous timeout retained — scales with product catalogue size.
    timeoutSeconds: 540,
    // 256 MiB is sufficient: the job holds only one product's worth of
    // review aggregates in memory at a time (I/O-bound, not RAM-bound).
    memory: "256MiB",
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting product stats sync");

    try {
      const productIds = await productRepository.getPublishedIds();

      if (productIds.length === 0) {
        logInfo(JOB, "No published products found");
        return;
      }

      logInfo(JOB, `Syncing stats for ${productIds.length} product(s)`);

      // Cap concurrency at 5 to avoid Firestore read-quota spikes that would
      // trigger retries and inflate both latency and billing on the free tier.
      const CONCURRENCY = 5;
      let succeeded = 0;
      let failed = 0;

      for (let i = 0; i < productIds.length; i += CONCURRENCY) {
        const batch = productIds.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(batch.map(syncProductStats));
        results.forEach((result) => {
          if (result.status === "fulfilled") succeeded++;
          else {
            failed++;
            logError(JOB, "Failed to sync product stats", result.reason);
          }
        });
      }

      logInfo(JOB, "Product stats sync complete", { succeeded, failed });
    } catch (error) {
      logError(JOB, "Fatal error during product stats sync", error);
      throw error;
    }
  },
);
