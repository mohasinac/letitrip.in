"use client";

import { useRouter } from "@/i18n/navigation";
import { useHomepageSections } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { Button, Heading, Section, Text } from "@/components";
import type { BannerSectionConfig } from "@/db/schema";

const { flex, position } = THEME_CONSTANTS;

export function AdvertisementBanner() {
  const router = useRouter();
  const { data, isLoading } = useHomepageSections(
    "type=advertisement&enabled=true&limit=1",
  );

  if (isLoading) {
    return (
      <Section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.warm}`}
      >
        <div className="w-full">
          <div
            className={`h-64 ${THEME_CONSTANTS.themed.bgTertiary} rounded-2xl animate-pulse`}
          />
        </div>
      </Section>
    );
  }

  const bannerSection = data?.[0];
  const banner = bannerSection?.config as BannerSectionConfig | undefined;

  // Fallback banner when no CMS data is configured
  const fallback = !bannerSection || !banner || !banner.content;

  return (
    <Section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.warm}`}
    >
      <div className="w-full">
        <div
          className={`relative overflow-hidden ${THEME_CONSTANTS.borderRadius["2xl"]} min-h-[220px] md:min-h-[280px] ${flex.center} text-center`}
          style={
            fallback
              ? undefined
              : {
                  backgroundColor: banner!.backgroundColor || "#1a1a1a",
                  backgroundImage: banner!.backgroundImage
                    ? `url(${banner!.backgroundImage})`
                    : undefined,
                }
          }
        >
          {/* Fallback gradient background */}
          {fallback && (
            <div
              className={`${position.fill} bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600`}
            />
          )}

          {/* CMS overlay for better readability */}
          {!fallback && banner!.backgroundImage && (
            <div className={`${position.fill} bg-black/40`} />
          )}

          {/* Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 md:py-14">
            <Heading
              level={2}
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 text-white drop-shadow-lg"
            >
              {fallback ? "Discover Amazing Deals" : banner!.content!.title}
            </Heading>

            <Text className="text-base md:text-xl mb-8 text-white/90">
              {fallback
                ? "Shop top products, bid on exclusive auctions, and find the best prices — all in one place."
                : banner?.content?.subtitle}
            </Text>

            <Button
              variant="secondary"
              size="lg"
              onClick={() =>
                router.push(
                  fallback
                    ? ROUTES.PUBLIC.PRODUCTS
                    : (banner?.buttons?.[0]?.link ?? ROUTES.PUBLIC.PRODUCTS),
                )
              }
              className="bg-white text-indigo-700 hover:bg-gray-50 font-semibold shadow-2xl"
            >
              {fallback
                ? "Shop Now"
                : (banner?.buttons?.[0]?.text ?? "Learn More")}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
