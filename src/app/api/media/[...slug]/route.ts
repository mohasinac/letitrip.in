import { normalizeError } from "@mohasinac/appkit";
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
import { ERROR_MESSAGES, getAdminStorage, serverLogger, mediaAssetsRepository } from "@mohasinac/appkit";
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

function slugToStoragePath(slug: string[]): string | null {
  if (!Array.isArray(slug) || slug.length === 0) return null;
  const joined = slug.filter(Boolean).join("/");
  if (!joined || PATH_TRAVERSAL.test(joined) || joined.startsWith("/")) {
    return null;
  }
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

  if (slug.length === 1) {
    const shortId = slug[0];
    try {
      const asset = await mediaAssetsRepository.findById(shortId);
      if (asset) {
        storagePath = asset.storagePath;
        uploadedBy = asset.uploadedBy;
        contextType = asset.contextType;
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

  // Cache-Control: no-store on every not-found/error response below — a
  // slug can legitimately 404 for a brief window right after upload (the
  // mediaAssets doc write and the tmp/ file write both need to land before
  // this route can resolve it) and then become valid moments later once the
  // form save promotes it. Without an explicit no-store here, Vercel's edge
  // was observed caching that transient 404 indefinitely (confirmed via
  // production headers: Age: 2258, X-Vercel-Cache: HIT, well past the
  // moment the same slug started resolving successfully via a direct
  // /api/media/<slug> request) — permanently breaking the image even though
  // the underlying file and Firestore record both existed. 2026-08-16.
  const NOT_FOUND_HEADERS = { "Cache-Control": "no-store" };

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