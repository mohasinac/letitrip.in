"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useHomepageSections } from "@/hooks";
import { ROUTES } from "@/constants";
import type { BannerSectionConfig } from "@/db/schema";
import { AdvertisementBanner as AppkitAdvertisementBanner } from "@mohasinac/appkit/features/homepage";

interface AdvertisementBannerProps {
  compact?: boolean;
}

export function AdvertisementBanner({
  compact = false,
}: AdvertisementBannerProps) {
  const t = useTranslations("homepage");
  const router = useRouter();
  const { data, isLoading } = useHomepageSections(
    "type=advertisement&enabled=true&limit=1",
  );

  const bannerSection = data?.[0];
  const banner = bannerSection?.config as BannerSectionConfig | undefined;
  const hasCmsData = bannerSection && banner?.content;

  return (
    <AppkitAdvertisementBanner
      title={hasCmsData ? banner!.content!.title : t("bannerFallbackTitle")}
      subtitle={
        hasCmsData
          ? (banner!.content!.subtitle ?? "")
          : t("bannerFallbackSubtitle")
      }
      ctaLabel={
        hasCmsData
          ? (banner?.buttons?.[0]?.text ?? t("bannerFallbackCta"))
          : t("bannerFallbackCta")
      }
      onCtaClick={() => {
        const href = hasCmsData
          ? (banner?.buttons?.[0]?.link ?? ROUTES.PUBLIC.PRODUCTS)
          : ROUTES.PUBLIC.PRODUCTS;
        router.push(href);
      }}
      backgroundImage={hasCmsData ? banner?.backgroundImage : undefined}
      tagLabel={banner?.content?.title ? t("bannerTag") : undefined}
      isLoading={isLoading}
      compact={compact}
    />
  );
}
