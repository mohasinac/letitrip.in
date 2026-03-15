import React from "react";
import type { StoreDetail } from "../types";

interface StoreHeaderProps {
  store: StoreDetail;
  labels?: {
    products?: string;
    reviews?: string;
    sold?: string;
    vacationMode?: string;
    follow?: string;
  };
  onFollow?: (storeSlug: string) => void;
  className?: string;
}

export function StoreHeader({
  store,
  labels = {},
  onFollow,
  className = "",
}: StoreHeaderProps) {
  return (
    <section className={`bg-white border-b border-gray-200 ${className}`}>
      {store.storeBannerURL && (
        <div className="h-40 md:h-56 overflow-hidden bg-gray-100">
          <img
            src={store.storeBannerURL}
            alt={`${store.storeName} banner`}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-end gap-4">
          {store.storeLogoURL ? (
            <img
              src={store.storeLogoURL}
              alt={store.storeName}
              className="-mt-8 h-16 w-16 rounded-xl border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="-mt-8 h-16 w-16 rounded-xl border-2 border-white bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl shadow-sm">
              {store.storeName[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {store.storeName}
            </h1>
            {store.storeDescription && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                {store.storeDescription}
              </p>
            )}
          </div>
          {onFollow && (
            <button
              type="button"
              onClick={() => onFollow(store.storeSlug)}
              className="shrink-0 rounded-lg border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors"
            >
              {labels.follow ?? "Follow"}
            </button>
          )}
        </div>

        {store.isVacationMode && (
          <p className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-700">
            {store.vacationMessage ??
              labels.vacationMode ??
              "Store is on vacation mode"}
          </p>
        )}

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
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
            <span>
              ★ {store.averageRating.toFixed(1)} ({store.totalReviews}{" "}
              {labels.reviews ?? "reviews"})
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
