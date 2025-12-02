"use client";

import dynamic from "next/dynamic";
import { COMPANY_NAME } from "@/constants/navigation";

const HeroCarousel = dynamic(() => import("@/components/layout/HeroCarousel"), {
  ssr: true,
  loading: () => <HeroSkeleton />,
});

interface HeroSectionProps {
  enabled: boolean;
}

export function HeroSection({ enabled }: HeroSectionProps) {
  if (!enabled) {
    return null;
  }

  return (
    <section id="hero-section" className="relative">
      <HeroCarousel />
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div className="relative h-64 md:h-80 lg:h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-300 dark:text-gray-600">
            Welcome to {COMPANY_NAME}
          </h2>
          <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm md:text-base">
            Loading featured collections...
          </p>
        </div>
      </div>
    </div>
  );
}
