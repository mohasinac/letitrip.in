"use client";

import { Store, Star, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Caption, AvatarDisplay, Skeleton } from "@/components";
import { useStoreBySlug } from "../hooks";

const { themed } = THEME_CONSTANTS;

interface StoreHeaderProps {
  storeSlug: string;
}

export function StoreHeader({ storeSlug }: StoreHeaderProps) {
  const t = useTranslations("storePage");
  const { data: store, isLoading } = useStoreBySlug(storeSlug);

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="h-36 sm:h-48 w-full rounded-none" />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pb-4">
          <div className="flex items-end gap-4 -mt-8 sm:-mt-10">
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex-shrink-0" />
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

  return (
    <div className="w-full">
      {/* Banner */}
      <div
        className="h-36 sm:h-48 w-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30"
        style={
          store.storeBannerURL
            ? {
                backgroundImage: `url(${store.storeBannerURL})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      />

      {/* Meta row */}
      <div className={`${themed.bgPrimary} border-b ${themed.border}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-end gap-4 -mt-8 sm:-mt-10 flex-wrap">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-indigo-50 dark:bg-indigo-900/40 flex-shrink-0 flex items-center justify-center shadow-sm">
              {store.storeLogoURL || store.photoURL ? (
                <AvatarDisplay
                  cropData={{
                    url: store.storeLogoURL ?? store.photoURL ?? "",
                    position: { x: 50, y: 50 },
                    zoom: 1,
                  }}
                  size="xl"
                  alt={store.storeName}
                />
              ) : (
                <Store className="w-9 h-9 text-indigo-400" />
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pt-10 sm:pt-12">
              <Heading
                level={1}
                className="text-xl sm:text-2xl leading-tight truncate"
              >
                {store.storeName || store.displayName}
              </Heading>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                {store.storeCategory && (
                  <Caption className="capitalize">
                    {store.storeCategory}
                  </Caption>
                )}
                {typeof store.averageRating === "number" &&
                  store.averageRating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <Caption>{store.averageRating.toFixed(1)}</Caption>
                      {typeof store.totalReviews === "number" && (
                        <Caption>
                          ({t("reviewCount", { count: store.totalReviews })})
                        </Caption>
                      )}
                    </span>
                  )}
                {typeof store.totalProducts === "number" && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    <Caption>
                      {t("productCount", { count: store.totalProducts })}
                    </Caption>
                  </span>
                )}
              </div>

              {store.storeDescription && (
                <Text
                  variant="secondary"
                  size="sm"
                  className="mt-2 line-clamp-2"
                >
                  {store.storeDescription}
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
