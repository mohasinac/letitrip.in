import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoriesIndexPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Browse Collectibles Categories — LetItRip",
  description:
    "Explore action figures, trading cards, diecast vehicles, model kits, spinning tops and vintage collectibles on LetItRip.",
  path: "/categories",
  keywords: ["action figures", "trading cards", "diecast vehicles", "gundam", "beyblade", "collectibles categories"],
});

export const revalidate = 300;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense>
      <CategoriesIndexPageView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
