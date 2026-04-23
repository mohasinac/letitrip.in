/**
 * Job: Daily Data Cleanup
 *
 * Runs daily at 02:00 UTC.
 * Combines expired-session and expired-token cleanup into a single invocation
 * to minimise Cloud Function cold-starts and invocation charges on the free
 * tier. Both tasks are lightweight I/O sweeps that complete in well under a
 * minute, so sharing one instance has no meaningful latency impact.
 *
 *   1. Deletes all session documents where `expiresAt < now`.
 *   2. Deletes all email-verification token documents whose `expiresAt` is past.
 *   3. Deletes all password-reset token documents whose `expiresAt` is past.
 *
 * Free-tier note: merging tasks 1-3 saves one full invocation charge (and one
 * cold-start) every day compared to running separate session and token jobs.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  sessionRepository,
  tokenRepository,
} from "../lib/appkit";
import { logInfo, logError } from "../utils/logger";
import { batchDelete } from "../utils/batchHelper";
import { SCHEDULES, REGION } from "../config/constants";

const JOB = "dailyDataCleanup";

export const dailyDataCleanup = onSchedule(
  {
    schedule: SCHEDULES.DAILY_0200,
    timeZone: "UTC",
    region: REGION,
    // 180 s is generous for three small batch-delete sweeps.
    timeoutSeconds: 180,
    memory: "256MiB",
    // Prevent overlapping runs if Firestore is slow on a given day.
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting daily data cleanup (sessions + tokens)");
    const now = new Date();

    try {
      // ── 1. Expired sessions ─────────────────────────────────────────────
      const sessionRefs = await sessionRepository.getExpiredRefs(now);
      const sessionsDeleted = await batchDelete(sessionRefs);
      logInfo(JOB, "Session cleanup complete", { deleted: sessionsDeleted });

      // ── 2. Expired email-verification tokens ────────────────────────────
      const emailRefs =
        await tokenRepository.getExpiredEmailVerificationRefs(now);
      const emailDeleted = await batchDelete(emailRefs);

      // ── 3. Expired password-reset tokens ────────────────────────────────
      const pwRefs = await tokenRepository.getExpiredPasswordResetRefs(now);
      const pwDeleted = await batchDelete(pwRefs);

      logInfo(JOB, "Token cleanup complete", {
        emailVerificationDeleted: emailDeleted,
        passwordResetDeleted: pwDeleted,
      });

      logInfo(JOB, "Daily data cleanup complete", {
        sessionsDeleted,
        tokensDeleted: emailDeleted + pwDeleted,
      });
    } catch (error) {
      logError(JOB, "Fatal error during daily data cleanup", error);
      throw error;
    }
  },
);
