/**
 * Media CDN Proxy — I7
 *
 * GET /media/<storage path...>
 *
 * Serves bytes from Firebase Cloud Storage with an on-the-fly watermark.
 *
 * Why a proxy?
 *  - Firebase Storage rules stay private (no `allUsers` read) — credentials
 *    never leave the server.
 *  - Watermark is applied at the edge, configurable from Admin → Site Settings.
 *  - Responses carry long `Cache-Control: public, immutable` so Vercel CDN
 *    handles the heavy lifting and the route is only hit on cache misses.
 *
 * Runtime: Node.js — `sharp` requires the libvips native binding which is
 * unavailable on Edge.
 *
 * URL convention: every Firestore image field stores `/media/<storage path>`.
 * Raw `firebasestorage.googleapis.com` URLs are never written to Firestore.
 */
import "@/providers.config";
import { NextResponse } from "next/server";
import { ERROR_MESSAGES, getAdminStorage, serverLogger } from "@mohasinac/appkit";
import {
  CACHE_CONTROL_IMMUTABLE,
  IMAGE_MIME_PREFIX,
  SVG_MIME,
  applyWatermark,
  loadWatermarkConfig,
} from "../_watermark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const storagePath = slugToStoragePath(slug);
  if (!storagePath) {
    return new NextResponse(ERROR_MESSAGES.MEDIA.NOT_FOUND, { status: 404 });
  }

  try {
    const bucket = getAdminStorage().bucket();
    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    if (!exists) {
      return new NextResponse(ERROR_MESSAGES.MEDIA.NOT_FOUND, { status: 404 });
    }

    const [meta] = await file.getMetadata();
    const contentType = String(meta.contentType ?? "application/octet-stream");
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
    try {
      const config = await loadWatermarkConfig();
      body = await applyWatermark(originalBuffer, config, storagePath);
    } catch (err) {
      serverLogger.warn(
        "media-proxy: watermark application failed; serving original",
        { storagePath, error: err instanceof Error ? err.message : String(err) },
      );
    }

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": CACHE_CONTROL_IMMUTABLE,
      },
    });
  } catch (err) {
    serverLogger.error("media-proxy: failed to serve", {
      storagePath,
      error: err instanceof Error ? err.message : String(err),
    });
    return new NextResponse(ERROR_MESSAGES.MEDIA.PROXY_FAILED, { status: 500 });
  }
}
