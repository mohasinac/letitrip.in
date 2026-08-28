import { normalizeError } from "@mohasinac/appkit";
import { readFile } from "fs/promises";
import path from "path";
import { buildDefaultOgImage, DEFAULT_OG_SIZE } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const runtime = "nodejs";
export const alt = SEO_CONFIG.siteName;
export const size = DEFAULT_OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage() {
  let logoUrl: string | undefined;
  try {
    const logoData = await readFile(
      path.join(process.cwd(), "public/favicon/android-chrome-512x512.png"),
    );
    logoUrl = `data:image/png;base64,${logoData.toString("base64")}`;
  // The logo file is optional decoration on a social card; the emoji fallback
  // below renders a complete image, and a crawler must never get a 500 here.
  } catch (_err) {
    void normalizeError(_err);
  }

  return buildDefaultOgImage({
    siteName: SEO_CONFIG.siteName,
    domain: "letitrip.in",
    logoUrl,
  });
}
