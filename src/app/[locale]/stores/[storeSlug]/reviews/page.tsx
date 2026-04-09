import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Spinner } from "@/components";
import { StoreReviewsView } from "@/features/stores/components";
import { storeRepository } from "@/repositories";
import { SITE_CONFIG, THEME_CONSTANTS } from "@/constants";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolve-locale";

const { flex, page } = THEME_CONSTANTS;

interface Props {
  params: Promise<{ locale: string; storeSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, storeSlug } = await params;
  const locale = resolveLocale(rawLocale);
  const [store, t] = await Promise.all([
    storeRepository.findBySlug(storeSlug),
    getTranslations({ locale, namespace: "storePage" }),
  ]);
  if (!store) return {};
  const title = `${store.storeName} — ${t("tabs.reviews")} | ${SITE_CONFIG.brand.name}`;
  return {
    title,
    description: store.storeDescription,
    openGraph: {
      title,
      images: store.storeBannerURL ? [store.storeBannerURL] : [],
    },
  };
}

export default async function StoreReviewsPage({ params }: Props) {
  const { locale: rawLocale, storeSlug } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  return (
    <Suspense
      fallback={
        <div className={`${flex.hCenter} ${page.empty}`}>
          <Spinner />
        </div>
      }
    >
      <StoreReviewsView storeSlug={storeSlug} />
    </Suspense>
  );
}
