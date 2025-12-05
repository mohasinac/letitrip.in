/**
 * @fileoverview React Component
 * @module src/components/homepage/HeroSection
 * @description This file contains the HeroSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import dynamic from "next/dynamic";
import { COMPANY_NAME } from "@/constants/navigation";

const HeroCarousel = dynamic(() => import("@/components/layout/HeroCarousel"), {
  /** Ssr */
  ssr: true,
  /** Loading */
  loading: () => <HeroSkeleton />,
});

/**
 * HeroSectionProps interface
 * 
 * @interface
 * @description Defines the structure and contract for HeroSectionProps
 */
interface HeroSectionProps {
  /** Enabled */
  enabled: boolean;
}

/**
 * Function: Hero Section
 */
/**
 * Performs hero section operation
 *
 * @param {HeroSectionProps} { enabled } - The { enabled }
 *
 * @returns {any} The herosection result
 *
 * @example
 * HeroSection({ enabled });
 */

/**
 * Performs hero section operation
 *
 * @param {HeroSectionProps} { enabled } - The { enabled }
 *
 * @returns {any} The herosection result
 *
 * @example
 * HeroSection({ enabled });
 */

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

/**
 * Function: Hero Skeleton
 */
/**
 * Performs hero skeleton operation
 *
 * @returns {any} The heroskeleton result
 */

/**
 * Performs hero skeleton operation
 *
 * @returns {any} The heroskeleton result
 */

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
