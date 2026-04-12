"use client";

import { THEME_CONSTANTS } from "@/constants";
import { StoreHeader as AppkitStoreHeader } from "@mohasinac/appkit/features/stores";
import { Skeleton } from "@/components";
import { useStoreBySlug } from "@mohasinac/appkit/features/stores";

const { flex, page } = THEME_CONSTANTS;

interface StoreHeaderProps {
  storeSlug: string;
}

export function StoreHeader({ storeSlug }: StoreHeaderProps) {
  const { store, isLoading } = useStoreBySlug(storeSlug);

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="h-36 sm:h-48 w-full rounded-none" />
        <div className={`${page.container.wide} pb-4`}>
          <div className="flex items-end gap-4 -mt-8 sm:-mt-10">
            <Skeleton
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${flex.noShrink}`}
            />
            <div className="flex-1 pb-2 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!store) return null;

  const mappedStore = {
    id: store.id,
    ownerId: store.ownerId ?? "",
    storeName: store.storeName,
    storeSlug: store.storeSlug ?? storeSlug,
    storeDescription: store.storeDescription,
    storeLogoURL: store.storeLogoURL,
    storeBannerURL: store.storeBannerURL,
    storeCategory: store.storeCategory,
    totalProducts: store.totalProducts,
    itemsSold: store.itemsSold,
    averageRating: store.averageRating,
    totalReviews: store.totalReviews,
    isVacationMode: store.isVacationMode,
    vacationMessage: store.vacationMessage,
  } as const;

  return (
    <div className="w-full">
      <AppkitStoreHeader
        store={mappedStore as any}
        className={page.container.wide}
      />
    </div>
  );
}
