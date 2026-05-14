import { buildDefaultOgImage, DEFAULT_OG_SIZE } from "@mohasinac/appkit/server";
// Import directly from source file (not the barrel) to keep OG image route lean.
import { SEO_CONFIG } from "@/constants/seo";

export const runtime = "nodejs";
export const alt = SEO_CONFIG.siteName;
export const size = DEFAULT_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return buildDefaultOgImage({
    siteName: SEO_CONFIG.siteName,
    domain: "letitrip.in",
  });
}
