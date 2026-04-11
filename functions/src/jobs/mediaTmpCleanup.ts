/**
 * Job: Media Temporary Upload Cleanup
 *
 * Runs daily at 10:00 AM IST (04:30 UTC).
 *
 * Purpose
 * -------
 * Prevents Cloud Storage leaks from staged uploads that were never confirmed
 * (browser crash, tab close, network failure, backend save failure).
 *
 * Strategy (Dual-layer — Verdict D)
 * ----------------------------------
 * Layer 1 — immediate: forms call onAbort() on cancel/unmount; the client
 *   deletes staged URLs via DELETE /api/media.  This covers normal user flows.
 * Layer 2 — scheduled (this job): a daily sweep removes any tmp objects that
 *   Layer 1 missed (crashes, expired sessions, broken network).
 *
 * Safety invariants
 * -----------------
 * ✓  ONLY touches objects whose storage path begins with MEDIA_TMP_FOLDER_PREFIX.
 * ✓  ONLY deletes objects older than MEDIA_TMP_TTL_HOURS.
 * ✓  Saved media lives under a different path prefix and is NEVER scanned.
 * ✓  Idempotent: safe to retry — a missing object is logged and skipped.
 * ✓  Writes a structured audit log for every deleted object.
 *
 * Naming convention
 * -----------------
 * Staged path:  tmp/{uid}/{filename}       ← managed by /api/media/upload
 * Saved path:   media/{uid}/{filename}     ← renamed on successful entity save
 *
 * Note: until the upload route and form components are updated to use the
 * tmp/ folder convention (Task Group 1), this job finds no files to clean up.
 * Deploy now; activates automatically once the convention is fully adopted.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { logInfo, logError, logWarn } from "../utils/logger";
import { storage } from "../config/firebase-admin";
import {
  SCHEDULES,
  REGION,
  MEDIA_TMP_FOLDER_PREFIX,
  MEDIA_TMP_TTL_HOURS,
} from "../config/constants";

const JOB = "mediaTmpCleanup";

export const mediaTmpCleanup = onSchedule(
  {
    schedule: SCHEDULES.DAILY_0430_UTC,
    timeZone: "Asia/Kolkata",
    region: REGION,
    // Listing and deleting files is I/O-bound; 540s covers even large backlogs.
    timeoutSeconds: 540,
    memory: "256MiB",
    // Prevent two overlapping runs if the job is slow on a given day.
    maxInstances: 1,
  },
  async () => {
    logInfo(JOB, "Starting media temporary upload cleanup", {
      prefix: MEDIA_TMP_FOLDER_PREFIX,
      ttlHours: MEDIA_TMP_TTL_HOURS,
    });

    const cutoff = new Date(Date.now() - MEDIA_TMP_TTL_HOURS * 60 * 60 * 1000);

    let scanned = 0;
    let deleted = 0;
    let skipped = 0;
    let errors = 0;

    try {
      const bucket = storage.bucket();

      // List only objects under the tmp/ prefix — saved media is untouched.
      const [files] = await bucket.getFiles({
        prefix: MEDIA_TMP_FOLDER_PREFIX,
        autoPaginate: true,
      });

      scanned = files.length;
      logInfo(JOB, "Objects found under tmp prefix", { count: scanned });

      for (const file of files) {
        try {
          // Guard: re-check the prefix at delete time to make the invariant
          // explicit even if the listing prefixed query somehow widens.
          if (!file.name.startsWith(MEDIA_TMP_FOLDER_PREFIX)) {
            logWarn(JOB, "Skipping file outside expected prefix (safety guard)", {
              name: file.name,
            });
            skipped++;
            continue;
          }

          // Determine file age from storage object metadata.
          const [metadata] = await file.getMetadata();
          const updated: string | undefined =
            (metadata.updated as string | undefined) ??
            (metadata.timeCreated as string | undefined);

          if (!updated) {
            logWarn(JOB, "Skipping file with no timestamp metadata", {
              name: file.name,
            });
            skipped++;
            continue;
          }

          const fileAge = new Date(updated);
          if (fileAge >= cutoff) {
            // File is within TTL — leave it alone; it may still be in-flight.
            skipped++;
            continue;
          }

          // File is outside TTL under the tmp prefix — delete it.
          await file.delete();
          deleted++;
          logInfo(JOB, "Deleted orphaned tmp upload", {
            name: file.name,
            updated,
            ageHours: Math.round(
              (Date.now() - fileAge.getTime()) / (60 * 60 * 1000),
            ),
          });
        } catch (fileError: unknown) {
          errors++;
          // A 404 means the file was already removed (e.g. by Layer 1).
          // Log and continue rather than failing the entire job.
          const isNotFound =
            fileError instanceof Error &&
            "code" in fileError &&
            (fileError as { code: number }).code === 404;

          if (isNotFound) {
            logInfo(JOB, "File already deleted, skipping", {
              name: file.name,
            });
          } else {
            logError(JOB, "Failed to delete tmp file", fileError, {
              name: file.name,
            });
          }
        }
      }
    } catch (err: unknown) {
      logError(JOB, "Fatal error during tmp cleanup sweep", err);
      // Re-throw so Cloud Functions marks the invocation as failed and
      // Cloud Monitoring can alert on consecutive failures.
      throw err;
    }

    logInfo(JOB, "Media temporary upload cleanup complete", {
      scanned,
      deleted,
      skipped,
      errors,
      cutoffISO: cutoff.toISOString(),
    });
  },
);
