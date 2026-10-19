import { normalizeError } from "@mohasinac/appkit/errors/normalize";
/**
 * Media CDN Proxy — I7
 *
 * GET /media/<shortId or storage path...>
 *
 * Resolution order:
 *  1. Single-segment slug → Firestore `mediaAssets/{slug}` lookup (new short-ID system).
 *     The shortId is an SEO-friendly slug (e.g. "product-image-charizard-1-20260805")
 *     that maps to the actual Firebase Storage path stored in the mediaAssets collection.
 *  2. Multi-segment slug OR no Firestore match → treat slug as a raw storage path
 *     (backward compatibility for old /media/tmp/... or /media/media/... URLs).
 *
 * Benefits of the short-ID layer:
 *  - Storage structure is private (paths never appear in URLs).
 *  - Files can be moved (tmp/ → media/) without breaking existing URLs.
 *  - SEO-friendly, human-readable URLs from the filename context.
 */
import "@/providers.config";
import { NextResponse } from "next/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { mediaAssetsRepository } from "@mohasinac/appkit/features/media/repository/media-assets.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { getAdminStorage } from "@mohasinac/appkit/providers/db-firebase/admin";
import {
  CACHE_CONTROL_IMMUTABLE,
  CACHE_CONTROL_WATERMARK_FALLBACK,
  IMAGE_MIME_PREFIX,
  SVG_MIME,
  applyWatermark,
  resolveWatermarkConfig,
} from "../_watermark";
import { placeholderResponse } from "../_placeholder";

export const runtime = "nodejs";

// ─── Path resolution ───────────────────────────────────────────────────────

const PATH_TRAVERSAL = /(^|\/)\.\.(\/|$)/;

/**
 * Storage prefix holding paid and unwatermarked goods — digital-code assets,
 * sticker-sheet scans and their part PNGs. Never reachable as a raw path.
 *
 * 🛑 This closes a hole that an existing comment ASSERTED did not exist.
 * `digital-code/pool.ts` says the private prefix is "deliberately OUTSIDE every
 * prefix the public media proxy knows how to resolve" — and the raw-path
 * fallback below resolves ANY path, so `/media/private/...` has served those
 * objects to anonymous callers since the fallback shipped. The only thing
 * standing in the way was a `randomUUID()` filename, which is not an access
 * control, and the sticker tracer is about to put `part-003.png` under there.
 * That comment is corrected in the same change as this.
 *
 * 🛑 It deliberately applies ONLY to the raw fallback, not to a resolved
 * `mediaAssets` row. A row's `storagePath` is set server-side by an
 * authenticated upload and may legitimately point into `private/` — that is how
 * a sticker part gets a watermarked public display copy without duplicating a
 * single byte. Denying the resolved path too would block the intended use while
 * leaving the guessable one open, i.e. exactly backwards.
 */
const PRIVATE_PREFIX = "private/";

