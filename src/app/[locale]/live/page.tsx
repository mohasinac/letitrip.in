import { Suspense } from "react";
import type { Metadata } from "next";
import { LiveItemsListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Live — LetItRip",
  description:
    "Find live animals and exotic pets on LetItRip — reptiles, fish, invertebrates and more from verified sellers. Delivery or pickup available.",
  path: "/live",
  keywords: [
    "buy live animals india",
    "exotic pets marketplace india",
    "reptiles for sale india",
    "live fish invertebrates india",
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
      <LiveItemsListView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
