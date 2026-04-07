"use client";

import { StoreCard as PkgStoreCard } from "@mohasinac/feat-stores";
import type { StoreCardProps as PkgStoreCardProps } from "@mohasinac/feat-stores";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/constants";
import type { StoreListItem } from "@mohasinac/feat-stores";

export type { StoreListItem };

type StoreCardProps = Omit<PkgStoreCardProps, "href" | "LinkComponent">;

/**
 * Locale-aware wrapper around @mohasinac/feat-stores's StoreCard.
 * Pre-configures the href from ROUTES and uses next-intl's Link.
 */
export function StoreCard({ store, ...props }: StoreCardProps) {
  return (
    <PkgStoreCard
      store={store}
      href={ROUTES.PUBLIC.STORE_DETAIL(store.storeSlug)}
      LinkComponent={Link}
      {...props}
    />
  );
}
