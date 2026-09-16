import { Suspense } from "react";
import type { Metadata } from "next";
import { StoresIndexPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";

export const metadata: Metadata = _gm({
  title: "Verified Sellers — LetItRip",
  description: "Browse trusted sellers on LetItRip — India's largest collectibles marketplace for Pokémon TCG, Hot Wheels, anime figures and more.",
  path: "/sellers",
  keywords: ["collectibles sellers india", "verified sellers letitrip", "buy from sellers"],
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
      <PageViewTracker entityType="listing" entityId="sellers" url="/sellers" />
      <Suspense>
        {/*
          Was `<SellersListView />` with no render props. Every slot on
          `SlottedListingView` is optional, so it rendered the header and
          breadcrumb and then a blank region — Root Cause #8, and that shell's
          only consumer was this page.

          Reuses the store index scoped to verified stores rather than filling
          the shell in, so /sellers inherits the SSR `q` push-down, sandbox
          hiding and the shared listing instead of becoming a second copy.
        */}
        <StoresIndexPageView
          searchParams={resolvedSearchParams}
          verifiedOnly
          heading="Verified Sellers"
        />
      </Suspense>
    </>
  );
}
