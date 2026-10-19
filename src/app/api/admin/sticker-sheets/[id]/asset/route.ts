import { withProviders } from "@/providers.config";
/**
 * Mint a short-lived signed URL for one stored asset.
 *
 * GET /api/admin/sticker-sheets/{id}/asset?kind=scan|preview|overlay|geometry|cutSvg|thumbAtlas|part
 *     [&runId=…][&ordinal=…]
 *
 * 🛑 THIS ROUTE RETURNS `{ url, expiresAt }` AND NEVER BYTES. It is the single
 * reason every other binary in this feature costs Vercel nothing: the browser
 * fetches from GCS directly, so the 10 GB Fast Origin Transfer allowance — the
 * cap that PAUSED this project at 52.52 GB (Root Cause #104) — is never touched.
 * `audit-sticker-trace-egress` is strict-zero on this property, with no
 * suppression marker, because the tempting edit ("just proxy it, it's 1 MB") is
 * invisible in review and bills per request forever.
 *
 * 🛑 IT TAKES A KIND, NOT A PATH, and that is the whole security shape. The
 * client names WHAT it wants and the server looks the path up on the document.
 * Accepting an `assetPath` would turn this into a signed-URL mint for any object
 * in the bucket — `storage.rules` is `allow read: if true`, and the same bucket
 * holds `private/digital-content/`, which is paid goods. It is also what keeps
 * every `*Path` field off the wire entirely, the property
 * `PRIVATE_STICKER_SHEET_FIELDS` declares.
 *
 * The URL is a 5-minute bearer token, and that is accepted deliberately: an
 * admin's own scan is not a paid good, which was the precise reason
 * `digital-content` refused this trade and streams its bytes through a route
 * instead.
 */
import { ApiErrors, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import {
  resolveStickerAssetUrl,
  STICKER_ASSET_KINDS,
  type StickerAssetKind,
} from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

const KINDS = new Set<string>(STICKER_ASSET_KINDS);

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    handler: async ({ request, params }) => {
      const sheetId = (params as { id: string }).id;
      const searchParams = getSearchParams(request);
      const kind = getStringParam(searchParams, "kind") || "";
      const runId = getStringParam(searchParams, "runId") || undefined;
      /*
       * `kind=part` only. Parsed here rather than inside the resolver so a
       * non-numeric value is a 400 that names the problem, instead of the
       * resolver's `null` turning into a 404 that says "no such asset" about a
       * part that exists.
       */
      const rawOrdinal = getStringParam(searchParams, "ordinal");
      const ordinal = rawOrdinal === undefined || rawOrdinal === "" ? undefined : Number(rawOrdinal);
      if (ordinal !== undefined && !Number.isInteger(ordinal)) {
        return ApiErrors.badRequest("ordinal must be an integer");
      }
      if (kind === "part" && ordinal === undefined) {
        return ApiErrors.badRequest("ordinal is required when kind=part");
      }

      /*
       * Validated against the exported union rather than a local list — the
       * union is what `resolveStickerAssetUrl` switches on, so a second
       * hand-written list here could accept a kind the resolver has no branch
       * for and silently return null (Root Cause #61's shape, in miniature).
       */
      if (!KINDS.has(kind)) {
        return ApiErrors.badRequest(
          `kind must be one of: ${STICKER_ASSET_KINDS.join(", ")}`,
        );
      }

      const resolved = await resolveStickerAssetUrl({
        sheetId,
        kind: kind as StickerAssetKind,
        runId,
        ordinal,
      });

      /*
       * 404 for "no such asset", which is the NORMAL state of an unfinished or
       * failed run rather than an error — a run that died at `ridge` has no
       * overlay and never will. It is also the answer for a runId belonging to
       * another sheet, matching the sibling private-asset routes: a 403 would
       * confirm that a run with that id exists.
       */
      if (!resolved) return ApiErrors.notFound("No such asset for this sheet");

      return successResponse(resolved);
    },
  }),
);
