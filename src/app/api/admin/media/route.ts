import { withProviders } from "@/providers.config";
import {
  createApiHandler,
  errorResponse,
  successResponse,
  getAdminStorage,
  serverLogger,
} from "@mohasinac/appkit";

interface MediaFile {
  name: string;
  size: number;
  contentType: string | null;
  updatedAt: string;
  downloadURL: string;
}

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;
const MEDIA_PROXY_PREFIX = "/api/media/";

const ERRORS = {
  LIST_FAILED: "Failed to list media",
} as const;

/**
 * GET /api/admin/media?prefix=<dir>&pageToken=<token>&pageSize=<n>
 *
 * TS14 — lists files from Firebase Storage with prefix filter and pagination.
 * Returns { files, nextPageToken } for use by Admin Media Library + MediaPickerModal.
 */
export const GET = withProviders(
  createApiHandler({
    roles: ["admin"],
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
        serverLogger.error("admin/media list error", { error });
        return errorResponse(ERRORS.LIST_FAILED, 500);
      }
    },
  }),
);
