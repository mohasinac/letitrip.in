export type HomepageSectionType =
  | "hero"
  | "featured_categories"
  | "featured_products"
  | "banner"
  | "testimonials"
  | "promotions"
  | "blog_posts"
  | "sellers"
  | "custom";

export interface HomepageSectionContent {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  itemIds?: string[];
  html?: string;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title?: string;
  isVisible?: boolean;
  order?: number;
  content?: HomepageSectionContent;
  mobile?: Partial<HomepageSectionContent>;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomepageData {
  sections: HomepageSection[];
}
