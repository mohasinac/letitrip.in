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
import { safeRead } from "@mohasinac/appkit/server";
import {
  resolveEffectiveWatermark,
  DEFAULT_WATERMARK_TEXT,
  DEFAULT_MARKER_ASSET_PATH,
} from "@/lib/watermark/resolve-effective-watermark";
import type { WatermarkConfig, WatermarkPosition } from "@/lib/watermark/resolve-effective-watermark";

export const DAY_SECONDS = 60 * 60 * 24;
export const WEEK_SECONDS = DAY_SECONDS * 7;
/**
 * `stale-if-error` is the half that matters during an upstream outage.
 *
 * Without it, a CDN entry that expires while the origin image host is down
 * forces a revalidation, the revalidation fails, and a previously-good image
 * becomes a placeholder. With it, the CDN keeps serving the last good copy for
 * a day and the outage never reaches the visitor at all.
 *
 * Added 2026-08-31, when picsum.photos went down and took ~409 seeded images
 * with it. The cached copies were the only thing standing between that and a
 * completely image-less site — so they should be allowed to stand longer.
 */
export const CACHE_CONTROL_IMMUTABLE = `public, max-age=${DAY_SECONDS}, s-maxage=${WEEK_SECONDS}, immutable, stale-if-error=${DAY_SECONDS}`;
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

/**
 * Absolute ceiling on the watermark's rendered width in pixels, regardless of
 * `config.size` (a % of the *source* image width). Without this, a
 * percentage-based watermark scales unbounded on large originals — 10% of a
 * 1600px+ hero/carousel image is a much more prominent mark than 10% of a
 * small product-detail thumbnail, even though the percentage is identical.
 * Keeps the mark legible-but-small everywhere; thumbnails are already well
 * under this cap so they're unaffected.
 */
const MAX_WATERMARK_PX = 180;

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
    // Only the site NAME is read here, and DEFAULT_WATERMARK_TEXT is a real
    // answer when it is unavailable — the image still ships watermarked.
    safeRead(() => siteSettingsRepository.getSingleton(), {
      route: "/media/[...slug]",
      key: "siteSettings.getSingleton",
      fallback: null,
    }),
  ]);
  const siteName = settings?.siteName?.trim() || DEFAULT_WATERMARK_TEXT;
  return {
    type: "text",
    text: `${displayName} · ${siteName}`,
    imageUrl: "",
    size: CATALOGUE_WATERMARK_SIZE_PCT,
    opacity: CATALOGUE_WATERMARK_OPACITY_PCT,
    position: "center",
    offsetX: 0,
    offsetY: 0,
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
  const wmWidth = Math.max(1, Math.min(MAX_WATERMARK_PX, Math.round((targetWidth * sizePct) / 100)));
  const fontSize = Math.max(12, Math.round(wmWidth / Math.max(text.length * 0.55, 1)));
  const wmHeight = Math.round(fontSize * 1.6);
  const fillAlpha = opacityPct / 100;
  const strokeAlpha = Math.min(1, fillAlpha * 0.6);
  const safe = escapeXml(text);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${wmWidth}" height="${wmHeight}" viewBox="0 0 ${wmWidth} ${wmHeight}"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="rgba(255,255,255,${fillAlpha})" stroke="rgba(0,0,0,${strokeAlpha})" stroke-width="1">${safe}</text></svg>`;
  return Buffer.from(svg);
}

/**
 * Retints the bundled marker SVG's `#logo-gradient` stops to match the live
 * site theme's `--appkit-gradient-logo` (0% / 55% / 100%) instead of the
 * hardcoded blue→pink baked into the file on disk. Only ever applied to the
 * known-shape `public/logo.svg` — never to an admin-uploaded override.
 */
function rethemeMarkerSvg(svg: string, stops: readonly [string, string, string]): string {
  const [from, mid, to] = stops;
  return svg.replace(
    /<linearGradient id="logo-gradient"[^>]*>[\s\S]*?<\/linearGradient>/,
    `<linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">` +
      `<stop offset="0%" style="stop-color:${from}"/>` +
      `<stop offset="55%" style="stop-color:${mid}"/>` +
      `<stop offset="100%" style="stop-color:${to}"/>` +
      `</linearGradient>`,
  );
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
  themeGradientStops?: readonly [string, string, string],
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
      const raw = await readFile(filePath);
      if (imageUrl === DEFAULT_MARKER_ASSET_PATH && themeGradientStops) {
        return Buffer.from(rethemeMarkerSvg(raw.toString("utf-8"), themeGradientStops));
      }
      return raw;
    } catch (err) {
      void normalizeError(err);
      return null;
    }
  }
  return null;
}

