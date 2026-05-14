import type { MetadataRoute } from "next";
import { buildRobots } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export default function robots(): MetadataRoute.Robots {
  return buildRobots({ siteUrl: SEO_CONFIG.siteUrl });
}
