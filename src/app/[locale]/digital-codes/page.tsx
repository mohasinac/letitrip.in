import { Suspense } from "react";
import type { Metadata } from "next";
import { DigitalCodesListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "Digital Codes — LetItRip",
  description:
    "Buy verified digital codes on LetItRip — Pokémon TCG online codes, game DLC, gift cards and more. Instant auto-claim or manual delivery.",
  path: "/digital-codes",
  keywords: [
    "buy digital codes india",
    "pokemon tcg online codes",
    "game gift cards india",
    "digital collectibles marketplace",
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
    <Suspense>
      <DigitalCodesListView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
