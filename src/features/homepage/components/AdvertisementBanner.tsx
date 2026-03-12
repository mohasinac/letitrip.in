"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { useHomepageSections } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { Button, Heading, MediaImage, Section, Text } from "@/components";
import type { BannerSectionConfig } from "@/db/schema";

const { position } = THEME_CONSTANTS;

interface AdvertisementBannerProps {
  /** When true: renders a compact single-row pill strip (h-32) */
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

  if (isLoading) {
    return (
      <Section className={`p-8 ${THEME_CONSTANTS.sectionBg.warm}`}>
        <div className="w-full">
          <div
            className={`h-72 ${THEME_CONSTANTS.themed.bgTertiary} rounded-2xl animate-pulse`}
          />
        </div>
      </Section>
    );
  }

  const bannerSection = data?.[0];
  const banner = bannerSection?.config as BannerSectionConfig | undefined;
  const hasCmsData = bannerSection && banner?.content;
  const hasImage = hasCmsData && banner?.backgroundImage;

  const title = hasCmsData ? banner!.content!.title : t("bannerFallbackTitle");
  const subtitle = hasCmsData
    ? (banner!.content!.subtitle ?? "")
    : t("bannerFallbackSubtitle");
  const ctaText = hasCmsData
    ? (banner?.buttons?.[0]?.text ?? t("bannerFallbackCta"))
    : t("bannerFallbackCta");
  const ctaHref = hasCmsData
    ? (banner?.buttons?.[0]?.link ?? ROUTES.PUBLIC.PRODUCTS)
    : ROUTES.PUBLIC.PRODUCTS;

  // ─── Split editorial layout (when CMS provides an image) ────────────────────
  if (hasImage) {
    return (
      <Section className={`p-8 ${THEME_CONSTANTS.sectionBg.warm}`}>
        <div className="w-full">
          <div
            className={`relative overflow-hidden rounded-2xl bg-zinc-900 shadow-xl`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[300px] md:min-h-[360px]">
              {/* Left: editorial image */}
              <div className="relative aspect-[4/3] md:aspect-auto order-last md:order-first min-h-0 md:min-h-[360px]">
                <MediaImage
                  src={banner!.backgroundImage!}
                  alt={title}
                  size="banner"
                  priority
                />
                {/* subtle inner shadow to blend with the dark right panel */}
                <div className="hidden md:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-zinc-900/60 pointer-events-none" />
              </div>

              {/* Right: content */}
              <div className="relative flex flex-col justify-center px-8 py-10 md:px-12 md:py-14">
                {/* Decorative dots */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:12px_12px]"
                  aria-hidden
                />
                {/* Tag pill */}
                <div className="inline-flex items-center gap-1.5 self-start bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("bannerTag")}
                </div>

                <Heading
                  level={2}
                  className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight"
                >
                  {title}
                </Heading>

                {subtitle && (
                  <Text className="text-white/75 text-base md:text-lg mb-8 leading-relaxed">
                    {subtitle}
                  </Text>
                )}

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push(ctaHref)}
                  className="self-start bg-white text-zinc-900 hover:bg-zinc-100 font-semibold shadow-lg gap-2"
                >
                  {ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  // ─── Full-width gradient layout (fallback / no image) ────────────────────────
  return (
    <Section className={`p-8 ${THEME_CONSTANTS.sectionBg.warm}`}>
      <div className="w-full">
        <div
          className={`relative overflow-hidden rounded-2xl ${compact ? "h-32 flex items-center" : "min-h-[240px] md:min-h-[300px]"} flex items-center`}
          style={
            hasCmsData && banner?.backgroundColor
              ? { backgroundColor: banner.backgroundColor }
              : undefined
          }
        >
          {/* Gradient background */}
          {(!hasCmsData || !banner?.backgroundColor) && (
            <div
              className={`${position.fill} bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600`}
              aria-hidden
            />
          )}

          {/* Decorative circle blobs — animated mesh (LX-6) */}
          <div className={`${position.fill} overflow-hidden`} aria-hidden>
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-16 right-0 w-80 h-80 rounded-full bg-cobalt/20 blur-3xl animate-pulse-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-fuchsia-400/10 blur-3xl animate-pulse-slow" />
            {/* Decorative rings (LX-6) */}
            <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full border border-white/[0.06]" />
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full border border-white/[0.04]" />
          </div>

          {/* Content */}
          {compact ? (
            <div className="relative z-10 flex items-center justify-between w-full px-6 py-4 gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white/80" />
                <span className="text-white font-semibold text-sm">
                  {title}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(ctaHref)}
                className="bg-white text-indigo-700 hover:bg-zinc-50 font-semibold hover:shadow-glow gap-1.5 flex-shrink-0"
              >
                {ctaText}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 md:py-16 text-center">
              {/* Tag pill */}
              <div className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {t("bannerTag")}
              </div>

              <Heading
                level={2}
                className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight"
              >
                {title}
              </Heading>

              <Text className="text-white/80 text-base md:text-xl mb-10 max-w-2xl mx-auto">
                {subtitle}
              </Text>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push(ctaHref)}
                  className="bg-white text-indigo-700 hover:bg-zinc-50 font-semibold shadow-2xl hover:shadow-glow gap-2"
                >
                  {ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(ROUTES.PUBLIC.AUCTIONS)}
                  className="border-white/40 text-white hover:bg-white/10 font-medium backdrop-blur-sm"
                >
                  {t("bannerSecondaryCta")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
