import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getStoreBySlug, productFeaturesRepository } from "@mohasinac/appkit";
import { ProductFeaturesProvider } from "@mohasinac/appkit/client";
import { generateMetadata as _gm } from "@/constants/seo.server";

type Props = {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug).catch(() => null);
  if (!store) return { title: "Store Not Found" };
  return _gm({
    title: `${store.storeName} — LetItRip`,
    description:
      store.storeDescription?.slice(0, 155) ||
      `Shop collectibles from ${store.storeName} on LetItRip.`,
    image: store.storeLogoURL,
    path: `/stores/${storeSlug}`,
    type: "website",
  });
}

export default async function Layout({ children, params }: Props) {
  const { storeSlug } = await params;
  const [store, platformFeatures] = await Promise.all([
    getStoreBySlug(storeSlug).catch(() => null),
    productFeaturesRepository.listPlatform().catch(() => []),
  ]);
  if (!store) notFound();
  // S6 FI6-2 — provider at the storeSlug boundary covers every store sub-page
  // (products/auctions/pre-orders/about/reviews/coupons + the storeSlug root)
  // so feature badges render uniformly across the whole store surface.
  return (
    <ProductFeaturesProvider features={platformFeatures}>
      {children}
    </ProductFeaturesProvider>
  );
}
