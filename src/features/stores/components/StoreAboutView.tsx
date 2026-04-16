"use client";
import { Spinner } from "@mohasinac/appkit/ui";
import { useTranslations } from "next-intl";
import { StoreAboutView as AppkitStoreAboutView } from "@mohasinac/appkit/features/stores";
import { EmptyState, TextLink } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@mohasinac/appkit/utils";


import { useStoreBySlug } from "@mohasinac/appkit/features/stores";

interface StoreAboutViewProps {
  storeSlug: string;
}

export function StoreAboutView({ storeSlug }: StoreAboutViewProps) {
  const t = useTranslations("storePage");
  const { store, isLoading, error } = useStoreBySlug(storeSlug);

  if (isLoading) {
    return (
      <div
        className={`${THEME_CONSTANTS.flex.hCenter} ${THEME_CONSTANTS.page.empty}`}
      >
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
    <AppkitStoreAboutView
      store={{
        id: store.id,
        storeSlug: store.storeSlug ?? storeSlug,
        ownerId: store.ownerId ?? "",
        storeName: store.storeName,
        storeDescription: store.storeDescription,
        storeCategory: store.storeCategory,
        storeLogoURL: store.storeLogoURL,
        storeBannerURL: store.storeBannerURL,
        status: store.status ?? "active",
        isPublic: store.isPublic ?? true,
        totalProducts: store.totalProducts,
        itemsSold: store.itemsSold,
        totalReviews: store.totalReviews,
        averageRating: store.averageRating,
        createdAt: store.createdAt,
        bio: store.bio,
        location: store.location,
        website: store.website,
        socialLinks: store.socialLinks,
        returnPolicy: store.returnPolicy,
        shippingPolicy: store.shippingPolicy,
        isVacationMode: store.isVacationMode,
        vacationMessage: store.vacationMessage,
      }}
      labels={{
        aboutTitle: t("about.bio"),
        locationLabel: t("about.location"),
        websiteLabel: t("about.website"),
        memberSinceLabel: t("about.memberSince"),
      }}
      renderSocialLinks={(links) =>
        links && Object.values(links).some(Boolean) ? (
          <div className="flex gap-2 flex-wrap">
            {links.twitter && <TextLink href={links.twitter}>Twitter</TextLink>}
            {links.instagram && (
              <TextLink href={links.instagram}>Instagram</TextLink>
            )}
            {links.facebook && (
              <TextLink href={links.facebook}>Facebook</TextLink>
            )}
            {links.linkedin && (
              <TextLink href={links.linkedin}>LinkedIn</TextLink>
            )}
          </div>
        ) : null
      }
    />
  );
}

