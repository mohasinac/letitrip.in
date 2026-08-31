/*
 * WHY: On 2026-08-31 picsum.photos went down — 503 from the origin AND from its
 *      own Fastly CDN. 409 of the seed catalogue's ~437 external image URLs
 *      pointed at it, so `/api/media/ext` returned `502` with a `text/plain`
 *      body for nearly every image on the site. A 502 body inside an `<img>`
 *      renders as the browser's broken-image icon, so the whole marketplace
 *      looked broken because one third party was down.
 *
 *      The proxy itself was healthy throughout — an unsplash URL through the
 *      same route returned a watermarked 200 in 0.48s. Nothing of ours had
 *      failed. It simply had no answer for "upstream said no".
 *
 * WHAT: Serve a neutral tile INSTEAD of an error status, so a failing upstream
 *       degrades to a placeholder rather than a broken image.
 *
 * ## 🛑 Why this is not the `.catch(() => null)` shape
 *
 * Returning 200 for a failed fetch hides a real error — exactly the defect Root
 * Cause #59 records. Three things invert it:
 *
 *   1. every caller still `serverLogger.warn`s the real failure;
 *   2. the response carries `X-Media-Placeholder: 1`, so the substitution is
 *      visible in headers and CDN logs;
 *   3. the cache is SHORT (60s) and never `immutable`, so it self-heals the
 *      moment upstream recovers.
 *
 * Silent to the visitor, loud to the operator — the `HomepageSectionBoundary`
 * pattern of Root Cause #77, not a swallow.
 *
 * ## Why the artwork is an asset and not a template literal here
 *
 * An SVG served as the body of an `<img>` has no stylesheet, no `:root` and no
 * `var(--appkit-color-*)` in scope, so its colours must be literal. A literal
 * colour belongs in a design file, not in a `.ts` with a hex-audit suppression
 * stapled to it — and this repo forbids suppression markers outright. So the
 * tile lives at `public/media-placeholder.svg`, read off local disk exactly the
 * way `_watermark.ts` already reads `public/logo.svg`.
 *
 * EXPORTS: PLACEHOLDER_HEADER, placeholderResponse
 *
 * @tag domain:media
 * @tag layer:server
 * @tag pattern:none
 * @tag access:server
 * @tag consumers:/api/media/ext,/api/media/[...slug]
 * @tag sideEffects:reads public/media-placeholder.svg once, then memoises
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { normalizeError, serverLogger } from "@mohasinac/appkit";

/** Present on any response whose body is a placeholder rather than real media. */
export const PLACEHOLDER_HEADER = "X-Media-Placeholder";

/**
 * Short, and never `immutable`.
 *
 * A placeholder is a statement about right now, not about the asset. Caching it
 * the way `CACHE_CONTROL_IMMUTABLE` caches a real image would pin an outage into
 * the CDN for a week — the outage would outlive its own cause.
 */
const PLACEHOLDER_CACHE = "public, max-age=60, s-maxage=60, must-revalidate";

const ASSET_PATH = "media-placeholder.svg";

/**
 * Last-resort tile, used only if the asset itself cannot be read.
 *
 * Deliberately colourless — `currentColor` inherits from the `<img>`'s context
 * and needs no literal — because the one thing this path must never do is throw
 * while handling another failure.
 */
const INLINE_FALLBACK =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="Image unavailable">' +
  '<rect width="600" height="600" fill="currentColor" fill-opacity="0.12"/></svg>';

let cached: string | null = null;

function tileSvg(): string {
  if (cached !== null) return cached;
  try {
    cached = readFileSync(join(process.cwd(), "public", ASSET_PATH), "utf8");
  } catch (err) {
    void normalizeError(err);
    // The failure handler's own failure handler. It still classifies and logs —
    // an asset missing from the deployed bundle is a real deploy problem, and
    // the one thing worse than a broken image is a broken image nobody hears
    // about.
    serverLogger.warn("media-placeholder: asset unreadable; using inline tile", {
      asset: ASSET_PATH,
    });
    cached = INLINE_FALLBACK;
  }
  return cached;
}

/**
 * The placeholder tile, as an image response.
 *
 * `seed` is not used to vary the artwork — it is accepted so call sites read as
 * "the placeholder FOR this asset", and so a future variant (per-entity colour,
 * a label) has somewhere to hang without changing every caller.
 */
export function placeholderResponse(_seed: string): NextResponse {
  return new NextResponse(tileSvg(), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": PLACEHOLDER_CACHE,
      [PLACEHOLDER_HEADER]: "1",
    },
  });
}
