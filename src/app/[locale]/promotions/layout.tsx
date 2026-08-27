import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { SEO_CONFIG } from "@/constants";

/**
 * The canonical for the whole promotions section lives here, on the LAYOUT.
 *
 * `/promotions` is what the sitemap advertises (`ROUTES.PUBLIC.PROMOTIONS`),
 * so that is the URL every page under this segment must point at. The tabs
 * (`deals` / `coupons` / `featured` / `all`) are views of one page, not four
 * pages, so they inherit this rather than each declaring their own — Next
 * merges metadata, and a child that omits `alternates` keeps the parent's.
 *
 * Same shape as `stores/[storeSlug]/layout.tsx`, where every tab consolidates
 * onto `/stores/{slug}`.
 *
 * 🛑 Why it cannot live on `page.tsx`: that file calls `redirect()`, so its
 * metadata never reaches a browser. Anything crawling `/promotions` follows
 * the redirect and reads the canonical of the page that actually renders —
 * the tab. Setting a `path` there fixes nothing.
 */
export const metadata: Metadata = _gm({
  title: SEO_CONFIG.pages.promotions.title,
  description: SEO_CONFIG.pages.promotions.description,
  keywords: SEO_CONFIG.pages.promotions.keywords,
  path: "/promotions",
});

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return children;
}