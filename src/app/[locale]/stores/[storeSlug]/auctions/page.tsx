import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Spinner } from "@/components";
import { StoreAuctionsView } from "@/features/stores";
import { storeRepository } from "@/repositories";
import { SITE_CONFIG, THEME_CONSTANTS } from "@/constants";
import type { Metadata } from "next";

const { flex, page } = THEME_CONSTANTS;

interface Props {
  params: Promise<{ locale: string; storeSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeSlug } = await params;
  const [store, t] = await Promise.all([
    storeRepository.findBySlug(storeSlug),
    getTranslations("storePage"),
  ]);
  if (!store) return {};
  const title = `${store.storeName} — ${t("tabs.auctions")} | ${SITE_CONFIG.brand.name}`;
  return {
    title,
    description: store.storeDescription,
    openGraph: {
      title,
      images: store.storeBannerURL ? [store.storeBannerURL] : [],
    },
  };
}

export default async function StoreAuctionsPage({ params }: Props) {
  const { storeSlug } = await params;
  return (
    <Suspense
      fallback={
        <div className={`${flex.hCenter} ${page.empty}`}>
          <Spinner />
        </div>
      }
    >
      <StoreAuctionsView storeSlug={storeSlug} />
    </Suspense>
  );
}
