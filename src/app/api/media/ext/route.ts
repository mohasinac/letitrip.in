/**
 * External media proxy — watermarks third-party image URLs server-side.
 *
 * GET /api/media/ext?url=<encoded>
 *
 * All non-Firebase-Storage URLs (unsplash, seller CDNs, etc.) are routed here
 * by resolveMediaUrl() so every image gets the site watermark regardless of
 * origin. Never expose raw third-party URLs directly in the UI.
 */
import "@/providers.config";
import { NextRequest, NextResponse } from "next/server";
import { serverLogger } from "@mohasinac/appkit";
import {
  CACHE_CONTROL_IMMUTABLE,
  IMAGE_MIME_PREFIX,
  SVG_MIME,
  applyWatermark,
  loadWatermarkConfig,
} from "../_watermark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10 MB

// RFC-1918 + loopback + GCP metadata SSRF guard
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google",
]);

function isBlockedHostname(hostname: string): boolean {
  if (BLOCKED_HOSTNAMES.has(hostname)) return true;
  // IPv4 loopback
  if (/^127\./.test(hostname)) return true;
  // IPv6 loopback
  if (hostname === "::1" || hostname === "[::1]") return true;
  // RFC-1918 ranges
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true;
  // Link-local
  if (/^169\.254\./.test(hostname)) return true;
  return false;
}

export async function GET(request: NextRequest): Promise<Response> {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing url parameter.", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid url parameter.", { status: 400 });
  }

  if (parsed.protocol !== "https:") {
    return new NextResponse("Only https:// URLs are allowed.", { status: 400 });
  }

  if (isBlockedHostname(parsed.hostname)) {
    return new NextResponse("URL not allowed.", { status: 400 });
  }

  let fetchRes: globalThis.Response;
  try {
    fetchRes = await fetch(rawUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "letitrip-media-proxy/1.0" },
    });
  } catch (err) {
    serverLogger.warn("media-ext: fetch failed", {
      url: rawUrl,
      error: err instanceof Error ? err.message : String(err),
    });
    return new NextResponse("Failed to fetch external image.", { status: 502 });
  }

  if (!fetchRes.ok) {
    return new NextResponse(`Upstream returned ${fetchRes.status}.`, { status: 502 });
  }

  const contentType = fetchRes.headers.get("content-type") ?? "";
  if (!contentType.startsWith(IMAGE_MIME_PREFIX)) {
    return new NextResponse("URL does not point to an image.", { status: 400 });
  }

  // Read body with size guard
  const reader = fetchRes.body?.getReader();
  if (!reader) {
    return new NextResponse("Empty upstream response.", { status: 502 });
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      reader.cancel();
      return new NextResponse("Image too large (max 10 MB).", { status: 413 });
    }
    chunks.push(value);
  }

  const originalBuffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));

  // SVGs pass through untouched — sharp can't composite them reliably
  if (contentType === SVG_MIME) {
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
    body = await applyWatermark(originalBuffer, config, "<ext-proxy>");
  } catch (err) {
    serverLogger.warn("media-ext: watermark failed; serving original", {
      url: rawUrl,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL_IMMUTABLE,
    },
  });
}
