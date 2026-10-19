import { withProviders } from "@/providers.config";
/**
 * The export report for one run, against a chosen machine and page.
 *
 * GET /api/admin/sticker-sheets/{id}/runs/{runId}/export?profile=…&page=…
 *
 * 🛑 RETURNS THE REPORT, NOT THE FILE. This is the route the print modal calls
 * to answer "what will happen if I export this" — which parts this machine
 * cannot cut, how many pages, how much the node budget cost in millimetres of
 * deviation. The cut SVG itself is written as a run artifact and fetched from
 * a signed GCS URL via `./asset?kind=cutSvg`, like every other binary in this
 * feature.
 *
 * Returning the SVG here would be a few hundred KB through a Vercel function
 * per preview, per parameter change — and the modal's whole purpose is letting
 * someone try three machines and two page sizes before committing. That is the
 * shape `audit-sticker-trace-egress` refuses.
 *
 * 🛑 `refusedReason` is a 200, not an error. "No confirmed DPI" is a true,
 * actionable answer to the question asked, and the modal shows it verbatim —
 * a 4xx would make a legitimate state look like a malformed request.
 */
import { ApiErrors, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import {
  buildCutFileForRun,
  type MachineProfileId,
  type PrintPageSizeId,
} from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

const PROFILES = new Set(["print-shop", "cricut-cut", "cricut-ptc"]);
const PAGES = new Set([
  "a3",
  "a4",
  "a5",
  "letter",
  "legal",
  "tabloid",
  "joy-mat-standard",
  "joy-mat-long",
  "joy-mat-card",
  "joy-smart-material",
]);

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    handler: async ({ request, params }) => {
      const p = params as { id: string; runId: string };
      const searchParams = getSearchParams(request);
      const profile = getStringParam(searchParams, "profile") || "print-shop";
      const page = getStringParam(searchParams, "page") || "a4";

      /*
       * Validated against explicit sets rather than passed through. An unknown
       * id would index the profile/page record to `undefined` and fail deep
       * inside the exporter with a message about a missing property — this
       * fails at the edge naming the valid values.
       *
       * 🛑 `custom` is deliberately absent from PAGES: a custom page needs real
       * dimensions, and the placeholder row's are zero. Accepting it here would
       * nest every part into a 0x0 area and report "nothing fitted".
       */
      if (!PROFILES.has(profile)) {
        return ApiErrors.badRequest(
          `profile must be one of: ${[...PROFILES].join(", ")}`,
        );
      }
      if (!PAGES.has(page)) {
        return ApiErrors.badRequest(`page must be one of: ${[...PAGES].join(", ")}`);
      }

      const set = await buildCutFileForRun(p.runId, p.id, {
        profileId: profile as MachineProfileId,
        pageSizeId: page as PrintPageSizeId,
      });

      /*
       * The pages array is dropped on purpose — see the header. The modal gets
       * the COUNT and the report; the bytes come from the signed URL.
       */
      return successResponse({
        report: set.report,
        refusedReason: set.refusedReason,
        profile,
        page,
      });
    },
  }),
);
