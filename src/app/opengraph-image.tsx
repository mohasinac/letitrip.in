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
  } catch {
    // fallback to emoji icon if logo file is unavailable
  }

  return buildDefaultOgImage({
    siteName: SEO_CONFIG.siteName,
    domain: "letitrip.in",
    logoUrl,
  });
}
