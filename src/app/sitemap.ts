import type { MetadataRoute } from "next";
import { buildSitemap } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap({ baseUrl: SEO_CONFIG.siteUrl });
}

export const revalidate = 3600;
