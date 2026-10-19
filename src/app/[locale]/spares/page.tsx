import { Suspense } from "react";
import type { Metadata } from "next";
import { SparesListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";

/*
 * 🛑 Its own canonical, via `_gm({ path })`. The root layout sets a static
 * absolute `alternates.canonical` and metadata is INHERITED, so a page that
 * does not set its own declares itself a duplicate of the homepage — which is
 * what already happened to `/promotions` and `/reviews` (Root Cause #81).
 * `_gm` resolves through `SEO_CONFIG.siteUrl`, the one host definition.
 */
export const metadata: Metadata = _gm({
  title: "Beyblade Spares & Loose Parts — LetItRip",
  description:
    "Buy single Beyblade components — attack rings, weight disks, drivers, bits and more. Loose spares from independent sellers across India.",
  path: "/spares",
  keywords: [
    "beyblade spare parts india",
    "loose beyblade parts",
    "beyblade attack ring",
    "beyblade weight disk",
  ],
});

export const revalidate = 120;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <>
      <PageViewTracker entityType="listing" entityId="spares" url="/spares" />
      <Suspense>
        <SparesListView searchParams={resolvedSearchParams} />
      </Suspense>
    </>
  );
}
