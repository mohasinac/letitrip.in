import { Suspense } from "react";
import type { Metadata } from "next";
import { ScamRegistryView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "Scam Registry — Verified Collectibles Scammers in India | LetItRip",
  description:
    "Check if a seller is a known scammer before buying. Verified profiles with phone numbers, UPI IDs, and email addresses of scammers active in India's collectibles market.",
  path: "/scams",
  keywords: [
    "pokemon scammer india",
    "collectibles scammer upi",
    "fake seller india",
    "beyblade scammer",
    "hot wheels scammer india",
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
      <ScamRegistryView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
