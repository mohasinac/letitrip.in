export interface SectionConfig {
  enabled: boolean;
  order?: number;
  displayCount?: number;
  layout?: "grid" | "carousel" | "list";
  title?: string;
  subtitle?: string;
}

export interface HomepageSettings {
  heroCarousel: {
    enabled: boolean;
    autoPlay?: boolean;
    interval?: number;
    showArrows?: boolean;
    showDots?: boolean;
    transition?: "slide" | "fade";
  };
  sections: {
    valueProposition: SectionConfig;
    latestProducts: SectionConfig;
    hotAuctions: SectionConfig;
    featuredCategories: SectionConfig;
    featuredShops: SectionConfig;
    featuredProducts: SectionConfig;
    featuredAuctions: SectionConfig;
    recentReviews: SectionConfig;
    featuredBlogs: SectionConfig;
  };
  sectionOrder: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

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
