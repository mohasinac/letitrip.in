/**
 * Shared types for admin homepage sections management.
 */

export interface HomepageSection {
  id: string;
  type: string;
  title: string;
  description?: string;
  enabled: boolean;
  order: number;
  config: Record<string, any>;
}

export type SectionDrawerMode = "create" | "edit" | "delete" | null;

export const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "featured-products", label: "Featured Products" },
  { value: "featured-auctions", label: "Featured Auctions" },
  { value: "categories", label: "Categories Grid" },
  { value: "testimonials", label: "Testimonials" },
  { value: "stats", label: "Statistics" },
  { value: "cta", label: "Call to Action" },
  { value: "blog", label: "Blog Posts" },
  { value: "faq", label: "FAQ" },
  { value: "newsletter", label: "Newsletter Signup" },
  { value: "custom-html", label: "Custom HTML" },
] as const;
