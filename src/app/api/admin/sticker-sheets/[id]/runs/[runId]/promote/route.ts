import { withProviders } from "@/providers.config";
/**
 * Accept a run as the sheet's result, and render its parts at full resolution.
 *
 * POST /api/admin/sticker-sheets/{id}/runs/{runId}/promote
 *
 * 🛑 THIS IS NOT THE SAME "PROMOTE" as promoting a sheet into marketplace
 * listings. This one promotes a RUN onto its SHEET. The listings flow depends
 * on it, because `SheetPart.assetPath` does not exist until a run has been
 * promoted here — but they are different verbs on different nouns and the
 * feature has two of them.
 *
 * 🛑 Promotion is the ONLY thing that renders full-resolution parts, and that
 * is a storage decision rather than a UI one. An exploratory run costs about
 * 1 MB; rendering full-res parts on every run costs ~500 MB per sheet across a
 * tuning session — the difference between roughly 52 sheets inside 5 GB and
 * about 8. Tuning a halftone scan takes several attempts, so most runs are
 * exploratory and must stay cheap.
 *
 * Returns JSON, like every route under this tree — the rendered parts are later
 * fetched from signed GCS URLs, never through Vercel.
 */
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { promoteStickerTraceRun } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    handler: async ({ user, params }) => {
      const p = params as { id: string; runId: string };

      /*
       * No body. Everything this needs is in the path, and the action itself
       * refuses a run that did not succeed or that belongs to another sheet —
       * both checks live there rather than here so a future server action gets
       * them too.
       */
      const result = await promoteStickerTraceRun({
        sheetId: p.id,
        runId: p.runId,
        promotedBy: user!.uid,
      });

      return successResponse(result, "Run promoted — rendering full-resolution parts");
    },
  }),
);
