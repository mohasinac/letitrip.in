import type { Metadata } from "next";
import { FranchisesIndexView } from "@mohasinac/appkit/features/categories/components/FranchisesIndexView";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";

export const metadata: Metadata = _gm({
  title: "Franchises — LetItRip",
  description:
    "Browse collectibles by franchise — the universes we stock, from Beyblade onward.",
  path: "/franchise",
  keywords: ["beyblade franchise", "collectibles by franchise", "anime collectibles india"],
});

export const revalidate = 3600;

export default function Page() {
  return (
    <>
      <PageViewTracker entityType="listing" entityId="franchises" url="/franchise" />
      <FranchisesIndexView />
    </>
  );
}
