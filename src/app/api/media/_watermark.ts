import { normalizeError } from "@mohasinac/appkit";
/**
 * Shared watermark helpers for /api/media/[...slug] and /api/media/ext.
 * Both routes apply the same watermark logic; this module is the single source.
 */
import "@/providers.config";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getAdminStorage, serverLogger, siteSettingsRepository, userRepository } from "@mohasinac/appkit";
import {
  resolveEffectiveWatermark,
  DEFAULT_WATERMARK_TEXT,
} from "@/lib/watermark/resolve-effective-watermark";
import type { WatermarkConfig } from "@/lib/watermark/resolve-effective-watermark";

export const DAY_SECONDS = 60 * 60 * 24;
export const WEEK_SECONDS = DAY_SECONDS * 7;
export const CACHE_CONTROL_IMMUTABLE = `public, max-age=${DAY_SECONDS}, s-maxage=${WEEK_SECONDS}, immutable`;
/**
 * Used ONLY when `applyWatermark()` throws and a route falls back to serving
 * the original, unwatermarked bytes. Deliberately short-lived and
 * `must-revalidate` — the failure is very likely transient (a momentary
 * Storage/sharp hiccup), so the next request should retry watermarking
 * rather than have browsers/CDNs treat the unwatermarked fallback as the
 * final `immutable` file for a month.
 */
export const CACHE_CONTROL_WATERMARK_FALLBACK = "public, max-age=60, s-maxage=60, must-revalidate";

export const IMAGE_MIME_PREFIX = "image/";
export const SVG_MIME = "image/svg+xml";

const WATERMARK_CACHE_TTL_MS = 60_000;
const MEDIA_PROXY_PATH_PREFIX = "media/";

let watermarkCache: { value: WatermarkConfig; expiresAt: number } | null = null;

/**
 * Resolves the effective watermark via {@link resolveEffectiveWatermark} —
 * marker image → wordmark image → plain text, see that module for the tier
 * order. Falls back to the bundled marker (bypassing Firestore) if the
 * settings read itself fails, so the proxy never renders unwatermarked.
 */
export async function loadWatermarkConfig(): Promise<WatermarkConfig> {
  if (watermarkCache && watermarkCache.expiresAt > Date.now()) {
    return watermarkCache.value;
  }
  try {
    const settings = await siteSettingsRepository.getSingleton();
    const value = resolveEffectiveWatermark(settings);
    watermarkCache = { value, expiresAt: Date.now() + WATERMARK_CACHE_TTL_MS };
    return value;
  } catch (err) {
    void normalizeError(err);
    serverLogger.warn(
      "media-proxy: siteSettingsRepository.getSingleton failed; using default watermark",
      { error: err instanceof Error ? err.message : String(err) },
    );
    return resolveEffectiveWatermark(null);
  }
}

const CATALOGUE_CONTEXT_TYPE = "catalogue-image";
const CATALOGUE_WATERMARK_SIZE_PCT = 16;
const CATALOGUE_WATERMARK_OPACITY_PCT = 25;
const DISPLAY_NAME_CACHE_TTL_MS = 60_000;
const displayNameCache = new Map<string, { value: string; expiresAt: number }>();

async function resolveDisplayName(uid: string): Promise<string> {
  const cached = displayNameCache.get(uid);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  try {
    const user = await userRepository.findById(uid);
    const value = user?.displayName?.trim() || "LetItRip user";
    displayNameCache.set(uid, { value, expiresAt: Date.now() + DISPLAY_NAME_CACHE_TTL_MS });
    return value;
  } catch (err) {
    void normalizeError(err);
    return "LetItRip user";
  }
}

/**
 * Feature B — personal catalogue images carry the owner's identity rather
 * than the generic site watermark, smaller and centered. Every other
 * context falls back to {@link loadWatermarkConfig} unchanged.
 */
export async function resolveWatermarkConfig(
  uploaderUid?: string,
  contextType?: string,
): Promise<WatermarkConfig> {
  if (contextType !== CATALOGUE_CONTEXT_TYPE || !uploaderUid) {
    return loadWatermarkConfig();
  }
  const [displayName, settings] = await Promise.all([
    resolveDisplayName(uploaderUid),
    siteSettingsRepository.getSingleton().catch(() => null),
  ]);
  const siteName = settings?.siteName?.trim() || DEFAULT_WATERMARK_TEXT;
  return {
    type: "text",
    text: `${displayName} · ${siteName}`,
    imageUrl: "",
    size: CATALOGUE_WATERMARK_SIZE_PCT,
    opacity: CATALOGUE_WATERMARK_OPACITY_PCT,
  };
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

/**
 * Loads the raw bytes for an image watermark. `/media/<slug>` paths are
 * admin-uploaded overrides fetched via Storage Admin (unchanged behaviour).
 * Any other root-relative path (e.g. the bundled marker's `/logo.svg`) is a
 * static asset shipped under `public/` and is read straight off disk — no
 * Storage round-trip needed for the default brand mark.
 */
async function loadWatermarkImageBuffer(
  imageUrl: string,
  selfStoragePath: string,
): Promise<Buffer | null> {
  if (imageUrl.startsWith(`/${MEDIA_PROXY_PATH_PREFIX}`)) {
    const wmStoragePath = watermarkUrlToStoragePath(imageUrl);
    if (!wmStoragePath || wmStoragePath === selfStoragePath) return null;
    const bucket = getAdminStorage().bucket();
    const wmFile = bucket.file(wmStoragePath);
    const [wmExists] = await wmFile.exists();
    if (!wmExists) return null;
    const [wmBuffer] = await wmFile.download();
    return wmBuffer;
  }
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) {
    // `imageUrl` can originate from an admin-editable settings field — never
    // trust it as a bare path segment. Resolve it and verify the result is
    // still inside `public/` before reading, so a stray `../../` can't walk
    // the read outside the intended directory and load an unrelated file.
    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.join(publicDir, imageUrl.replace(/^\/+/, ""));
    const relative = path.relative(publicDir, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
    try {
      return await readFile(filePath);
    } catch (err) {
      void normalizeError(err);
      return null;
    }
  }
  return null;
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

  if (config.type === "image") {
    const wmBuffer = await loadWatermarkImageBuffer(config.imageUrl, selfStoragePath);
    if (wmBuffer) {
      const wmTargetWidth = Math.max(1, Math.round((targetWidth * config.size) / 100));
      const resized = await sharp(wmBuffer)
        .resize(wmTargetWidth, null, { fit: "inside" })
        .png()
        .toBuffer();
      return image.composite([{ input: resized, gravity: "center", blend: "over" }]).toBuffer();
    }
    // Image tier unavailable (e.g. an admin-uploaded override was deleted from
    // Storage) — degrade to the text watermark rather than skip it entirely.
    const overlay = buildTextWatermarkSvg(DEFAULT_WATERMARK_TEXT, targetWidth, config.size, config.opacity);
    return image.composite([{ input: overlay, gravity: "center", blend: "over" }]).toBuffer();
  }

  const overlay = buildTextWatermarkSvg(config.text, targetWidth, config.size, config.opacity);
  return image.composite([{ input: overlay, gravity: "center", blend: "over" }]).toBuffer();
}
