/**
 * Homepage Sections Collection Schema
 *
 * Firestore schema definition for configurable homepage sections
 */

import {
  generateHomepageSectionId,
  type GenerateHomepageSectionIdInput,
} from "@/utils/id-generators";

// ============================================
// SECTION CONFIG TYPES
// ============================================
export interface WelcomeSectionConfig {
  h1: string;
  subtitle: string;
  description: string; // Rich text JSON
  showCTA: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export interface TrustIndicatorsSectionConfig {
  title: string;
  indicators: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];
}

export interface CategoriesSectionConfig {
  title: string;
  maxCategories: 4;
  autoScroll: boolean;
  scrollInterval: number; // milliseconds
}

export interface ProductsSectionConfig {
  title: string;
  subtitle?: string;
  maxProducts: 18;
  rows: 2;
  itemsPerRow: 3;
  mobileItemsPerRow: 1;
  autoScroll: boolean;
  scrollInterval: number;
}

export interface SpecialCollectionsSectionConfig {
  title: string;
  collections: {
    id: string;
    name: string;
    description: string;
    image?: string;
    link: string;
    badgeText?: string;
  }[];
}

export interface AuctionsSectionConfig {
  title: string;
  subtitle?: string;
  maxAuctions: 18;
  rows: 2;
  itemsPerRow: 3;
  mobileItemsPerRow: 1;
  autoScroll: boolean;
  scrollInterval: number;
}

export interface ReviewsSectionConfig {
  title: string;
  maxReviews: 18;
  itemsPerView: 3;
  mobileItemsPerView: 1;
  autoScroll: boolean;
  scrollInterval: number;
}

export interface WhatsAppCommunitySectionConfig {
  title: string;
  description: string;
  groupLink: string;
  memberCount?: number;
  benefits: string[];
  buttonText: string;
}

export interface FeaturesSectionConfig {
  title: string;
  features: string[]; // Feature IDs from siteSettings
}

export interface FAQSectionConfig {
  title: string;
  subtitle?: string;
  showOnHomepage: boolean;
  displayCount: number; // How many FAQs to show on homepage (default: 6)
  expandedByDefault: boolean; // All FAQs open or closed initially
  linkToFullPage: boolean; // Show "View All FAQs" link
  categories: (
    | "general"
    | "shipping"
    | "returns"
    | "payment"
    | "account"
    | "products"
    | "sellers"
  )[];
}

export interface BlogArticlesSectionConfig {
  title: string;
  maxArticles: 4;
  showReadTime: boolean;
  showAuthor: boolean;
  showThumbnails: boolean;
}

export interface NewsletterSectionConfig {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  privacyText: string;
  privacyLink: string;
}

export interface BannerSectionConfig {
  height: "sm" | "md" | "lg" | "xl"; // 200px, 300px, 400px, 500px
  backgroundImage?: string;
  backgroundColor?: string;
  gradient?: string;
  content: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  buttons: {
    text: string;
    link: string;
    variant: "primary" | "secondary" | "outline";
  }[];
  clickable: boolean;
  clickLink?: string;
}

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export type SectionType =
  | "welcome"
  | "trust-indicators"
  | "categories"
  | "products"
  | "special-collections"
  | "auctions"
  | "banner"
  | "features"
  | "reviews"
  | "whatsapp-community"
  | "faq"
  | "blog-articles"
  | "newsletter";

export type SectionConfig =
  | WelcomeSectionConfig
  | TrustIndicatorsSectionConfig
  | CategoriesSectionConfig
  | ProductsSectionConfig
  | SpecialCollectionsSectionConfig
  | AuctionsSectionConfig
  | BannerSectionConfig
  | FeaturesSectionConfig
  | ReviewsSectionConfig
  | WhatsAppCommunitySectionConfig
  | FAQSectionConfig
  | BlogArticlesSectionConfig
  | NewsletterSectionConfig;

export interface HomepageSectionDocument {
  id: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  config: SectionConfig;
  createdAt: Date;
  updatedAt: Date;
}

export const HOMEPAGE_SECTIONS_COLLECTION = "homepageSections" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * Purpose:
 * - enabled + order: Fetch enabled sections in display order
 * - type: Filter sections by type
 */
