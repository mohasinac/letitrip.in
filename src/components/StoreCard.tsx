"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import type { StoreListItem } from "@mohasinac/appkit/features/stores";
import { Heading, Span, Text } from "@mohasinac/appkit/ui";
import { Button, MediaImage } from "@/components";

export type { StoreListItem };

export interface StoreCardProps {
  store: StoreListItem;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  labels?: { products?: string; sold?: string; reviews?: string };
  className?: string;
}

/**
 * Locale-aware store card with optional selection.
 */
export function StoreCard({
  store,
  selectable,
  selected,
  onSelect,
  labels = {},
  className = "",
}: StoreCardProps) {
  const href = ROUTES.PUBLIC.STORE_DETAIL(store.storeSlug);
  const { dimensions } = THEME_CONSTANTS.card;

  return (
    <div
      className={`relative flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${dimensions.minW} ${dimensions.minH} ${className}`}
    >
      {selectable && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={selected ? "Deselect store" : "Select store"}
          onClick={(e) => {
            e.preventDefault();
            onSelect?.(store.id, !selected);
          }}
          className={`absolute top-2 left-2 z-10 h-5 w-5 rounded border-2 ${selected ? "bg-primary border-primary" : "bg-white border-gray-300"} flex items-center justify-center`}
        >
          {selected && (
            <Span className="text-white text-xs leading-none">✓</Span>
          )}
        </Button>
      )}

      <Link href={href} className="block">
        {store.storeBannerURL ? (
          <div
            className={`overflow-hidden bg-gray-100 ${dimensions.heroMinH} ${dimensions.heroMaxH}`}
          >
            <MediaImage
              src={store.storeBannerURL}
              alt={`${store.storeName} banner`}
              size="banner"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 ${dimensions.heroMinH} ${dimensions.heroMaxH}`}
          />
        )}

        <div className="px-4 pb-4 flex-1 flex flex-col justify-between">
          <div className="-mt-6 mb-3">
            {store.storeLogoURL ? (
              <MediaImage
                src={store.storeLogoURL}
                alt={store.storeName}
                size="avatar"
                className="h-12 w-12 rounded-lg border-2 border-white object-cover shadow-sm"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg border-2 border-white bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 font-bold text-lg shadow-sm">
                {store.storeName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <Heading
            level={3}
            className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate"
          >
            {store.storeName}
          </Heading>
          {store.storeDescription && (
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
              {store.storeDescription}
            </Text>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {store.totalProducts != null && store.totalProducts > 0 && (
              <Span>
                {store.totalProducts} {labels.products ?? "products"}
              </Span>
            )}
            {store.itemsSold != null && store.itemsSold > 0 && (
              <Span>
                {store.itemsSold} {labels.sold ?? "sold"}
              </Span>
            )}
            {store.averageRating != null && store.averageRating > 0 && (
              <Span>★ {store.averageRating.toFixed(1)}</Span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
