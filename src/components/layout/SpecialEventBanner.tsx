/**
 * @fileoverview React Component
 * @module src/components/layout/SpecialEventBanner
 * @description This file contains the SpecialEventBanner component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { homepageService } from "@/services/homepage.service";
import OptimizedImage from "@/components/common/OptimizedImage";
import { logError } from "@/lib/firebase-error-logger";

export default /**
 * Performs special event banner operation
 *
 * @returns {any} The specialeventbanner result
 *
 */
function SpecialEventBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [bannerSettings, setBannerSettings] = useState<{
    /** Enabled */
    enabled: boolean;
    /** Content */
    content: string;
    /** Link */
    link?: string;
    /** Background Color */
    backgroundColor?: string;
    /** Text Color */
    textColor?: string;
    /** Background Image */
    backgroundImage?: string;
    /** Gradient */
    gradient?: {
      /** From */
      from: string;
      /** To */
      to: string;
      /** Direction */
      direction?: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    const loadSettings = async () => {
      try {
        const data = await homepageService.getBanner();
        setBannerSettings(data);
      } catch (error) {
        logError(error as Error, {
          /** Component */
          component: "SpecialEventBanner.loadSettings",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading || !isVisible || !bannerSettings?.enabled) return null;

  // Default colors with dark mode support
  const defaultBgColor = "#2563eb"; // blue-600
  const defaultTextColor = "#ffffff";

  // Build style object
  const bannerStyle: React.CSSProperties = {};

  // Apply gradient if specified
  if (bannerSettings.gradient) {
    const direction = bannerSettings.gradient.direction || "to right";
    bannerStyle.backgroundImage = `linear-gradient(${direction}, ${bannerSettings.gradient.from}, ${bannerSettings.gradient.to})`;
  } else if (bannerSettings.backgroundColor) {
    bannerStyle.backgroundColor = bannerSettings.backgroundColor;
  } else {
    bannerStyle.backgroundColor = defaultBgColor;
  }

  // Apply text color
  bannerStyle.color = bannerSettings.textColor || defaultTextColor;

  /**
   * Performs banner content operation
   *
   * @returns {any} The bannercontent result
   */

  /**
   * Performs banner content operation
   *
   * @returns {any} The bannercontent result
   */

  const BannerContent = () => (
    <div
      className="prose prose-sm max-w-none text-center"
      dangerouslySetInnerHTML={{ __html: bannerSettings.content }}
      style={{
        /** Color */
        color: "inherit",
      }}
    />
  );

  return (
    <div
      id="special-event-banner"
      className="py-2 px-4 relative overflow-hidden"
      style={bannerStyle}
    >
      {/* Background Image */}
      {bannerSettings.backgroundImage && (
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src={bannerSettings.backgroundImage}
            alt="Banner background"
            fill
            objectFit="cover"
            className="opacity-20"
          />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm md:text-base relative z-10">
        {bannerSettings.link ? (
          <Link href={bannerSettings.link} className="hover:underline">
            <BannerContent />
          </Link>
        ) : (
          <BannerContent />
        )}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-white/20 rounded p-1 transition-colors"
          aria-label="Close banner"
          style={{ color: "inherit" }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <style jsx global>{`
        #special-event-banner .prose p {
          /** Margin */
          margin: 0;
          /** Display */
          display: inline;
        }
        #special-event-banner .prose strong {
          font-weight: 600;
        }
        #special-event-banner .prose a {
          /** Color */
          color: inherit;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