export const HOMEPAGE_SECTIONS_INDEXED_FIELDS = [
  "enabled", // For filtering enabled sections
  "order", // For sorting sections
  "type", // For filtering by section type
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * homepageSections (independent collection)
 *
 * References:
 * - FeaturesSectionConfig.features references siteSettings.features[].id
 * - FAQSectionConfig references faqs collection
 * - ProductsSectionConfig references products collection (featured flag)
 * - AuctionsSectionConfig references products collection (isAuction + featured)
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Default order for homepage sections (15 total)
 */
export const DEFAULT_SECTION_ORDER: Record<SectionType, number> = {
  welcome: 1,
  "trust-indicators": 2,
  categories: 3,
  products: 4,
  "special-collections": 5,
  auctions: 6,
  banner: 7,
  features: 8,
  reviews: 9,
  "whatsapp-community": 10,
  faq: 11,
  "blog-articles": 12,
  newsletter: 13,
};

/**
 * Banner height mappings
 */
export const BANNER_HEIGHTS: Record<BannerSectionConfig["height"], string> = {
  sm: "200px",
  md: "300px",
  lg: "400px",
  xl: "500px",
};

/**
 * Default data for each section type
 */
export const DEFAULT_SECTION_CONFIGS: Record<SectionType, SectionConfig> = {
  welcome: {
    h1: "Welcome to LetItRip",
    subtitle: "Your Marketplace, Your Rules",
    description: "Discover amazing products from multiple sellers",
    showCTA: true,
    ctaText: "Shop Now",
    ctaLink: "/products",
  } as WelcomeSectionConfig,
  "trust-indicators": {
    title: "Why Choose Us",
    indicators: [
      {
        id: "wide-range",
        icon: "📦",
        title: "Wide Range",
        description: "1000+ Products Available",
      },
      {
        id: "fast-shipping",
        icon: "🚚",
        title: "Fast Shipping",
        description: "Delivered in 3-5 Days",
      },
      {
        id: "original-products",
        icon: "✅",
        title: "100% Original",
        description: "Authentic Products Only",
      },
      {
        id: "customer-support",
        icon: "👥",
        title: "Customer Support",
        description: "24/7 Assistance",
      },
    ],
  } as TrustIndicatorsSectionConfig,
  categories: {
    title: "Shop by Category",
    maxCategories: 4,
    autoScroll: true,
    scrollInterval: 5000,
  } as CategoriesSectionConfig,
  products: {
    title: "Featured Products",
    subtitle: "Discover our handpicked selection",
    maxProducts: 18,
    rows: 2,
    itemsPerRow: 3,
    mobileItemsPerRow: 1,
    autoScroll: false,
    scrollInterval: 0,
  } as ProductsSectionConfig,
  "special-collections": {
    title: "Special Collections",
    collections: [
      {
        id: "new-arrivals",
        name: "New Arrivals",
        description: "Latest products",
        link: "/products?filter=new",
        badgeText: "NEW",
      },
      {
        id: "budget-friendly",
        name: "Under ₹1000",
        description: "Best deals",
        link: "/products?maxPrice=1000",
      },
    ],
  } as SpecialCollectionsSectionConfig,
  auctions: {
    title: "Live Auctions",
    subtitle: "Bid on exclusive items",
    maxAuctions: 18,
    rows: 2,
    itemsPerRow: 3,
    mobileItemsPerView: 1,
    mobileItemsPerRow: 1,
    autoScroll: false,
    scrollInterval: 0,
  } as AuctionsSectionConfig,
  banner: {
    height: "md",
    backgroundColor: "#f3f4f6",
    content: {
      title: "Special Offer",
      subtitle: "Limited Time Deal",
    },
    buttons: [],
    clickable: false,
  } as BannerSectionConfig,
  features: {
    title: "Our Features",
    features: [],
  } as FeaturesSectionConfig,
  reviews: {
    title: "Customer Reviews",
    maxReviews: 18,
    itemsPerView: 3,
    mobileItemsPerView: 1,
    autoScroll: true,
    scrollInterval: 5000,
  } as ReviewsSectionConfig,
  "whatsapp-community": {
    title: "Join Our WhatsApp Community",
    description: "Stay updated with exclusive deals and offers",
    groupLink: "https://wa.me/XXXXXXXXXX",
    memberCount: 500,
    benefits: ["Regular Updates", "Exclusive Deals", "Early Access"],
    buttonText: "Join Now",
  } as WhatsAppCommunitySectionConfig,
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions",
    showOnHomepage: true,
    displayCount: 6,
    expandedByDefault: false,
    linkToFullPage: true,
    categories: ["general", "shipping", "returns", "payment"],
  } as FAQSectionConfig,
  "blog-articles": {
    title: "Latest from Our Blog",
    maxArticles: 4,
    showReadTime: true,
    showAuthor: true,
    showThumbnails: true,
  } as BlogArticlesSectionConfig,
  newsletter: {
    title: "Subscribe to Our Newsletter",
    description: "Get the latest updates and exclusive offers",
    placeholder: "Enter your email",
    buttonText: "Subscribe",
    privacyText: "We respect your privacy",
    privacyLink: "/privacy-policy",
  } as NewsletterSectionConfig,
};

/**
 * Fields that are publicly readable
 */
export const HOMEPAGE_SECTIONS_PUBLIC_FIELDS = [
  "id",
  "type",
  "order",
  "enabled",
  "config",
] as const;

/**
 * Fields that admins can update
 */
export const HOMEPAGE_SECTIONS_UPDATABLE_FIELDS = [
  "order",
  "enabled",
  "config",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new homepage sections
 */
export type HomepageSectionCreateInput = Omit<
  HomepageSectionDocument,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Type for updating homepage sections
 */
export type HomepageSectionUpdateInput = Partial<
  Pick<HomepageSectionDocument, "order" | "enabled" | "config">
>;

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const homepageSectionQueryHelpers = {
  enabled: () => ["enabled", "==", true] as const,
  disabled: () => ["enabled", "==", false] as const,
  byType: (type: SectionType) => ["type", "==", type] as const,
} as const;

// ============================================
// 7. ID GENERATION HELPER
// ============================================

/**
 * Generate SEO-friendly homepage section ID
 * Pattern: section-{type}-{timestamp}
 *
 * @param type - Section type
 * @returns SEO-friendly section ID
 *
 * Example: createHomepageSectionId("welcome") → "section-welcome-1707300000000"
 */
export function createHomepageSectionId(type: SectionType): string {
  return generateHomepageSectionId({ type });
}
