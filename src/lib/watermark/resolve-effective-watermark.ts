/**
 * Single source of truth for turning `siteSettings.watermark` (as stored in
 * Firestore) into the watermark that actually gets applied — both to images
 * (server-side sharp composite, `src/app/api/media/_watermark.ts`) and video
 * (client-side overlay, `MediaVideo.tsx` via `GET /api/site-settings`).
 *
 * Fallback chain (first match wins):
 *   1. Explicit admin override — `watermark.type === "image"` with a real
 *      `watermark.imageUrl` the admin uploaded via Site Settings.
 *   2. The bundled brand icon mark (`public/logo.svg`) — always shipped with
 *      the app, so this tier normally always resolves once tier 1 is empty.
 *   3. The admin-configured wordmark image (`logo.url`), if one is set.
 *   4. Plain site-name text — the original always-available default.
 */

/** Root-relative path to the bundled icon mark shipped in `public/`. */
export const DEFAULT_MARKER_ASSET_PATH = "/logo.svg";

export interface WatermarkConfig {
  type: "text" | "image";
  text: string;
  imageUrl: string;
  /** % of target width — 0 disables the watermark entirely. */
  size: number;
  /** % opacity — 0 fully transparent, 100 fully opaque. */
  opacity: number;
  /**
   * Hex stops `[from, mid, to]` matching the active default-light theme's
   * `--appkit-gradient-logo` (0% / 55% / 100%), used to retheme the bundled
   * SVG marker so the watermark stays visually consistent with the live site
   * theme instead of the hardcoded colors baked into `public/logo.svg`.
   * Only meaningful when `imageUrl === DEFAULT_MARKER_ASSET_PATH`.
   */
  themeGradientStops?: readonly [string, string, string];
}

export const DEFAULT_WATERMARK_TEXT = "letitrip.in";
// Deliberately subtle — a watermark that's easy to spot defeats the point of
// a "carefully-hidden" provenance mark. See CLAUDE.md Root Cause sweep notes.
const DEFAULT_SIZE = 8;
const DEFAULT_OPACITY = 12;

/** default-light's `appkit-color-primary-700/500` + `secondary-400` — used
 * only if `settings.theme` has no matching record (should be rare). */
const FALLBACK_GRADIENT_STOPS: readonly [string, string, string] = ["#0f766e", "#14b8a6", "#e879f9"];
const LOGO_GRADIENT_TOKEN_KEYS = [
  "appkit-color-primary-700",
  "appkit-color-primary-500",
  "appkit-color-secondary-400",
] as const;

function clampPercent(n: unknown, fallback: number): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

export interface WatermarkResolverSettings {
  watermark?: {
    type?: "text" | "image";
    text?: string;
    imageUrl?: string;
    size?: number;
    opacity?: number;
  };
  logo?: { url?: string };
  siteName?: string;
  theme?: {
    themes?: Array<{ id: string; tokens?: Record<string, string> }>;
    defaultLightThemeId?: string;
  };
}

/** Whether the bundled marker asset should be considered available. Kept as
 * a function (not a bare `true`) so a future admin toggle to disable it can
 * slot in without changing every call site. */
function isMarkerAssetAvailable(): boolean {
  return true;
}

function resolveThemeGradientStops(
  settings: WatermarkResolverSettings | null | undefined,
): readonly [string, string, string] {
  const themeCfg = settings?.theme;
  const activeId = themeCfg?.defaultLightThemeId || "default-light";
  const record =
    themeCfg?.themes?.find((t) => t.id === activeId) ??
    themeCfg?.themes?.find((t) => t.id === "default-light");
  const tokens = record?.tokens;
  if (!tokens) return FALLBACK_GRADIENT_STOPS;
  const stops = LOGO_GRADIENT_TOKEN_KEYS.map((key) => tokens[key]);
  if (!stops.every((v): v is string => typeof v === "string" && v.trim().length > 0)) {
    return FALLBACK_GRADIENT_STOPS;
  }
  return stops as unknown as readonly [string, string, string];
}

export function resolveEffectiveWatermark(
  settings: WatermarkResolverSettings | null | undefined,
): WatermarkConfig {
  const wm = settings?.watermark;
  const size = clampPercent(wm?.size, DEFAULT_SIZE);
  const opacity = clampPercent(wm?.opacity, DEFAULT_OPACITY);

  // Tier 1 — explicit admin override.
  if (wm?.type === "image" && typeof wm.imageUrl === "string" && wm.imageUrl.trim()) {
    return { type: "image", text: "", imageUrl: wm.imageUrl.trim(), size, opacity };
  }

  // Tier 2 — bundled icon mark, retinted to the active theme's logo gradient.
  if (isMarkerAssetAvailable()) {
    return {
      type: "image",
      text: "",
      imageUrl: DEFAULT_MARKER_ASSET_PATH,
      size,
      opacity,
      themeGradientStops: resolveThemeGradientStops(settings),
    };
  }

  // Tier 3 — admin-configured wordmark image.
  if (settings?.logo?.url?.trim()) {
    return { type: "image", text: "", imageUrl: settings.logo.url.trim(), size, opacity };
  }

  // Tier 4 — plain text.
  const text =
    (typeof wm?.text === "string" && wm.text.trim()) ||
    settings?.siteName?.trim() ||
    DEFAULT_WATERMARK_TEXT;
  return { type: "text", text, imageUrl: "", size, opacity };
}
