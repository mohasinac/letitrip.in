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
import sharp from "sharp";
import {
  ERROR_MESSAGES,
  getAdminStorage,
  serverLogger,
  siteSettingsRepository,
} from "@mohasinac/appkit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Cache headers ─────────────────────────────────────────────────────────

const DAY_SECONDS = 60 * 60 * 24;
const WEEK_SECONDS = DAY_SECONDS * 7;
// Vercel CDN caches each variant for a week; browsers for a day.
const CACHE_CONTROL_IMMUTABLE = `public, max-age=${DAY_SECONDS}, s-maxage=${WEEK_SECONDS}, immutable`;

// ─── Watermark config + caching ────────────────────────────────────────────

interface WatermarkConfig {
  type: "text" | "image";
  text: string;
  imageUrl: string;
  /** % of target image width — 0 disables the watermark entirely. */
  size: number;
  /** % opacity — 0 fully transparent, 100 fully opaque. */
  opacity: number;
}

const DEFAULT_WATERMARK: WatermarkConfig = {
  type: "text",
  text: "letitrip.in",
  imageUrl: "",
  size: 30,
  opacity: 20,
};

const WATERMARK_CACHE_TTL_MS = 60_000;
const MEDIA_PROXY_PATH_PREFIX = "media/";

let watermarkCache: { value: WatermarkConfig; expiresAt: number } | null = null;

function clampPercent(n: unknown, fallback: number): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

async function loadWatermarkConfig(): Promise<WatermarkConfig> {
  if (watermarkCache && watermarkCache.expiresAt > Date.now()) {
    return watermarkCache.value;
  }
  try {
    const settings = await siteSettingsRepository.getSingleton();
    const wm = (settings as { watermark?: Partial<WatermarkConfig> }).watermark ?? {};
    const value: WatermarkConfig = {
      type: wm.type === "image" ? "image" : "text",
      text:
        typeof wm.text === "string" && wm.text.trim()
          ? wm.text.trim()
          : DEFAULT_WATERMARK.text,
      imageUrl: typeof wm.imageUrl === "string" ? wm.imageUrl : "",
      size: clampPercent(wm.size, DEFAULT_WATERMARK.size),
      opacity: clampPercent(wm.opacity, DEFAULT_WATERMARK.opacity),
    };
    watermarkCache = { value, expiresAt: Date.now() + WATERMARK_CACHE_TTL_MS };
    return value;
  } catch (err) {
    serverLogger.warn(
      "media-proxy: siteSettingsRepository.getSingleton failed; using default watermark",
      { error: err instanceof Error ? err.message : String(err) },
    );
    return DEFAULT_WATERMARK;
  }
}

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

function watermarkUrlToStoragePath(url: string): string | null {
  if (!url) return null;
  const cleaned = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/+/, "");
  if (!cleaned.startsWith(MEDIA_PROXY_PATH_PREFIX)) return null;
  return cleaned.slice(MEDIA_PROXY_PATH_PREFIX.length);
}

// ─── Watermark composition ─────────────────────────────────────────────────

function escapeXml(input: string): string {
  return input.replace(/[<>&"']/g, (c) =>
    c === "<"
      ? "&lt;"
      : c === ">"
        ? "&gt;"
        : c === "&"
          ? "&amp;"
          : c === '"'
            ? "&quot;"
            : "&apos;",
  );
}

function buildTextWatermarkSvg(
  text: string,
  targetWidth: number,
  sizePct: number,
  opacityPct: number,
): Buffer {
  const wmWidth = Math.max(1, Math.round((targetWidth * sizePct) / 100));
  // Empirical: width ÷ (chars × 0.55) gives a decent fitted font size.
  const fontSize = Math.max(
    12,
    Math.round(wmWidth / Math.max(text.length * 0.55, 1)),
  );
  const wmHeight = Math.round(fontSize * 1.6);
  const fillAlpha = opacityPct / 100;
  const strokeAlpha = Math.min(1, fillAlpha * 0.6);
  const safe = escapeXml(text);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${wmWidth}" height="${wmHeight}" viewBox="0 0 ${wmWidth} ${wmHeight}"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="rgba(255,255,255,${fillAlpha})" stroke="rgba(0,0,0,${strokeAlpha})" stroke-width="1">${safe}</text></svg>`;
  return Buffer.from(svg);
}

async function applyWatermark(
  source: Buffer,
  config: WatermarkConfig,
  selfStoragePath: string,
): Promise<Buffer> {
  if (config.size <= 0) return source;

  const image = sharp(source);
  const meta = await image.metadata();
  const targetWidth = meta.width ?? 800;

  if (config.type === "text") {
    const overlay = buildTextWatermarkSvg(
      config.text,
      targetWidth,
      config.size,
      config.opacity,
    );
    return image
      .composite([{ input: overlay, gravity: "center", blend: "over" }])
      .toBuffer();
  }

  // type === "image" — load via Storage Admin, never via this proxy (to avoid
  // recursion when the watermark image itself is hosted in Storage).
  const wmStoragePath = watermarkUrlToStoragePath(config.imageUrl);
  if (!wmStoragePath || wmStoragePath === selfStoragePath) {
    return source;
  }
  const bucket = getAdminStorage().bucket();
  const wmFile = bucket.file(wmStoragePath);
  const [wmExists] = await wmFile.exists();
  if (!wmExists) return source;

  const [wmBuffer] = await wmFile.download();
  const wmTargetWidth = Math.max(
    1,
    Math.round((targetWidth * config.size) / 100),
  );
  // Resize while preserving the watermark's own aspect ratio.
  const resized = await sharp(wmBuffer)
    .resize(wmTargetWidth, null, { fit: "inside" })
    .png()
    .toBuffer();

  return image
    .composite([{ input: resized, gravity: "center", blend: "over" }])
    .toBuffer();
}

// ─── Handler ───────────────────────────────────────────────────────────────

const IMAGE_MIME_PREFIX = "image/";
const SVG_MIME = "image/svg+xml";

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
