import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@mohasinac/appkit";
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
  const store = await getStoreBySlug(storeSlug).catch(() => null);
  if (!store) notFound();
  return children;
}
