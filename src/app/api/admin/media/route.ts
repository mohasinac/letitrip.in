import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getAdminStorage } from "@mohasinac/appkit/providers/db-firebase/admin";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { mediaAssetsRepository } from "@mohasinac/appkit/features/media/repository/media-assets.repository";

interface MediaFile {
  name: string;
  size: number;
  contentType: string | null;
  updatedAt: string;
  downloadURL: string;
}

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 50;
const MEDIA_PROXY_PREFIX = "/api/media/";

const ERRORS = {
  LIST_FAILED: "Failed to list media",
  DELETE_FAILED: "Failed to delete media",
  MISSING_PATH: "A storage path is required",
  NOT_FOUND: "That file does not exist",
} as const;

/**
 * GET /api/admin/media?prefix=<dir>&pageToken=<token>&pageSize=<n>
 *
 * TS14 â€” lists files from Firebase Storage with prefix filter and pagination.
 * Returns { files, nextPageToken } for use by Admin Media Library + MediaPickerModal.
 */
export const GET = withProviders(
  createApiHandler({
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:media:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const prefix = url.searchParams.get("prefix") ?? "";
      const pageToken = url.searchParams.get("pageToken") ?? undefined;
      const pageSizeRaw = Number(url.searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSizeRaw));

      try {
        const bucket = getAdminStorage().bucket();
        const [files, , apiResp] = await bucket.getFiles({
          prefix,
          maxResults: pageSize,
          pageToken,
          autoPaginate: false,
        });

        const items: MediaFile[] = files.map((f) => ({
          name: f.name,
          size: Number(f.metadata?.size ?? 0),
          contentType: (f.metadata?.contentType as string | undefined) ?? null,
          updatedAt: (f.metadata?.updated as string | undefined) ?? "",
          downloadURL: `${MEDIA_PROXY_PREFIX}${encodeURI(f.name)}`,
        }));

        const nextPageToken =
          (apiResp as { nextPageToken?: string } | undefined)?.nextPageToken ?? null;

        return successResponse({ files: items, nextPageToken });
      } catch (error) {
        void normalizeError(error);
        serverLogger.error("admin/media list error", { error });
        return errorResponse(ERRORS.LIST_FAILED, 500);
      }
    },
  }),
);
/**
 * DELETE /api/admin/media?path=<storagePath>
 *
 * The admin media library had `copy-url` as its ONLY per-file action — no
 * delete, no rename, no detail — so a mistaken upload could be looked at
 * forever and never removed.
 *
 * 🛑 Keyed by STORAGE PATH, not an id, because that is what identifies a file
 * here: `GET` above lists `f.name` straight off the bucket and the library has
 * no notion of a record id. A `[id]` segment would have had to invent one.
 *
 * 🛑 It deletes the `mediaAssets` ROW as well as the object. The two halves
 * live in different systems and only the row makes a file resolvable:
 * `/media/<shortId>` looks the slug up in `mediaAssets` to find its
 * `storagePath`. Deleting only the object leaves a row pointing at nothing —
 * a 404 that renders as an ordinary broken image, with no error anywhere.
 * Deleting only the row orphans the bytes, which is the inverse and is what
 * CLAUDE.md's 2026-10-17 incident was about.
 *
 * The object is deleted FIRST. If that fails the row survives and the pair is
 * still consistent; the other order would leave a resolvable-looking row
 * whose bytes are gone.
 */
export const DELETE = withProviders(
  createApiHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    /*
     * `:delete`, not `:write`. The two are granted separately on purpose —
     * `blog_poster` has media:write so a junior writer can upload images for
     * a post, and is deliberately denied the delete-ish permissions on its
     * own resource ("NOT blog:delete or blog:publish — junior writer only").
     * Removing a file other records may still embed belongs with the latter.
     */
    permission: "admin:media:delete",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const path = url.searchParams.get("path")?.trim();

      if (!path) {
        return errorResponse(ERRORS.MISSING_PATH, 400, { code: "MISSING_PATH" });
      }

      try {
        const file = getAdminStorage().bucket().file(path);
        const [exists] = await file.exists();
        if (!exists) {
          return errorResponse(ERRORS.NOT_FOUND, 404, { code: "MEDIA_NOT_FOUND" });
        }

        await file.delete();

        const asset = await mediaAssetsRepository.findByStoragePath(path);
        if (asset) {
          await mediaAssetsRepository.delete(asset.id);
        }

        serverLogger.info("admin/media file deleted", { path, hadAssetRow: Boolean(asset) });
        return successResponse({ path, assetRowDeleted: Boolean(asset) }, "File deleted");
      } catch (error) {
        void normalizeError(error);
        serverLogger.error("admin/media delete error", { error, path });
        return errorResponse(ERRORS.DELETE_FAILED, 500);
      }
    },
  }),
);
