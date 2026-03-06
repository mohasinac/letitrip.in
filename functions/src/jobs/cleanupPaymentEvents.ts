/**
 * Job: Payment Event Cleanup
 *
 * Runs every 5 minutes.
 * Removes stale RTDB payment event nodes whose `createdAt` is older than 15 minutes.
 *
 * The per-event custom token expires after 5 minutes and the client hard-timeout
 * fires after 5 minutes, so any node still "pending" past 15 minutes will never
 * be consumed. Deleting them keeps the RTDB tidy and prevents the payment_events
 * path growing unbounded.
 *
 * Normal nodes are updated by POST /api/payment/verify or the webhook within
 * seconds of payment completion, so the vast majority of nodes are short-lived.
 * This job is a safety net for abandoned checkout sessions or network failures.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { rtdb } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { SCHEDULES, REGION } from "../config/constants";

const JOB = "cleanupPaymentEvents";

/** Payment event nodes older than this are considered stale. */
const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

export const cleanupPaymentEvents = onSchedule(
  {
    schedule: SCHEDULES.EVERY_5_MIN,
    region: REGION,
    memory: "128MiB",
    timeoutSeconds: 60,
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting payment events cleanup");

    try {
      const snapshot = await rtdb.ref("payment_events").get();

      if (!snapshot.exists()) {
        logInfo(JOB, "No payment event nodes found");
        return;
      }

      const now = Date.now();
      const staleThreshold = now - STALE_THRESHOLD_MS;
      const allEvents = snapshot.val() as Record<
        string,
        { status?: string; createdAt?: number }
      >;

      const staleIds = Object.entries(allEvents)
        .filter(([, node]) => (node.createdAt ?? 0) < staleThreshold)
        .map(([id]) => id);

      if (staleIds.length === 0) {
        logInfo(JOB, "No stale payment event nodes");
        return;
      }

      await Promise.all(
        staleIds.map((id) => rtdb.ref(`payment_events/${id}`).remove()),
      );

      logInfo(JOB, "Payment events cleanup complete", {
        deleted: staleIds.length,
      });
    } catch (error) {
      logError(JOB, "Error during payment events cleanup", error);
      throw error;
    }
  },
);
