"use client";

import { Store, Star, Package, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import {
  AvatarDisplay,
  Button,
  Caption,
  Heading,
  Skeleton,
  Span,
  Text,
} from "@/components";
import { useStoreBySlug } from "../hooks";

const { themed, flex, overflow, page } = THEME_CONSTANTS;

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

  return (
    <div className="w-full">
      {/* Banner */}
      <div
        className="h-36 sm:h-48 w-full bg-gradient-to-br from-primary/10 to-purple-100 dark:from-primary/20 dark:to-purple-900/30"
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
        <div className={`${page.container.wide} pb-4 sm:pb-6`}>
          <div className="flex items-end gap-4 -mt-8 sm:-mt-10 flex-wrap">
            {/* Avatar */}
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-slate-900 ${overflow.hidden} bg-primary/5 dark:bg-primary/10 ${flex.noShrink} ${flex.center} shadow-sm`}
            >
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
                <Store className="w-9 h-9 text-primary/60" />
              )}
            </div>

            {/* Name + meta */}
            <div className={`${flex.growMin} pt-10 sm:pt-12`}>
              <div className="flex items-center gap-3 flex-wrap">
                <Heading
                  level={1}
                  className="text-xl sm:text-2xl leading-tight truncate"
                >
                  {store.storeName || store.displayName}
                </Heading>

                {/* Ratings badge */}
                {typeof store.averageRating === "number" &&
                  store.averageRating > 0 && (
                    <Span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <Caption className="font-medium text-yellow-700 dark:text-yellow-400">
                        {store.averageRating.toFixed(1)}
                      </Caption>
                    </Span>
                  )}

                {/* Featured star */}
                <Star
                  className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0"
                  aria-label={t("featured")}
                />

                {/* Wishlist heart */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label={t("addToWishlist")}
                >
                  <Heart className="w-5 h-5 text-zinc-400 hover:text-red-500 transition-colors" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                {store.storeCategory && (
                  <Caption className="capitalize">
                    {store.storeCategory}
                  </Caption>
                )}
                {typeof store.totalProducts === "number" && (
                  <Span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-zinc-400" />
                    <Caption>
                      {t("productCount", { count: store.totalProducts })}
                    </Caption>
                  </Span>
                )}
                {typeof store.totalReviews === "number" &&
                  store.totalReviews > 0 && (
                    <Caption>
                      {t("reviewCount", { count: store.totalReviews })}
                    </Caption>
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
