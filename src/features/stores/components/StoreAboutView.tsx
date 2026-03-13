"use client";

import { Globe, MapPin, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  EmptyState,
  Spinner,
  Heading,
  Text,
  Card,
  TextLink,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { useStoreBySlug } from "../hooks";

const { spacing, themed, flex, page } = THEME_CONSTANTS;

interface StoreAboutViewProps {
  storeSlug: string;
}

export function StoreAboutView({ storeSlug }: StoreAboutViewProps) {
  const t = useTranslations("storePage");
  const { data: store, isLoading, error } = useStoreBySlug(storeSlug);

  if (isLoading) {
    return (
      <div className={`${flex.hCenter} ${page.empty}`}>
        <Spinner />
      </div>
    );
  }

  if (!!error || !store) {
    return (
      <EmptyState
        title={t("error.title")}
        description={t("error.description")}
      />
    );
  }

  return (
    <div className={`${spacing.stack} max-w-4xl mx-auto`}>
      <Card className={`p-6 ${spacing.stack}`}>
        {/* Store name + description */}
        <div>
          <Heading level={2}>{store.storeName || store.displayName}</Heading>
          {store.storeDescription && (
            <Text variant="secondary" className="mt-2">
              {store.storeDescription}
            </Text>
          )}
        </div>

        {/* Details list */}
        <dl className="divide-y divide-zinc-200 dark:divide-slate-700 text-sm">
          {store.storeCategory && (
            <div className="py-3 flex items-center gap-3">
              <Store className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <dt className={`${themed.textSecondary} w-28 flex-shrink-0`}>
                {t("about.category")}
              </dt>
              <dd className={`${themed.textPrimary} capitalize`}>
                {store.storeCategory}
              </dd>
            </div>
          )}

          {store.bio && (
            <div className="py-3">
              <Text variant="secondary" size="sm">
                {store.bio}
              </Text>
            </div>
          )}

          {store.location && (
            <div className="py-3 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <dt className={`${themed.textSecondary} w-28 flex-shrink-0`}>
                {t("about.location")}
              </dt>
              <dd className={themed.textPrimary}>{store.location}</dd>
            </div>
          )}

          {store.website && (
            <div className="py-3 flex items-center gap-3">
              <Globe className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <dt className={`${themed.textSecondary} w-28 flex-shrink-0`}>
                {t("about.website")}
              </dt>
              <dd>
                <TextLink href={store.website} className="break-all">
                  {store.website}
                </TextLink>
              </dd>
            </div>
          )}

          {store.createdAt && (
            <div className="py-3 flex items-center gap-3">
              <dt className={`${themed.textSecondary} w-28 flex-shrink-0 pl-7`}>
                {t("about.memberSince")}
              </dt>
              <dd className={themed.textPrimary}>
                {formatDate(store.createdAt)}
              </dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  );
}
