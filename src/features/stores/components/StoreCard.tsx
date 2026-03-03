"use client";

import { Store, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import {
  Card,
  Badge,
  Heading,
  Text,
  Caption,
  AvatarDisplay,
  TextLink,
} from "@/components";
import type { StoreListItem } from "../types";

const { spacing, flex, overflow } = THEME_CONSTANTS;

interface StoreCardProps {
  store: StoreListItem;
}

export function StoreCard({ store }: StoreCardProps) {
  const t = useTranslations("storesPage");

  const href = ROUTES.PUBLIC.STORE_DETAIL(store.storeSlug);

  return (
    <TextLink href={href} className="group block focus:outline-none">
      <Card
        className={`overflow-hidden transition-shadow duration-200 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-indigo-500 h-full flex flex-col`}
      >
        {/* Banner */}
        <div
          className="h-24 sm:h-28 w-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 relative flex-shrink-0"
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

        {/* Content */}
        <div className={`${spacing.padding.md} flex flex-col gap-2 flex-1`}>
          {/* Avatar + name row */}
          <div className="flex items-start gap-3 -mt-10">
            <div
              className={`w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 ${overflow.hidden} bg-indigo-50 dark:bg-indigo-900/40 ${flex.noShrink} ${flex.center}`}
            >
              {store.storeLogoURL || store.photoURL ? (
                <AvatarDisplay
                  cropData={{
                    url: store.storeLogoURL ?? store.photoURL ?? "",
                    position: { x: 50, y: 50 },
                    zoom: 1,
                  }}
                  size="lg"
                  alt={store.storeName}
                />
              ) : (
                <Store className="w-7 h-7 text-indigo-400" />
              )}
            </div>
            <div className={`pt-10 ${flex.growMin}`}>
              <Heading
                level={3}
                className="truncate text-sm sm:text-base leading-tight"
              >
                {store.storeName || store.displayName}
              </Heading>
            </div>
          </div>

          {/* Description */}
          {store.storeDescription && (
            <Text variant="secondary" size="sm" className="line-clamp-2">
              {store.storeDescription}
            </Text>
          )}

          {/* Category badge */}
          {store.storeCategory && (
            <Badge
              variant="secondary"
              className="self-start text-xs capitalize"
            >
              {store.storeCategory}
            </Badge>
          )}

          {/* Stats */}
          <div className="mt-auto pt-2 flex items-center gap-3">
            {typeof store.averageRating === "number" &&
              store.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <Caption>{store.averageRating.toFixed(1)}</Caption>
                </div>
              )}
            {typeof store.totalProducts === "number" && (
              <Caption>
                {t("productCount", { count: store.totalProducts })}
              </Caption>
            )}
          </div>
        </div>
      </Card>
    </TextLink>
  );
}
