import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { SEO_CONFIG } from "@/constants";

export const revalidate = 120;

// This route serves 200 and redirects onward to /promotions/deals, and it is
// listed in the sitemap — so it is a URL Google will crawl and index. Point its
// canonical at the destination that actually renders, consolidating the two.
//
// Before this it had no metadata of its own and inherited the root layout's
// static `canonical: SEO_CONFIG.siteUrl`, i.e. it declared itself a duplicate of
// the homepage. That root-level canonical is now gone (see src/app/layout.tsx),
// which is why this page needs to state its own.
export const metadata: Metadata = _gm({
  title: SEO_CONFIG.pages.promotions.title,
  description: SEO_CONFIG.pages.promotions.description,
  path: "/promotions/deals",
});

export default function Page() {
  redirect("/promotions/deals");
}
