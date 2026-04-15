/**
 * Homepage Data Constants
 *
 * Static data for homepage sections (trust indicators, features, mock blog articles).
 * These constants provide consistent data across the homepage components.
 */

export interface TrustIndicator {
  icon: string;
  title: string;
  description: string;
}

/** Trust/feature item with a lucide-react icon name for component-side rendering */
export interface TrustFeatureItem {
  /** lucide-react icon name — resolved in TrustFeaturesSection */
  iconName: "ShieldCheck" | "Truck" | "RotateCcw" | "Headphones";
  title: string;
  description: string;
}

export interface SiteFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/**
 * Trust indicators displayed on homepage
 * Highlights key value propositions of the platform
 */
export const TRUST_INDICATORS: TrustIndicator[] = [
  {
    icon: "📦",
    title: "Wide Range",
    description: "10,000+ Products Across Categories",
  },
  {
    icon: "🚚",
    title: "Fast Shipping",
    description: "Delivery in 2-5 Business Days",
  },
  {
    icon: "✓",
    title: "Original Products",
    description: "100% Authentic & Verified",
  },
  {
    icon: "👥",
    title: "50,000+ Customers",
    description: "Trusted by Thousands Nationwide",
  },
];

/**
 * Merged trust + features section — 4 items with lucide-react iconNames.
 * Used by TrustFeaturesSection (replaces both TrustIndicatorsSection and SiteFeaturesSection).
 */
export const TRUST_FEATURES: TrustFeatureItem[] = [
  {
    iconName: "ShieldCheck",
    title: "Secure Payments",
    description: "Multiple payment options with bank-grade encryption",
  },
  {
    iconName: "Truck",
    title: "Fast Delivery",
    description: "Delivery in 2–5 business days across India",
  },
  {
    iconName: "RotateCcw",
    title: "Easy Returns",
    description: "7-day hassle-free return policy on all products",
  },
  {
    iconName: "Headphones",
    title: "24/7 Support",
    description: "Round-the-clock customer service via chat and phone",
  },
];

/**
 * Site features highlighting key benefits
 * Used in "Why Shop With Us?" section
 */
export const SITE_FEATURES: SiteFeature[] = [
  {
    id: "secure-payment",
    icon: "🔒",
    title: "Secure Payments",
    description: "Multiple payment options with encrypted transactions",
  },
  {
    id: "easy-returns",
    icon: "↩️",
    title: "Easy Returns",
    description: "7-day hassle-free return policy on all products",
  },
  {
    id: "quality-check",
    icon: "✓",
    title: "Quality Check",
    description: "Every item verified before shipment",
  },
  {
    id: "customer-support",
    icon: "💬",
    title: "24/7 Support",
    description: "Round-the-clock customer service via chat and phone",
  },
  {
    id: "seller-protection",
    icon: "🛡️",
    title: "Seller Protection",
    description: "Safe and secure platform for sellers to grow business",
  },
  {
    id: "buyer-guarantee",
    icon: "⭐",
    title: "Buyer Guarantee",
    description: "Money-back guarantee if item not as described",
  },
];

/**
 * Mock blog articles for homepage display
 * NOTE: REMOVED — BlogArticlesSection now uses the real /api/blog endpoint.
 * See src/services/blog.service.ts#getFeatured.
 */

