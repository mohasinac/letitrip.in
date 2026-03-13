/**
 * Job: cleanupRtdbEvents
 *
 * Runs every 5 minutes. Cleans up two kinds of stale RTDB nodes in one
 * invocation, halving the Cloud Scheduler job count vs running them
 * separately.
 *
 * ─── Auth events ─────────────────────────────────────────────────────────────
 * Removes stale `auth_events/{id}` nodes whose `createdAt` is older than
 * 3 minutes. The per-event custom token expires after 5 minutes and the
 * client hard-timeout fires after 2 minutes, so any node still "pending"
 * past 3 minutes will never be consumed. Normal nodes are deleted by the
 * callback route within 10 seconds of outcome, so this job is a safety net
 * for abandoned or crashed popup sessions.
 *
 * ─── Payment events ───────────────────────────────────────────────────────────
 * Removes stale `payment_events/{id}` nodes whose `createdAt` is older than
 * 15 minutes. The per-event custom token expires after 5 minutes and the
 * client hard-timeout fires after 5 minutes, so anything still "pending"
 * after 15 minutes will never complete. Normal nodes are updated by
 * POST /api/payment/verify within seconds of payment completion.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { getRtdb, auth } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { SCHEDULES, REGION } from "../config/constants";

const JOB = "cleanupRtdbEvents";

const AUTH_STALE_MS = 3 * 60 * 1000; // 3 minutes
const PAYMENT_STALE_MS = 15 * 60 * 1000; // 15 minutes

export const cleanupRtdbEvents = onSchedule(
  {
    schedule: SCHEDULES.EVERY_5_MIN,
    region: REGION,
    memory: "128MiB",
    timeoutSeconds: 60,
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting RTDB events cleanup");

    const now = Date.now();

    // ── Auth events ─────────────────────────────────────────────────────────
    try {
      const authSnap = await getRtdb().ref("auth_events").get();

      if (authSnap.exists()) {
        const allEvents = authSnap.val() as Record<
          string,
          { createdAt?: number }
        >;
        const staleAuthIds = Object.entries(allEvents)
          .filter(([, node]) => (node.createdAt ?? 0) < now - AUTH_STALE_MS)
          .map(([id]) => id);

        if (staleAuthIds.length > 0) {
          await Promise.all(
            staleAuthIds.flatMap((id) => [
              getRtdb().ref(`auth_events/${id}`).remove(),
              // Delete the synthetic Firebase Auth user created for the custom token.
              // Non-fatal if it never existed (signInWithCustomToken may not have been called).
              auth.deleteUser(`auth_event_${id}`).catch(() => {}),
            ]),
          );
          logInfo(JOB, "Auth events removed", { count: staleAuthIds.length });
        }
      }
    } catch (authErr) {
      logError(JOB, "Auth events cleanup failed (non-fatal)", authErr);
    }

    // ── Payment events ──────────────────────────────────────────────────────
    try {
      const paySnap = await getRtdb().ref("payment_events").get();

      if (paySnap.exists()) {
        const allPayments = paySnap.val() as Record<
          string,
          { createdAt?: number }
        >;
        const stalePayIds = Object.entries(allPayments)
          .filter(([, node]) => (node.createdAt ?? 0) < now - PAYMENT_STALE_MS)
          .map(([id]) => id);

        if (stalePayIds.length > 0) {
          await Promise.all(
            stalePayIds.map((id) =>
              getRtdb().ref(`payment_events/${id}`).remove(),
            ),
          );
          logInfo(JOB, "Payment events removed", { count: stalePayIds.length });
        }
      }
    } catch (payErr) {
      logError(JOB, "Payment events cleanup failed (non-fatal)", payErr);
    }

    logInfo(JOB, "RTDB events cleanup complete");
  },
);
