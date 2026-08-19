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
}

export const DEFAULT_WATERMARK_TEXT = "letitrip.in";
const DEFAULT_SIZE = 24;
const DEFAULT_OPACITY = 24;

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
}

/** Whether the bundled marker asset should be considered available. Kept as
 * a function (not a bare `true`) so a future admin toggle to disable it can
 * slot in without changing every call site. */
function isMarkerAssetAvailable(): boolean {
  return true;
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

  // Tier 2 — bundled icon mark.
  if (isMarkerAssetAvailable()) {
    return { type: "image", text: "", imageUrl: DEFAULT_MARKER_ASSET_PATH, size, opacity };
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
