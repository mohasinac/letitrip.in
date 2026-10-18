import { withProviders } from "@/providers.config";
/**
 * Sticker sheets — list and create.
 *
 * GET  /api/admin/sticker-sheets        — the sheet list
 * POST /api/admin/sticker-sheets        — create a sheet AND sign its scan upload
 *
 * 🛑 THIS ROUTE RETURNS JSON AND NEVER BYTES, and so does every route under
 * this tree. Each binary — scan, preview, overlay, thumbnail atlas, part PNG,
 * SVG, PDF — is fetched by the browser from a 5-minute signed GCS URL, and the
 * route hands back `{ url, expiresAt }`. Vercel Hobby's Fast Origin Transfer
 * allowance is 10 GB and exceeding a cap PAUSES THE PROJECT, which has already
 * happened here once at 52.52 GB (Root Cause #104). Cloud Storage's own egress
 * allowance is ten times larger and is not a cliff. `audit-sticker-trace-egress`
 * enforces this statically, because "just stream the preview, it's only 1 MB"
 * is invisible in review and bills per request forever.
 *
 * 🛑 The POST both creates the row and signs the upload, in that order. The
 * object path contains the sheet id, so an upload signed first has nowhere to
 * go — and an object with no document pointing at it is unreachable AND
 * unmeterable. See `createStickerSheet` for the full argument.
 */
import { COMMON_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { stickerSheetsRepository } from "@mohasinac/appkit/features/sticker-trace/repository/sticker-sheets.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next/request-helpers";
import { createStickerSheet, toClientStickerSheet } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

const DEFAULT_SORTS = sortBy(COMMON_FIELDS.CREATED_AT);

const createSchema = z.object({
  /*
   * 🛑 `.min(1)` is the mechanism behind "a name is mandatory to process". The
   * action validates it again — deliberately, not redundantly: a schema guards
   * THIS entry point and `requireTitle` guards every caller including a future
   * server action, and the one that is only enforced at the edge is the one
   * that gets bypassed.
   */
  title: z.string().min(1).max(160),
  scanType: z.enum(["auto", "paper", "art"]).optional(),
  contentType: z.string().min(1).max(120),
  extension: z.string().min(1).max(5),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 50 });
      const filters = getStringParam(searchParams, "filters");
      const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

      /*
       * 🛑 NOT delegated to the listing Function, deliberately — and this is
       * the one place in the feature where that is a judgement call rather than
       * a rule.
       *
       * Delegation is not a flag here: `sieveQuery` has no executor concept, so
       * it would mean a new `stickerSheets` entry in the Function's `LISTERS`,
       * a feature-level executor-aware list function (the `listPublicProducts`
       * shape), and a Functions deploy before any of it does anything. The
       * audit's own header is an argument against exactly that — a conversion's
       * only failure mode is silent semantic divergence, verifiable solely in
       * production, and `lister-opts-forwarding` found FIVE live opts drops on
       * its first run.
       *
       * What delegation buys is protection against public listing VOLUME. This
       * route is admin-only behind `admin:products:write`, capped at 25 rows,
       * over a collection whose practical ceiling is tens of documents (the
       * storage meter exists because ~52 sheets fills 5 GB). So adding a lister
       * would create a new silent-divergence surface for no measured benefit.
       *
       * Revisit if sheets ever become publicly browsable, which would change
       * both halves of that trade at once.
       */
      // audit-listing-delegation-ok: admin-only, pageSize<=25, collection ceiling ~tens of docs; delegating needs a new Function lister + deploy, whose only failure mode is production-only semantic divergence
      const result = await stickerSheetsRepository.listForAdmin({
        filters: filters || undefined,
        sorts,
        page,
        pageSize,
      });

      /*
       * 🛑 Projected through `toClientStickerSheet`, never spread. The document
       * carries `sourceScan.assetPath` and every `artifacts.*Path` — raw private
       * Storage paths, which are the one thing that must never reach a client,
       * because the asset endpoint's whole safety shape is that it accepts a
       * KIND and looks the path up itself. A spread-and-delete projection
       * publishes every field nobody thought to delete (Root Cause #70).
       */
      return successResponse({
        sheets: result.items.map(toClientStickerSheet),
        total: result.total,
        page,
        pageSize,
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    schema: createSchema,
    handler: async ({ body }) => {
      const result = await createStickerSheet({
        title: body!.title,
        scanType: body!.scanType,
        contentType: body!.contentType,
        extension: body!.extension,
      });

      /*
       * `upload.assetPath` DOES cross the wire here, and only here. The client
       * needs it to hand back to the finalize step, and it is a path the server
       * just minted rather than one the client chose — `attachStickerSheetScan`
       * re-checks that it sits under this sheet's own prefix before anything
       * reads it. That containment check is what makes handing it out safe.
       */
      return successResponse(result, "Sheet created");
    },
  }),
);
