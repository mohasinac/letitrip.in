"use client";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import type { StoreListItem } from "@mohasinac/feat-stores";

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

  return (
    <div
      className={`relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {selectable && (
        <button
          type="button"
          aria-label={selected ? "Deselect store" : "Select store"}
          onClick={(e) => {
            e.preventDefault();
            onSelect?.(store.id, !selected);
          }}
          className={`absolute top-2 left-2 z-10 h-5 w-5 rounded border-2 ${selected ? "bg-primary border-primary" : "bg-white border-gray-300"} flex items-center justify-center`}
        >
          {selected && (
            <span className="text-white text-xs leading-none">✓</span>
          )}
        </button>
      )}

      <Link href={href} className="block">
        {store.storeBannerURL ? (
          <div className="h-24 overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={store.storeBannerURL}
              alt={`${store.storeName} banner`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20" />
        )}

        <div className="px-4 pb-4">
          <div className="-mt-6 mb-3">
            {store.storeLogoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.storeLogoURL}
                alt={store.storeName}
                className="h-12 w-12 rounded-lg border-2 border-white object-cover shadow-sm"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg border-2 border-white bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 font-bold text-lg shadow-sm">
                {store.storeName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
            {store.storeName}
          </h3>
          {store.storeDescription && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
              {store.storeDescription}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {store.totalProducts != null && (
              <span>
                {store.totalProducts} {labels.products ?? "products"}
              </span>
            )}
            {store.itemsSold != null && (
              <span>
                {store.itemsSold} {labels.sold ?? "sold"}
              </span>
            )}
            {store.averageRating != null && (
              <span>★ {store.averageRating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