/**
 * Scales the alpha channel of a PNG buffer by `opacityPct` (0–100). sharp's
 * `composite()` has no per-layer opacity option, so this is done by hand on
 * the raw pixel buffer before compositing — without it, `config.opacity` was
 * silently ignored for every image-type watermark (only the text watermark's
 * SVG respected it).
 */
async function applyPngOpacity(buffer: Buffer, opacityPct: number): Promise<Buffer> {
  const alpha = Math.max(0, Math.min(100, opacityPct)) / 100;
  if (alpha >= 1) return buffer;
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += info.channels) {
    data[i] = Math.round(data[i] * alpha);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toBuffer();
}

type SharpGravity = "northwest" | "northeast" | "southwest" | "southeast" | "center";

const GRAVITY_BY_POSITION: Record<Exclude<WatermarkPosition, "custom">, SharpGravity> = {
  "top-left": "northwest",
  "top-right": "northeast",
  "bottom-left": "southwest",
  "bottom-right": "southeast",
  center: "center",
};

/**
 * The 4-corner/center presets map straight to sharp's built-in `gravity`.
 * `"custom"` instead computes explicit `top`/`left` pixel coordinates —
 * `offsetX`/`offsetY` are a %-of-canvas nudge from the exact center,
 * clamped so the overlay can't be pushed off-canvas.
 */
function resolveCompositePlacement(
  config: Pick<WatermarkConfig, "position" | "offsetX" | "offsetY">,
  canvasWidth: number,
  canvasHeight: number,
  overlayWidth: number,
  overlayHeight: number,
): { gravity: SharpGravity } | { top: number; left: number } {
  if (config.position !== "custom") {
    return { gravity: GRAVITY_BY_POSITION[config.position] };
  }
  const rawLeft = canvasWidth / 2 + (config.offsetX / 100) * canvasWidth - overlayWidth / 2;
  const rawTop = canvasHeight / 2 + (config.offsetY / 100) * canvasHeight - overlayHeight / 2;
  return {
    left: Math.round(Math.max(0, Math.min(canvasWidth - overlayWidth, rawLeft))),
    top: Math.round(Math.max(0, Math.min(canvasHeight - overlayHeight, rawTop))),
  };
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
  const targetHeight = meta.height ?? 800;

  if (config.type === "image") {
    const wmBuffer = await loadWatermarkImageBuffer(
      config.imageUrl,
      selfStoragePath,
      config.themeGradientStops,
    );
    if (wmBuffer) {
      const wmTargetWidth = Math.max(1, Math.min(MAX_WATERMARK_PX, Math.round((targetWidth * config.size) / 100)));
      const resized = await sharp(wmBuffer)
        .resize(wmTargetWidth, null, { fit: "inside" })
        .png()
        .toBuffer();
      const withOpacity = await applyPngOpacity(resized, config.opacity);
      const overlayMeta = await sharp(withOpacity).metadata();
      const placement = resolveCompositePlacement(
        config,
        targetWidth,
        targetHeight,
        overlayMeta.width ?? wmTargetWidth,
        overlayMeta.height ?? wmTargetWidth,
      );
      return image.composite([{ input: withOpacity, blend: "over", ...placement }]).toBuffer();
    }
    // Image tier unavailable (e.g. an admin-uploaded override was deleted from
    // Storage) — degrade to the text watermark rather than skip it entirely.
    const overlay = buildTextWatermarkSvg(DEFAULT_WATERMARK_TEXT, targetWidth, config.size, config.opacity);
    const overlayMeta = await sharp(overlay).metadata();
    const placement = resolveCompositePlacement(config, targetWidth, targetHeight, overlayMeta.width ?? 0, overlayMeta.height ?? 0);
    return image.composite([{ input: overlay, blend: "over", ...placement }]).toBuffer();
  }

  const overlay = buildTextWatermarkSvg(config.text, targetWidth, config.size, config.opacity);
  const overlayMeta = await sharp(overlay).metadata();
  const placement = resolveCompositePlacement(config, targetWidth, targetHeight, overlayMeta.width ?? 0, overlayMeta.height ?? 0);
  return image.composite([{ input: overlay, blend: "over", ...placement }]).toBuffer();
}
