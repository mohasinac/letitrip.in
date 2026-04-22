import { withProviders } from "@/providers.config";
/**
 * DELETE /api/media?url=...
 *
 * Deletes a staged (tmp/*) media file from Cloud Storage.
 * Only files under the tmp/ prefix belonging to the authenticated user
 * may be deleted — canonical (non-tmp) files are never touched.
 *
 * Used by MediaUploadList / MediaUploadField onAbort to clean up
 * files that were uploaded but the parent form was dismissed without saving.
 */

import { getAdminStorage as getStorage } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";

const TMP_PREFIX = "tmp/";

/**
 * Extract Cloud Storage path from a public URL or signed URL.
 * Returns null if the URL cannot be parsed to a known storage path.
 */
function extractStoragePath(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Public URL: https://storage.googleapis.com/{bucket}/{path}
    if (parsed.hostname === "storage.googleapis.com") {
      const pathParts = parsed.pathname.split("/").slice(2); // remove leading '' + bucket name
      return decodeURIComponent(pathParts.join("/"));
    }

    // Signed URL: https://storage.googleapis.com/... or https://{bucket}.storage.googleapis.com/...
    if (parsed.hostname.endsWith(".storage.googleapis.com")) {
      return decodeURIComponent(parsed.pathname.slice(1));
    }

    // Firebase Storage download URL: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}
    if (parsed.hostname === "firebasestorage.googleapis.com") {
      const match = parsed.pathname.match(/\/o\/(.+)$/);
      if (match) return decodeURIComponent(match[1]);
    }

    return null;
  } catch {
    return null;
  }
}

export const DELETE = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url || typeof url !== "string") {
      return errorResponse("url query parameter is required", 400);
    }

    const storagePath = extractStoragePath(url);
    if (!storagePath) {
      return errorResponse("Unable to derive storage path from url", 400);
    }

    // Safety: only allow deleting tmp/* files
    if (!storagePath.startsWith(TMP_PREFIX)) {
      return errorResponse(
        "Only staged tmp files may be deleted via this endpoint",
        403,
      );
    }

    // Safety: only allow deleting files under the authenticated user's uid
    const expectedUserSegment = `${TMP_PREFIX}`;
    const pathAfterTmp = storagePath.slice(TMP_PREFIX.length);
    const [, uidSegment] = pathAfterTmp.split("/"); // structure: tmp/{folder}/{uid}/{filename}
    // Alternatively the structure may be tmp/{uid}/{filename} — handle both
    const pathSegments = pathAfterTmp.split("/");
    const ownerUid = pathSegments.length >= 2 ? pathSegments[pathSegments.length - 2] : pathSegments[0];

    if (ownerUid !== user!.uid) {
      serverLogger.warn("Media delete rejected — uid mismatch", {
        requestedPath: storagePath,
        requestUid: user!.uid,
        inferredOwner: ownerUid,
      });
      return errorResponse("Not authorized to delete this file", 403);
    }

    const storage = getStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    try {
      const [exists] = await fileRef.exists();
      if (!exists) {
        // Idempotent — already gone is success
        return successResponse({ deleted: false, reason: "not_found" });
      }
      await fileRef.delete();
      serverLogger.info("Staged media deleted via onAbort", {
        uid: user!.uid,
        path: storagePath,
      });
      return successResponse({ deleted: true });
    } catch (err) {
      serverLogger.error("Failed to delete staged media", {
        uid: user!.uid,
        path: storagePath,
        error: err instanceof Error ? err.message : String(err),
      });
      return errorResponse("Failed to delete file", 500);
    }
  },
}));

