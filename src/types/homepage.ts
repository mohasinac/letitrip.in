/**
 * @fileoverview TypeScript Module
 * @module src/types/homepage
 * @description This file contains functionality related to homepage
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Section Config interface
 * @interface SectionConfig
 */
export interface SectionConfig {
  /** Enabled */
  enabled: boolean;
  /** Order */
  order?: number;
  /** Display Count */
  displayCount?: number;
  /** Layout */
  layout?: "grid" | "carousel" | "list";
  /** Title */
  title?: string;
  /** Subtitle */
  subtitle?: string;
}

/**
 * HomepageSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for HomepageSettings
 */
export interface HomepageSettings {
  /** Hero Carousel */
  heroCarousel: {
    /** Enabled */
    enabled: boolean;
    /** Auto Play */
    autoPlay?: boolean;
    /** Interval */
    interval?: number;
    /** Show Arrows */
    showArrows?: boolean;
    /** Show Dots */
    showDots?: boolean;
    /** Transition */
    transition?: "slide" | "fade";
  };
  /** Sections */
  sections: {
    /** Value Proposition */
    valueProposition: SectionConfig;
    /** Latest Products */
    latestProducts: SectionConfig;
    /** Hot Auctions */
    hotAuctions: SectionConfig;
    /** Featured Categories */
    featuredCategories: SectionConfig;
    /** Featured Shops */
    featuredShops: SectionConfig;
    /** Featured Products */
    featuredProducts: SectionConfig;
    /** Featured Auctions */
    featuredAuctions: SectionConfig;
    /** Recent Reviews */
    recentReviews: SectionConfig;
    /** Featured Blogs */
    featuredBlogs: SectionConfig;
  };
  /** Section Order */
  sectionOrder: string[];
  /** Created At */
  createdAt: Date | string;
  /** Updated At */
  updatedAt: Date | string;
}

/**
 * Default Section Order
 * @constant
 */
export const DEFAULT_SECTION_ORDER = [
  "valueProposition",
  "latestProducts",
  "hotAuctions",
  "featuredCategories",
  "featuredShops",
  "featuredProducts",
  "featuredAuctions",
  "recentReviews",
  "featuredBlogs",
];
