import { Suspense } from "react";
import type { Metadata } from "next";
import { ArtStickersListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Art & Stickers — LetItRip",
  description:
    "Shop original art prints and sticker packs from independent sellers on LetItRip.",
  path: "/art",
  keywords: ["collectible art prints india", "sticker packs india", "fan art marketplace"],
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
      <ArtStickersListView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
