import { Suspense } from "react";
import type { Metadata } from "next";
import { ReviewsIndexPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 120;

// Had no metadata at all, so it inherited the root layout's static
// `canonical: SEO_CONFIG.siteUrl` and declared itself a duplicate of the
// homepage — which is an instruction to Google to drop it. That root canonical
// is now gone (see src/app/layout.tsx), so this page states its own.
export const metadata: Metadata = _gm({
  title: "Buyer Reviews — LetItRip",
  description:
  "Verified buyer reviews of collectibles and sellers on LetItRip. Read real feedback from Indian collectors before you buy.",
  path: "/reviews",
  keywords: ["reviews", "buyer reviews", "seller ratings", "collectibles", "LetItRip"],
});

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense>
      <ReviewsIndexPageView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
