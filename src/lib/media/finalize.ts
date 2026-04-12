"use server";

/**
 * Media Finalization Utilities
 *
 * Shared server-side helpers for promoting temporary (tmp/*) staged media
 * uploads to canonical (media/*) storage paths when an entity save succeeds.
 *
 * Dual-strategy lifecycle:
 *  1. Immediate: call these on successful entity save (tmp → media).
 *  2. Scheduled: functions/src/jobs/mediaTmpCleanup.ts removes any
 *     stale tmp objects the client never finalized (crash/tab-close recovery).
 */

import { getAdminStorage } from "@mohasinac/appkit/providers/db-firebase";

const TMP_MEDIA_PREFIX = "tmp/";
const FINAL_MEDIA_PREFIX = "media/";

/**
 * Extract the GCS object path from a Firebase Storage public URL or
 * Firebase download URL.  Returns null if the URL cannot be parsed or
 * does not belong to the given bucket.
 */
export function extractStoragePathFromUrl(
  url: string,
  bucketName: string,
): string | null {
  try {
    const parsed = new URL(url);

    // Public URL: https://storage.googleapis.com/{bucket}/{path}
    if (parsed.hostname === "storage.googleapis.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && parts[0] === bucketName) {
        return parts.slice(1).join("/");
      }
    }

    // Firebase download URL:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token=...
    if (parsed.hostname === "firebasestorage.googleapis.com") {
      const match = parsed.pathname.match(/\/v0\/b\/([^/]+)\/o\/(.+)$/);
      if (match && match[1] === bucketName) {
        return decodeURIComponent(match[2]);
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * If `url` points to a temporary (tmp/*) staged upload, copy it to the
 * canonical media/* path, make it public, delete the source, and return
 * the new public URL.  Non-tmp URLs are returned as-is (idempotent).
 */
export async function finalizeStagedMediaUrl(url: string): Promise<string> {
  const storage = getAdminStorage();
  const bucket = storage.bucket();
  const sourcePath = extractStoragePathFromUrl(url, bucket.name);

  if (!sourcePath || !sourcePath.startsWith(TMP_MEDIA_PREFIX)) {
    return url;
  }

  const destinationPath = sourcePath.replace(
    TMP_MEDIA_PREFIX,
    FINAL_MEDIA_PREFIX,
  );
  if (destinationPath === sourcePath) {
    return url;
  }

  const sourceFile = bucket.file(sourcePath);
  const destinationFile = bucket.file(destinationPath);

  await sourceFile.copy(destinationFile);
  await destinationFile.makePublic();
  await sourceFile.delete({ ignoreNotFound: true });

  return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
}

/**
 * Finalize an optional single URL field.
 * Returns the finalized URL, or the original value if null/undefined/empty.
 */
export async function finalizeStagedMediaField(
  url: string | null | undefined,
): Promise<string | undefined> {
  if (!url) return url ?? undefined;
  return finalizeStagedMediaUrl(url);
}

/**
 * Finalize an array of image URL strings.
 * Returns an empty array for a missing/empty input.
 */
export async function finalizeStagedMediaArray(
  urls: string[] | null | undefined,
): Promise<string[]> {
  if (!urls || urls.length === 0) return urls ?? [];
  return Promise.all(urls.map(finalizeStagedMediaUrl));
}
