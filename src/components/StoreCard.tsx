"use client";

import { Star, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import {
  Card,
  Heading,
  Text,
  Caption,
  AvatarDisplay,
  Span,
  TextLink,
} from "@/components";
import type { StoreListItem } from "@/types/stores";

const { flex, themed } = THEME_CONSTANTS;

interface StoreCardProps {
  store: StoreListItem;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export function StoreCard({
  store,
  selectable = false,
  selected = false,
  onSelect,
}: StoreCardProps) {
  const t = useTranslations("storesPage");

  const href = ROUTES.PUBLIC.STORE_DETAIL(store.storeSlug);
  const name = store.storeName || store.displayName || "";

  return (
    <TextLink href={href} className="group block focus:outline-none">
      <Card
        className={`overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-200 group-focus-visible:ring-2 group-focus-visible:ring-indigo-500${
          selected ? " ring-2 ring-indigo-500" : ""
        }`}
      >
        {/* ── Banner ── */}
        <div className="relative aspect-[2/1] overflow-hidden bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-400 flex-shrink-0">
          {store.storeBannerURL && (
            <img
              src={store.storeBannerURL}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* bottom gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Checkbox — top left */}
          {selectable && (
            <div
              className="absolute top-2 left-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                aria-label={`Select ${name}`}
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.(store.ownerId, e.target.checked);
                }}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer bg-white/80"
              />
            </div>
          )}

          {/* Category badge — top right */}
          {store.storeCategory && (
            <div className="absolute top-2 right-2 z-10">
              <Span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-gray-700 dark:bg-black/60 dark:text-gray-200">
                {store.storeCategory}
              </Span>
            </div>
          )}

          {/* Avatar — centred, overlapping banner bottom */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
            <div className="w-14 h-14 rounded-full border-[3px] border-white dark:border-gray-900 overflow-hidden shadow-md">
              {(store.storeLogoURL ?? store.photoURL) ? (
                <AvatarDisplay
                  cropData={{
                    url: (store.storeLogoURL ?? store.photoURL)!,
                    position: { x: 50, y: 50 },
                    zoom: 1,
                  }}
                  size="lg"
                  alt={name}
                />
              ) : (
                <div
                  className={`${flex.center} w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600`}
                >
                  <Span className="text-xl font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </Span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col flex-1 items-center text-center px-3 pt-9 pb-4 gap-1">
          {/* Name */}
          <Heading
            level={3}
            className={`text-sm font-semibold ${themed.textPrimary} line-clamp-1 w-full`}
          >
            {name}
          </Heading>

          {/* Verified badge */}
          <Span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wide">
            {t("sellerBadge")}
          </Span>

          {/* Short description */}
          {store.storeDescription && (
            <Text variant="secondary" size="sm" className="line-clamp-2 mt-0.5">
              {store.storeDescription}
            </Text>
          )}

          {/* Stats row */}
          <div
            className={`${flex.rowCenter} gap-3 mt-auto pt-2 text-xs ${themed.textSecondary}`}
          >
            <div className={`${flex.rowCenter} gap-1`}>
              <ShoppingBag
                className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0"
                aria-hidden="true"
              />
              <Span>
                {t("productsCount", { count: store.totalProducts ?? 0 })}
              </Span>
            </div>
            {typeof store.averageRating === "number" &&
              store.averageRating > 0 && (
                <div className={`${flex.rowCenter} gap-0.5`}>
                  <Star
                    className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Caption className="font-medium">
                    {store.averageRating.toFixed(1)}
                  </Caption>
                </div>
              )}
          </div>
        </div>
      </Card>
    </TextLink>
  );
}
