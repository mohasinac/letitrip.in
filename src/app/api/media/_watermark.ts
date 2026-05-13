/**
 * Shared watermark helpers for /api/media/[...slug] and /api/media/ext.
 * Both routes apply the same watermark logic; this module is the single source.
 */
import "@/providers.config";
import sharp from "sharp";
import { getAdminStorage, serverLogger, siteSettingsRepository } from "@mohasinac/appkit";

export const DAY_SECONDS = 60 * 60 * 24;
export const WEEK_SECONDS = DAY_SECONDS * 7;
export const CACHE_CONTROL_IMMUTABLE = `public, max-age=${DAY_SECONDS}, s-maxage=${WEEK_SECONDS}, immutable`;

export const IMAGE_MIME_PREFIX = "image/";
export const SVG_MIME = "image/svg+xml";

export interface WatermarkConfig {
  type: "text" | "image";
  text: string;
  imageUrl: string;
  /** % of target image width — 0 disables the watermark entirely. */
  size: number;
  /** % opacity — 0 fully transparent, 100 fully opaque. */
  opacity: number;
}

export const DEFAULT_WATERMARK: WatermarkConfig = {
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

export async function loadWatermarkConfig(): Promise<WatermarkConfig> {
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

export function watermarkUrlToStoragePath(url: string): string | null {
  if (!url) return null;
  const cleaned = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/+/, "");
  if (!cleaned.startsWith(MEDIA_PROXY_PATH_PREFIX)) return null;
  return cleaned.slice(MEDIA_PROXY_PATH_PREFIX.length);
}

function escapeXml(input: string): string {
  return input.replace(/[<>&"']/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;",
  );
}

export function buildTextWatermarkSvg(
  text: string,
  targetWidth: number,
  sizePct: number,
  opacityPct: number,
): Buffer {
  const wmWidth = Math.max(1, Math.round((targetWidth * sizePct) / 100));
  const fontSize = Math.max(12, Math.round(wmWidth / Math.max(text.length * 0.55, 1)));
  const wmHeight = Math.round(fontSize * 1.6);
  const fillAlpha = opacityPct / 100;
  const strokeAlpha = Math.min(1, fillAlpha * 0.6);
  const safe = escapeXml(text);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${wmWidth}" height="${wmHeight}" viewBox="0 0 ${wmWidth} ${wmHeight}"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="rgba(255,255,255,${fillAlpha})" stroke="rgba(0,0,0,${strokeAlpha})" stroke-width="1">${safe}</text></svg>`;
  return Buffer.from(svg);
}

export async function applyWatermark(
  source: Buffer,
  config: WatermarkConfig,
  selfStoragePath: string,
): Promise<Buffer> {
  if (config.size <= 0) return source;

  const image = sharp(source);
  const meta = await image.metadata();
  const targetWidth = meta.width ?? 800;

  if (config.type === "text") {
    const overlay = buildTextWatermarkSvg(config.text, targetWidth, config.size, config.opacity);
    return image.composite([{ input: overlay, gravity: "center", blend: "over" }]).toBuffer();
  }

  // type === "image" — load via Storage Admin to avoid recursion
  const wmStoragePath = watermarkUrlToStoragePath(config.imageUrl);
  if (!wmStoragePath || wmStoragePath === selfStoragePath) return source;

  const bucket = getAdminStorage().bucket();
  const wmFile = bucket.file(wmStoragePath);
  const [wmExists] = await wmFile.exists();
  if (!wmExists) return source;

  const [wmBuffer] = await wmFile.download();
  const wmTargetWidth = Math.max(1, Math.round((targetWidth * config.size) / 100));
  const resized = await sharp(wmBuffer)
    .resize(wmTargetWidth, null, { fit: "inside" })
    .png()
    .toBuffer();

  return image.composite([{ input: resized, gravity: "center", blend: "over" }]).toBuffer();
}
