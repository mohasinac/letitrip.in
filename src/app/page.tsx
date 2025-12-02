"use client";

import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import { RecentlyViewedWidget } from "@/components/products/RecentlyViewedWidget";
import { WelcomeHero } from "@/components/homepage/WelcomeHero";
import { ValueProposition } from "@/components/homepage/ValueProposition";
import { HeroSection } from "@/components/homepage/HeroSection";
import { DynamicSection } from "@/components/homepage/DynamicSection";
import { StaticSections } from "@/components/homepage/StaticSections";
import dynamic from "next/dynamic";
import { HomepageSettings, DEFAULT_SECTION_ORDER } from "@/types/homepage";

const FeaturedCategories = dynamic(
  () => import("@/components/layout/FeaturedCategories"),
  {
    ssr: true,
    loading: () => (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Shop by Category
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-24 md:h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Fetch homepage settings from API
        const response = await fetch("/api/admin/homepage");
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("Failed to load homepage settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Get section order from settings or use default
  const sectionOrder =
    settings?.sectionOrder && settings.sectionOrder.length > 0
      ? settings.sectionOrder
      : DEFAULT_SECTION_ORDER;

  // Show loading state
  if (loading) {
    return (
      <main
        id="home-page"
        className="container mx-auto px-3 md:px-4 py-6 md:py-8"
      >
        <div className="space-y-6 md:space-y-8">
          <div className="h-64 md:h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="h-48 md:h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="h-48 md:h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </main>
    );
  }

  // Render sections based on order from settings
  const renderSection = (sectionKey: string) => {
    const sectionConfig = settings?.sections[sectionKey as keyof typeof settings.sections];

    switch (sectionKey) {
      case "valueProposition":
        return (
          sectionConfig?.enabled !== false && (
            <ValueProposition key="value-prop" />
          )
        );
      case "featuredCategories":
        return (
          sectionConfig?.enabled !== false && (
            <FeaturedCategories key="featured-cats" />
          )
        );
      default:
        return (
          <DynamicSection
            key={sectionKey}
            sectionKey={sectionKey}
            config={sectionConfig}
          />
        );
    }
  };

  return (
    <main
      id="home-page"
      className="container mx-auto px-3 md:px-4 py-6 md:py-8"
    >
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Heading - Always shown */}
        <WelcomeHero />

        {/* Hero Section - Conditional */}
        <HeroSection enabled={settings?.heroCarousel.enabled !== false} />

        {/* Recently Viewed Products - Client-side only */}
        <RecentlyViewedWidget title="Continue Browsing" />

        {/* Dynamic Sections - Rendered in order from settings */}
        {sectionOrder.map((sectionKey) => renderSection(sectionKey))}

        {/* Static Sections - Always shown */}
        <StaticSections isMobile={isMobile} />
      </div>
    </main>
  );
}