function slugToStoragePath(slug: string[]): string | null {
  if (!Array.isArray(slug) || slug.length === 0) return null;
  const joined = slug.filter(Boolean).join("/");
  if (!joined || PATH_TRAVERSAL.test(joined) || joined.startsWith("/")) {
    return null;
  }
  if (joined === "private" || joined.startsWith(PRIVATE_PREFIX)) return null;
  return joined;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  const { slug } = await params;

  // Resolve the storage path:
  // - Single-segment slug → try Firestore shortId lookup first (new system).
  // - Multi-segment slug → treat as raw storage path (legacy /media/tmp/... URLs).
  let storagePath: string | null = null;
  let uploadedBy: string | undefined;
  let contextType: string | undefined;
  /*
   * Set when `/api/media/finalize` already composited the mark into the stored
   * bytes. Those objects are streamed straight through — no sharp in the request
   * path at all, which is the entire point of baking at upload.
   *
   * 🛑 Stays false for a legacy asset (no `watermarkedAt`) AND for a raw
   * multi-segment path, which has no mediaAssets row to carry the flag. Both
   * keep today's watermark-on-read behaviour, so nothing that worked before
   * this change stops working and no backfill gates the deploy.
   */
  let alreadyWatermarked = false;

  if (slug.length === 1) {
    const shortId = slug[0];
    try {
      const asset = await mediaAssetsRepository.findById(shortId);
      if (asset) {
        storagePath = asset.storagePath;
        uploadedBy = asset.uploadedBy;
        contextType = asset.contextType;
        alreadyWatermarked = Boolean(asset.watermarkedAt);
      }
    } catch (lookupErr) {
      void normalizeError(lookupErr);
      serverLogger.warn("media-proxy: mediaAssets lookup failed, falling back to raw path", {
        shortId,
        error: lookupErr instanceof Error ? lookupErr.message : String(lookupErr),
      });
    }
  }

  // Fall back to treating slug as a raw storage path (backward compat)
  if (!storagePath) {
    storagePath = slugToStoragePath(slug);
  }

  // A slug can legitimately 404 for a brief window right after upload (the
  // mediaAssets doc write and the tmp/ file write both need to land before
  // this route can resolve it) and then become valid moments later once the
  // form save promotes it. With no explicit directive here, Vercel's edge was
  // observed caching that transient 404 INDEFINITELY (confirmed via production
  // headers: Age: 2258, X-Vercel-Cache: HIT, well past the moment the same slug
  // started resolving successfully via a direct /api/media/<slug> request) —
  // permanently breaking the image even though the underlying file and
  // Firestore record both existed. 2026-08-16.
  //
  // 🛑 That is why this must never go back to a long or `immutable` window.
  //
  // It is a SHORT window rather than `no-store`, though: `no-store` means a
  // permanently-broken slug re-invokes this Node function on every single
  // request, forever, with no upper bound — and a page referencing one bad
  // image then bills an invocation per viewer per page view. 30s at the edge
  // caps that at ~2 invocations/minute while still letting a transient 404
  // recover well inside the upload window the comment above describes.
  const NOT_FOUND_HEADERS = {
    "Cache-Control": "public, max-age=10, s-maxage=30",
  };

  if (!storagePath) {
    return new NextResponse(ERROR_MESSAGES.MEDIA.NOT_FOUND, {
      status: 404,
      headers: NOT_FOUND_HEADERS,
    });
  }

  try {
    const bucket = getAdminStorage().bucket();
    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    if (!exists) {
      return new NextResponse(ERROR_MESSAGES.MEDIA.NOT_FOUND, {
        status: 404,
        headers: NOT_FOUND_HEADERS,
      });
    }

    const [meta] = await file.getMetadata();
    const contentType = String(meta.contentType ?? "application/octet-stream");
    // Track E1 — hard cap on proxied object size. The signer enforces this
    // at upload time but a corrupted store object or a hand-crafted path
    // could exceed it; reject loudly rather than spend Vercel function memory.
    const MAX_PROXY_BYTES = 50 * 1024 * 1024;
    const declaredSize =
      typeof meta.size === "string" ? parseInt(meta.size, 10) : Number(meta.size ?? 0);
    if (Number.isFinite(declaredSize) && declaredSize > MAX_PROXY_BYTES) {
      serverLogger.warn("media-proxy: object exceeds 50MB cap", {
        storagePath,
        size: declaredSize,
      });
      return new NextResponse(ERROR_MESSAGES.MEDIA.PROXY_FAILED, {
        status: 413,
        headers: NOT_FOUND_HEADERS,
      });
    }
    const [originalBuffer] = await file.download();

    // SVGs and non-images pass through untouched (PDFs, video, etc.).
    if (
      !contentType.startsWith(IMAGE_MIME_PREFIX) ||
      contentType === SVG_MIME
    ) {
      return new NextResponse(new Uint8Array(originalBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": CACHE_CONTROL_IMMUTABLE,
        },
      });
    }

    // Baked at upload — stream it. This is the path every newly-uploaded image
    // takes, and it costs one download and nothing else.
    if (alreadyWatermarked) {
      return new NextResponse(new Uint8Array(originalBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": CACHE_CONTROL_IMMUTABLE,
        },
      });
    }

    let body: Buffer = originalBuffer;
    let watermarked = true;
    try {
      const config = await resolveWatermarkConfig(uploadedBy, contextType);
      body = await applyWatermark(originalBuffer, config, storagePath);
    } catch (err) {
      void normalizeError(err);
      watermarked = false;
      serverLogger.warn(
        "media-proxy: watermark application failed; serving original",
        { storagePath, error: err instanceof Error ? err.message : String(err) },
      );
    }

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // A failed watermark falls back to the original bytes — cache that
        // fallback briefly, not `immutable`, so a retry can pick up the
        // watermark once the (likely transient) failure clears instead of
        // the unwatermarked file being served for a month.
        "Cache-Control": watermarked ? CACHE_CONTROL_IMMUTABLE : CACHE_CONTROL_WATERMARK_FALLBACK,
      },
    });
  } catch (err) {
    void normalizeError(err);
    serverLogger.error("media-proxy: failed to serve", {
      storagePath,
      error: err instanceof Error ? err.message : String(err),
    });
    /*
     * A tile, not a 500 — this response is the `src` of an `<img>`.
     *
     * 🛑 Deliberately NOT applied to the 404s above. The split is between
     * transient and permanent: a Storage hiccup or a sharp failure is a
     * momentary infrastructure problem the visitor should not have to see, and
     * the 60s placeholder cache lets it heal by itself. A genuinely missing
     * object is our own data being wrong, and turning THAT into a friendly
     * placeholder would hide a broken record behind a tile that looks
     * intentional — the failure this whole plan exists to stop.
     */
    return placeholderResponse(storagePath);
  }
}