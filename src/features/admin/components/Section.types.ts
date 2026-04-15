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
  { value: "welcome", label: "Welcome" },
  { value: "trust-indicators", label: "Trust Indicators" },
  { value: "categories", label: "Categories" },
  { value: "products", label: "Products" },
  { value: "auctions", label: "Auctions" },
  { value: "stores", label: "Stores" },
  { value: "events", label: "Events" },
  { value: "banner", label: "Banner" },
  { value: "features", label: "Features" },
  { value: "reviews", label: "Reviews" },
  { value: "whatsapp-community", label: "WhatsApp Community" },
  { value: "faq", label: "FAQ" },
  { value: "blog-articles", label: "Blog Articles" },
  { value: "newsletter", label: "Newsletter" },
] as const;

