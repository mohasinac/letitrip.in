/**
 * Job: Auth Event Cleanup
 *
 * Runs every 5 minutes.
 * Removes stale RTDB auth event nodes whose `createdAt` is older than 3 minutes.
 *
 * The per-event custom token expires after 5 minutes, and the client hard-timeout
 * fires after 2 minutes — so any node that is still "pending" past 3 minutes
 * will never be consumed. Deleting them keeps the RTDB tidy and prevents the
 * auth_events path growing unbounded.
 *
 * Normal nodes are deleted by the callback route 10 seconds after outcome is
 * written, so the vast majority of cleanup happens without this job. The job
 * is a safety net for abandoned or crashed popup sessions.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { rtdb } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { SCHEDULES, REGION } from "../config/constants";

const JOB = "cleanupAuthEvents";

/** Auth event nodes older than this are considered stale. */
const STALE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes

export const cleanupAuthEvents = onSchedule(
  {
    schedule: SCHEDULES.EVERY_5_MIN,
    region: REGION,
    memory: "128MiB",
    timeoutSeconds: 60,
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting auth events cleanup");

    try {
      const snapshot = await rtdb.ref("auth_events").get();

      if (!snapshot.exists()) {
        logInfo(JOB, "No auth event nodes found");
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
        logInfo(JOB, "No stale auth event nodes");
        return;
      }

      // Delete each stale node individually (Realtime DB has no batch delete)
      await Promise.all(
        staleIds.map((id) => rtdb.ref(`auth_events/${id}`).remove()),
      );

      logInfo(JOB, "Auth events cleanup complete", {
        deleted: staleIds.length,
      });
    } catch (error) {
      logError(JOB, "Error during auth events cleanup", error);
      throw error;
    }
  },
);
