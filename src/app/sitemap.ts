import type { MetadataRoute } from "next";
import { buildSitemap } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";
import { HELP_AUTHENTICITY_PATH, TOOL_AUTHENTICITY_PATH } from "@/constants";

/**
 * 🛑 The consumer-only tail entries exist because `buildSitemap` lives in appkit
 * (`_internal/server/features/seo/sitemap.ts`) and this app is pinned to a
 * published appkit version — so a page added here cannot reach that list until
 * appkit is republished, which is a separate, explicitly-requested step.
 *
 * A page absent from the sitemap is not merely unlisted: Root Cause #81 is the
 * record of what host/sitemap disagreement cost this site, and the cheapest
 * version of that mistake is simply never advertising a page at all.
 *
 * Append here, and move the entry into appkit's own list at the next publish.
 */
const CONSUMER_ONLY_PAGES: MetadataRoute.Sitemap = [
  {
    url: `${SEO_CONFIG.siteUrl.replace(/\/$/, "")}${TOOL_AUTHENTICITY_PATH}`,
    lastModified: new Date(),
    /*
     * `monthly` and 0.6: the reference content changes when the knowledge base
     * changes, which is rarely, and it is a tool rather than inventory. Both
     * fields are hints Google may ignore — the point of the row is that the URL
     * is advertised at all.
     */
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    /*
     * The help article is the higher-priority of the two for search: it is
     * fully public, answers the query "is my beyblade original" directly, and
     * needs no account — whereas the tool's most useful half is gated.
     */
    url: `${SEO_CONFIG.siteUrl.replace(/\/$/, "")}${HELP_AUTHENTICITY_PATH}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await buildSitemap({ baseUrl: SEO_CONFIG.siteUrl });
  return [...base, ...CONSUMER_ONLY_PAGES];
}

export const revalidate = 3600;
