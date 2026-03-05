"use client";

import { Star, Package, MessageSquare } from "lucide-react";
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
import type { StoreListItem } from "../types";

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

  return (
    <TextLink href={href} className="group block focus:outline-none">
      <Card
        className={`overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200 group-focus-visible:ring-2 group-focus-visible:ring-indigo-500${
          selected ? " ring-2 ring-indigo-500" : ""
        }`}
      >
        {/* ── Banner area ── */}
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0">
          {store.storeBannerURL && (
            <img
              src={store.storeBannerURL}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Checkbox — top left */}
          {selectable && (
            <div
              className="absolute top-2 left-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                aria-label={`Select ${store.storeName}`}
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.(store.uid, e.target.checked);
                }}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer bg-white/80"
              />
            </div>
          )}

          {/* Avatar — overlapping banner bottom */}
          <div className="absolute -bottom-8 left-4">
            <div className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800 shadow">
              {store.storeLogoURL ?? store.photoURL ? (
                <AvatarDisplay
                  cropData={{
                    url: (store.storeLogoURL ?? store.photoURL)!,
                    position: { x: 50, y: 50 },
                    zoom: 1,
                  }}
                  size="lg"
                  alt={store.storeName}
                />
              ) : (
                <div className={`${flex.center} w-full h-full bg-indigo-100 dark:bg-indigo-900/40`}>
                  <Span className="text-2xl font-bold text-indigo-500">
                    {(store.storeName || store.displayName).charAt(0).toUpperCase()}
                  </Span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col flex-1 px-4 pt-10 pb-4 gap-1">
          {/* Name + rating */}
          <div className={`${flex.between} gap-2`}>
            <Heading
              level={3}
              className={`text-sm sm:text-base font-semibold ${themed.textPrimary} truncate`}
            >
              {store.storeName || store.displayName}
            </Heading>

            {typeof store.averageRating === "number" &&
              store.averageRating > 0 && (
                <div className={`${flex.rowCenter} gap-0.5 flex-shrink-0`}>
                  <Star
                    className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                    aria-hidden="true"
                  />
                  <Caption>{store.averageRating.toFixed(1)}</Caption>
                </div>
              )}
          </div>

          {/* Short description */}
          {store.storeDescription && (
            <Text variant="secondary" size="sm" className="line-clamp-2">
              {store.storeDescription}
            </Text>
          )}

          {/* Stats */}
          <div
            className={`${flex.rowCenter} gap-3 mt-auto pt-2 text-xs ${themed.textSecondary} border-t ${themed.border}`}
          >
            {typeof store.totalReviews === "number" && store.totalReviews > 0 && (
              <div className={`${flex.rowCenter} gap-1`}>
                <MessageSquare
                  className="w-3.5 h-3.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <Span>{t("itemsSold", { count: store.totalReviews })}</Span>
              </div>
            )}
            {typeof store.totalProducts === "number" && (
              <div className={`${flex.rowCenter} gap-1`}>
                <Package
                  className="w-3.5 h-3.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <Span>{t("availableProducts")}: {store.totalProducts}</Span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </TextLink>
  );
}
