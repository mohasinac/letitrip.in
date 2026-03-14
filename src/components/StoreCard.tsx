"use client";

import { Star, ShoppingBag, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import {
  Card,
  Heading,
  MediaImage,
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
        className={`overflow-hidden h-full flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-primary-500${
          selected ? " ring-2 ring-primary-500" : ""
        }`}
      >
        {/* ── Banner ── */}
        <div className="relative aspect-[2/1] overflow-hidden bg-gradient-to-br from-primary-400 via-cobalt-500 to-secondary-400 flex-shrink-0">
          {store.storeBannerURL && (
            <MediaImage src={store.storeBannerURL} alt="" size="card" />
          )}

          {/* bottom gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Checkbox — top left */}
          {selectable && (
            <div
              className="absolute top-2 left-2 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect?.(store.ownerId, !selected);
              }}
            >
              <div
                className={`w-6 h-6 rounded-md shadow-md ${flex.center} relative border-2 transition-colors cursor-pointer ${
                  selected
                    ? "bg-primary border-primary"
                    : "bg-white/95 dark:bg-slate-800/95 border-zinc-500 dark:border-slate-400 hover:border-primary"
                }`}
                aria-label={selected ? `Deselect ${name}` : `Select ${name}`}
              >
                {selected && (
                  <svg
                    className="absolute inset-0 m-auto w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* Category badge — top right */}
          {store.storeCategory && (
            <div className="absolute top-2 right-2 z-10">
              <Span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-zinc-700 dark:bg-black/60 dark:text-zinc-200">
                {store.storeCategory}
              </Span>
            </div>
          )}

          {/* Visit Store → overlay — slides up from banner bottom on group hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-10 pt-16 z-10">
            <Span className="inline-flex items-center gap-1 text-white text-xs font-semibold">
              {t("visitStore")} &rarr;
            </Span>
          </div>

          {/* Avatar — centred, overlapping banner bottom */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-[3px] border-white dark:border-slate-900 overflow-hidden shadow-md">
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
                    className={`${flex.center} w-full h-full bg-gradient-to-br from-primary-500 to-cobalt-600`}
                  >
                    <Span className="text-xl font-bold text-white">
                      {name.charAt(0).toUpperCase()}
                    </Span>
                  </div>
                )}
              </div>
              {/* Verified badge on avatar corner */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 z-10 w-5 h-5 rounded-full bg-white dark:bg-slate-900 ${THEME_CONSTANTS.flex.center} shadow-sm`}
              >
                <BadgeCheck
                  className="w-3.5 h-3.5 text-cobalt-500"
                  aria-hidden="true"
                />
              </div>
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

          {/* Short description */}
          {store.storeDescription && (
            <Text variant="secondary" size="sm" className="line-clamp-2 mt-0.5">
              {store.storeDescription}
            </Text>
          )}

          {/* Stats row */}
          <div
            className={`${flex.rowCenter} gap-3 pt-2 text-xs ${themed.textSecondary}`}
          >
            <div className={`${flex.rowCenter} gap-1`}>
              <ShoppingBag
                className="w-3.5 h-3.5 text-primary-500 flex-shrink-0"
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
