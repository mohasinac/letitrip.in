import { DemoStep, DemoDataSummary } from "@/services/demo-data.service";

export interface DeletionBreakdown {
  collection: string;
  count: number;
}

export interface UserCredential {
  email: string;
  password: string;
  name: string;
}

export interface CredentialsData {
  admins: UserCredential[];
  moderators: UserCredential[];
  support: UserCredential[];
  sellers: UserCredential[];
  buyers: UserCredential[];
}

export interface StepStatus {
  status: "pending" | "running" | "completed" | "error";
  count?: number;
  error?: string;
}

export interface ExtendedSummary extends DemoDataSummary {
  carts?: number;
  cartItems?: number;
  favorites?: number;
  conversations?: number;
  messages?: number;
  media?: number;
  blogPosts?: number;
  blogCategories?: number;
  blogTags?: number;
  heroSlides?: number;
  returns?: number;
  tickets?: number;
  payouts?: number;
  addresses?: number;
  settings?: number;
  featureFlags?: number;
  notifications?: number;
  featuredCategories?: number;
  productsPerShop?: number;
  auctionsPerShop?: number;
  featuredAuctions?: number;
  usersByRole?: {
    admins: number;
    moderators: number;
    support: number;
    sellers: number;
    buyers: number;
  };
}

export type DemoStepConfig = {
  id: DemoStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};
