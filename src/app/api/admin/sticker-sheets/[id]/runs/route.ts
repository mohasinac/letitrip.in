import { withProviders } from "@/providers.config";
/**
 * A sheet's trace runs — the attempt history, and starting a new attempt.
 *
 * GET  /api/admin/sticker-sheets/{id}/runs   — every attempt, newest first
 * POST /api/admin/sticker-sheets/{id}/runs   — start one. 🛑 `name` IS REQUIRED.
 *
 * 🛑 A RUN IS NEVER OVERWRITTEN. That is the whole point of the history: you can
 * compare "standard vs precise on the same sheet", see that run 2 died at
 * `ridge` on a halftone scan, and still have run 1's parts as the accepted set.
 * A retry is a NEW run (`./{runId}/retry`), not an edit of the old one.
 *
 * 🛑 The name is mandatory and that is a product requirement, not a nicety:
 * keeping every attempt is worthless if you cannot tell them apart later, and
 * "Untitled (3)" defeats it at exactly the moment it matters. Enforced in three
 * places — `.min(1)` here, `requireName` in the action, and a disabled submit in
 * the UI — because the one enforced only at the edge is the one that gets
 * bypassed by the next caller.
 */
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getNumberParam, getSearchParams } from "@mohasinac/appkit/next/request-helpers";
import { listStickerTraceRuns, startStickerTraceRun } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  tier: z.enum(["draft", "standard", "precise", "max"]),
  /*
   * The advanced panel's overrides, on top of the tier's defaults.
   *
   * 🛑 `.passthrough()` is deliberately NOT used, and `.strict()` is not either
   * — this is a plain `z.record` of finite numbers, so an unknown key is
   * accepted as a parameter name and a non-numeric value is rejected. The
   * action resolves `{...paramsForTier(tier), ...overrides}` and the RESULT is
   * what the run records, so a nonsense key is inert rather than dangerous.
   * What would be dangerous is a passthrough object reaching a document write
   * (Root Cause #76's lottery case), and it does not: only the merged
   * `TraceParams` is stored.
   */
  paramOverrides: z.record(z.string(), z.number().finite()).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    handler: async ({ request, params }) => {
      const sheetId = (params as { id: string }).id;
      const searchParams = getSearchParams(request);
      const limit = getNumberParam(searchParams, "limit", 50, { min: 1, max: 50 });

      /*
       * `listStickerTraceRuns` returns a PROJECTION with `has: {preview, overlay,
       * geometry, cutSvg, thumbAtlas}` booleans and no `*Path` fields at all.
       * The list needs to know whether an artifact EXISTS — to decide whether to
       * offer "open overlay" — and it never needs the path, because the asset
       * endpoint takes a kind. So the booleans are the complete answer.
       */
      const runs = await listStickerTraceRuns(sheetId, limit);
      return successResponse({ runs, total: runs.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    schema: createSchema,
    handler: async ({ user, params, body }) => {
      const sheetId = (params as { id: string }).id;

      const handle = await startStickerTraceRun({
        sheetId,
        name: body!.name,
        tier: body!.tier,
        requestedBy: user!.uid,
        paramOverrides: body!.paramOverrides,
      });

      /*
       * The `customToken` carries ONE claim, `stickerTraceRunId`, for this run's
       * RTDB channel — minted here rather than inherited from `enqueueJob`,
       * which buys a per-run channel instead of a shared one. Returning it with
       * the handle is what lets the client subscribe immediately, before the
       * coordinator has written its first progress event.
       */
      return successResponse(handle, "Run started");
    },
  }),
);
