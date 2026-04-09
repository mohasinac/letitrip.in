import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Spinner } from "@/components";
import { StoresListView } from "@/features/stores/components";
import { mapStoreDocument } from "@/features/stores/utils";
import { THEME_CONSTANTS } from "@/constants";
import { storeRepository } from "@/repositories";
import { resolveLocale } from "@/i18n/resolve-locale";

export const revalidate = 60;

const { page, flex } = THEME_CONSTANTS;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "storesPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function StoresPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const initialData = await storeRepository
    .listStores({ sorts: "-createdAt", page: 1, pageSize: 24 })
    .then((r) => ({
      items: r.items.map(mapStoreDocument),
      total: r.total,
      page: r.page,
      pageSize: r.pageSize,
      totalPages: r.totalPages,
      hasMore: r.hasMore,
    }))
    .catch(() => undefined);

  return (
    <div className={`${page.container.wide} py-6 sm:py-10`}>
      <Suspense
        fallback={
          <div className={`${flex.hCenter} ${page.empty}`}>
            <Spinner />
          </div>
        }
      >
        <StoresListView initialData={initialData} />
      </Suspense>
    </div>
  );
}
