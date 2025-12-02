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
    featuredCategories: SectionConfig;
    featuredProducts: SectionConfig;
    newArrivals: SectionConfig;
    bestSellers: SectionConfig;
    onSale: SectionConfig;
    featuredAuctions: SectionConfig;
    featuredShops: SectionConfig;
    featuredBlogs: SectionConfig;
    featuredReviews: SectionConfig;
    vintageCollection?: SectionConfig;
  };
  sectionOrder: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const DEFAULT_SECTION_ORDER = [
  "valueProposition",
  "featuredCategories",
  "featuredProducts",
  "newArrivals",
  "bestSellers",
  "onSale",
  "featuredAuctions",
  "featuredShops",
  "featuredBlogs",
  "featuredReviews",
];
