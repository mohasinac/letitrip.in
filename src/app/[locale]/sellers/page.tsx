import { Suspense } from "react";
import type { Metadata } from "next";
import { SellersListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";

export const metadata: Metadata = _gm({
  title: "Verified Sellers — LetItRip",
  description: "Browse trusted sellers on LetItRip — India's largest collectibles marketplace for Pokémon TCG, Hot Wheels, anime figures and more.",
  path: "/sellers",
  keywords: ["collectibles sellers india", "verified sellers letitrip", "buy from sellers"],
});

export const revalidate = 120;

export default function Page() {
  return (
    <>
      <PageViewTracker entityType="listing" entityId="sellers" url="/sellers" />
      <Suspense>
        <SellersListView />
      </Suspense>
    </>
  );
}
