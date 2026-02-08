/**
 * Site Settings Collection Schema
 *
 * Firestore schema definition for global site settings (singleton document)
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface SiteSettingsDocument {
  id: "global"; // Singleton document
  siteName: string;
  motto: string;
  logo: {
    url: string;
    alt: string;
    format: "svg" | "png";
  };
  background: {
    light: {
      type: "color" | "gradient" | "image" | "video";
      value: string; // Color hex, gradient CSS, image URL, or video URL
      overlay?: {
        enabled: boolean;
        color: string;
        opacity: number; // 0-1
      };
    };
    dark: {
      type: "color" | "gradient" | "image" | "video";
      value: string;
      overlay?: {
        enabled: boolean;
        color: string;
        opacity: number;
      };
    };
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  emailSettings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
  };
  features: {
    id: string;
    name: string;
    description: string;
    icon: string;
    enabled: boolean;
  }[];
  legalPages: {
    termsOfService: string; // Rich text JSON
    privacyPolicy: string;
    refundPolicy: string;
    shippingPolicy: string;
  };
  shipping: {
    estimatedDays: number;
    minOrderForFree: number;
  };
  returns: {
    windowDays: number;
  };
  faq: {
    variables: {
      shippingDays: number;
      minOrderValue: number;
      returnWindow: number;
      supportEmail: string;
      supportPhone: string;
      codDeposit: number; // Percentage (0-1, e.g., 0.1 = 10%)
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export const SITE_SETTINGS_COLLECTION = "siteSettings" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * NOTE: Single document collection, no indices needed
 */
export const SITE_SETTINGS_INDEXED_FIELDS = [] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * siteSettings (singleton) --< (0) none
 *
 * This is a singleton document that stores global site configuration.
 * It has no direct relationships with other collections.
 *
 * Referenced By:
 * - faqs collection uses siteSettings.faq.variables for variable interpolation
 * - homepageSections references siteSettings.features for features section
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Default data for initial site settings
 */
export const DEFAULT_SITE_SETTINGS_DATA: Partial<SiteSettingsDocument> = {
  id: "global",
  siteName: "LetItRip",
  motto: "Your Marketplace, Your Rules",
  background: {
    light: {
      type: "color",
      value: "#f9fafb", // gray-50
      overlay: {
        enabled: false,
        color: "#000000",
        opacity: 0,
      },
    },
    dark: {
      type: "color",
      value: "#030712", // gray-950
      overlay: {
        enabled: false,
        color: "#000000",
        opacity: 0,
      },
    },
  },
  contact: {
    email: "support@letitrip.in",
    phone: "+91-XXXXXXXXXX",
    address: "Marketplace Street, India",
  },
  emailSettings: {
    fromName: "LetItRip",
    fromEmail: "noreply@letitrip.in",
    replyTo: "support@letitrip.in",
  },
  seo: {
    defaultTitle: "LetItRip - Multi-Seller E-Commerce & Auction Platform",
    defaultDescription:
      "Buy and sell products, participate in auctions, and discover amazing deals from multiple sellers.",
    keywords: [
      "e-commerce",
      "marketplace",
      "auction",
      "online shopping",
      "multi-seller",
    ],
    ogImage: "/og-image.png",
  },
  features: [
    {
      id: "wide-range",
      name: "Wide Range",
      description: "1000+ Products Available",
      icon: "📦",
      enabled: true,
    },
    {
      id: "fast-shipping",
      name: "Fast Shipping",
      description: "Delivered in 3-5 Days",
      icon: "🚚",
      enabled: true,
    },
    {
      id: "original-products",
      name: "100% Original",
      description: "Authentic Products Only",
      icon: "✅",
      enabled: true,
    },
    {
      id: "secure-payments",
      name: "Secure Payments",
      description: "Safe & Encrypted Transactions",
      icon: "🔒",
      enabled: true,
    },
  ],
  shipping: {
    estimatedDays: 5,
    minOrderForFree: 1000,
  },
  returns: {
    windowDays: 7,
  },
  faq: {
    variables: {
      shippingDays: 5,
      minOrderValue: 1000,
      returnWindow: 7,
      supportEmail: "support@letitrip.in",
      supportPhone: "+91-XXXXXXXXXX",
      codDeposit: 0.1, // 10%
    },
  },
};

/**
 * Fields that are publicly readable
 */
export const SITE_SETTINGS_PUBLIC_FIELDS = [
  "siteName",
  "motto",
  "logo",
  "background",
  "contact.email",
  "contact.phone",
  "socialLinks",
  "seo",
  "features",
  "faq.variables",
] as const;

/**
 * Fields that admins can update
 */
export const SITE_SETTINGS_UPDATABLE_FIELDS = [
  "siteName",
  "motto",
  "logo",
  "background",
  "contact",
  "socialLinks",
  "emailSettings",
  "seo",
  "features",
  "legalPages",
  "shipping",
  "returns",
  "faq",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for updating site settings (all fields optional except id)
 */
export type SiteSettingsUpdateInput = Partial<
  Omit<SiteSettingsDocument, "id" | "createdAt" | "updatedAt">
>;

/**
 * Type for feature objects
 */
export type SiteFeature = SiteSettingsDocument["features"][0];

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Query helpers for common site settings operations
 *
 * NOTE: Since this is a singleton document, queries are always by ID "global"
 */
export const siteSettingsQueryHelpers = {
  // Get the singleton document ID
  getSingletonId: () => "global" as const,
} as const;
