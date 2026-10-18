import { withProviders } from "@/providers.config";
/**
 * The storage meter — bytes and object count per sheet, biggest first.
 *
 * GET /api/admin/sticker-sheets/usage[?sheetIds=a,b,c]
 *
 * 🛑 THIS IS THE MECHANISM THAT MAKES "KEEP EVERY RUN" A SAFE DEFAULT. Nothing
 * in this feature auto-prunes — any past run's overlay can still be opened and
 * compared, which is the point of the history — and that is only defensible if
 * the cost is VISIBLE rather than discovered. Root Cause #104's first signal
 * was a billing page, and a quota discoverable only in the GCP console is a
 * quota nobody watches.
 *
 * 🛑 Reports object COUNT beside bytes, because GCS meters them separately
 * (Class A writes, Class B reads). The sprite-atlas decision exists precisely
 * because 60 thumbnails per run would spend that budget 60x faster than the
 * same pixels in one object — a meter showing only bytes would make undoing
 * that look free.
 *
 * 🛑 Static segment ahead of `[id]`, so this is NOT a sheet called "usage".
 * Next resolves static before dynamic, and sheet ids are `stickersheet-`
 * prefixed, so the two cannot collide.
 *
 * 🛑 One bucket listing PER SHEET, which is why it is its own endpoint rather
 * than a column on the sheet list — twenty sheets would be twenty `getFiles`
 * calls on every page view. `sheetIds` caps it further so the page can meter
 * what it is showing rather than the whole corpus.
 */
import { stickerSheetsRepository } from "@mohasinac/appkit/features/sticker-trace/repository/sticker-sheets.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { measureStickerStorage } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * At most this many sheets per call.
 *
 * Each one is a `getFiles` against the bucket, and a sync Vercel function is
 * capped at 10 s (Rule #6). 25 keeps the worst case well inside that; the
 * client pages through if there are more.
 */
const MAX_SHEETS = 25;

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const raw = getStringParam(searchParams, "sheetIds") || "";

      let sheetIds = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (sheetIds.length === 0) {
        /*
         * `listSizes` reads only id/title/bytes via a projected query, so the
         * default case does not pull whole documents just to learn their names.
         * The bucket listing is the expensive half and it is bounded below.
         */
        const all = await stickerSheetsRepository.listSizes();
        sheetIds = all.map((s) => s.id);
      }

      const truncated = sheetIds.length > MAX_SHEETS;
      const usage = await measureStickerStorage(sheetIds.slice(0, MAX_SHEETS));

      /*
       * `truncated` is reported, never silent. A meter that quietly measured 25
       * of 40 sheets and printed a total would UNDERSTATE the quota — which is
       * the one direction a budget display must never be wrong in.
       */
      return successResponse({ ...usage, truncated, measured: Math.min(sheetIds.length, MAX_SHEETS) });
    },
  }),
);
