import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Spinner } from "@/components";
import { StoresListView } from "@/features/stores";
import { THEME_CONSTANTS } from "@/constants";
import { storeRepository } from "@/repositories";
import type { StoreDocument } from "@/db/schema";
import type { StoreListItem } from "@/types/stores";

const { page, flex } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("storesPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

function mapStore(store: StoreDocument): StoreListItem {
  return {
    id: store.id,
    storeSlug: store.storeSlug,
    ownerId: store.ownerId,
    storeName: store.storeName,
    storeDescription: store.storeDescription,
    storeCategory: store.storeCategory,
    storeLogoURL: store.storeLogoURL,
    storeBannerURL: store.storeBannerURL,
    status: store.status,
    isPublic: store.isPublic,
    totalProducts: store.stats?.totalProducts ?? 0,
    itemsSold: store.stats?.itemsSold ?? 0,
    totalReviews: store.stats?.totalReviews ?? 0,
    averageRating: store.stats?.averageRating,
    createdAt: store.createdAt as unknown as string,
  };
}

export default async function StoresPage() {
  const initialData = await storeRepository
    .listStores({ sorts: "-createdAt", page: 1, pageSize: 24 })
    .then((r) => ({
      items: r.items.map(mapStore),
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
