"use client";

import { useRouter } from "next/navigation";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";
import { apiClient } from "@/lib/api-client";

interface BannerData {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function AdvertisementBanner() {
  const router = useRouter();
  const { data, isLoading } = useApiQuery<BannerData[]>({
    queryKey: ["homepage-sections", "ad-banner"],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST}?type=advertisement&enabled=true&limit=1`,
      ),
  });

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.warm}`}
      >
        <div className="w-full">
          <div
            className={`h-64 ${THEME_CONSTANTS.themed.bgTertiary} rounded-2xl animate-pulse`}
          />
        </div>
      </section>
    );
  }

  const banner = data?.[0];

  if (!banner) {
    return null;
  }

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.sectionBg.warm}`}
    >
      <div className="w-full">
        <div
          className={`relative overflow-hidden ${THEME_CONSTANTS.borderRadius["2xl"]} min-h-[280px] flex items-center justify-center text-center bg-cover bg-center`}
          style={{
            backgroundColor: banner.backgroundColor || "#1a1a1a",
            backgroundImage: banner.backgroundImage
              ? `url(${banner.backgroundImage})`
              : undefined,
          }}
        >
          {/* Overlay for better text readability */}
          {banner.backgroundImage && (
            <div className="absolute inset-0 bg-black/40" />
          )}

          {/* Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
            <h2
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4`}
              style={{ color: banner.textColor || "#ffffff" }}
            >
              {banner.title}
            </h2>

            {banner.subtitle && (
              <p
                className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90"
                style={{ color: banner.textColor || "#ffffff" }}
              >
                {banner.subtitle}
              </p>
            )}

            {banner.ctaText && banner.ctaLink && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push(banner.ctaLink!)}
                className="shadow-2xl hover:shadow-3xl transition-shadow"
              >
                {banner.ctaText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
