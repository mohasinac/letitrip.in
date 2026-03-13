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
    upiVpa?: string; // Business UPI Virtual Payment Address, e.g. "letitrip@upi"
    whatsappNumber?: string; // WhatsApp number with country code, e.g. "+919876543210"
  };
  payment: {
    razorpayEnabled: boolean;
    upiManualEnabled: boolean;
    codEnabled: boolean;
  };
  commissions: {
    /** Platform fee on Razorpay orders as a percentage (default 5) */
    razorpayFeePercent: number;
    /** Upfront deposit percentage for COD orders (default 10) */
    codDepositPercent: number;
    /** Fixed platform commission (₹) for seller-custom shipping (default 50) */
    sellerShippingFixed: number;
    /** Platform shipping fee as percentage for Shiprocket/platform shipping (default 10) */
    platformShippingPercent: number;
    /** Minimum platform shipping fee in ₹ for Shiprocket/platform shipping (default 50) */
    platformShippingFixedMin: number;
    /**
     * Payment gateway fee % deducted from buyer refund on cancellation (default 2.36).
     * This is Razorpay's standard refund fee — the platform retains this on cancellation.
     */
    processingFeePercent?: number;
    /** GST on platform commission as percentage (default 18) */
    gstPercent?: number;
    /** Razorpay gateway fee % included in the seller payout deduction (default 2.36) */
    gatewayFeePercent?: number;
    /** Number of days after delivery before an order becomes auto-payout eligible (default 7) */
    autoPayoutWindowDays?: number;
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
  featureFlags: {
    chats: boolean;
    smsVerification: boolean;
    translations: boolean;
    wishlists: boolean;
    auctions: boolean;
    reviews: boolean;
    events: boolean;
    blog: boolean;
    coupons: boolean;
    notifications: boolean;
    rc: boolean;
    sellerRegistration: boolean;
    preOrders: boolean;
  };
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
  /**
   * Navbar visibility configuration.
   * `hiddenNavItems` holds the translation-key identifiers of nav items to hide
   * (e.g. ["blog", "events"]). Items not listed are always shown.
   */
  navbarConfig?: {
    hiddenNavItems?: string[];
  };
  /**
   * Footer layout configuration.
   */
  footerConfig?: {
    trustBar?: {
      enabled?: boolean;
      items?: TrustBarItem[];
    };
    newsletterEnabled?: boolean;
  };
  /**
   * Encrypted provider credentials (AES-256-GCM via src/lib/encryption.ts).
   * Values are encrypted blobs — never return raw to the client.
   * Empty / undefined means "fall back to environment variable".
   */
  credentials?: SiteSettingsCredentials; /**
   * Loyalty / RC earn configuration.
   * Controls earn rates for purchases and events.
   * Falls back to DEFAULT_LOYALTY_CONFIG when not set.
   */
  loyalty?: import("./rc").LoyaltyConfig;
  /**
   * Admin-curated before/after result cards shown in `FeaturedResultsSection`.
   * Each entry pairs two image URLs with an optional caption.
   */
  featuredResults?: FeaturedResult[];
  createdAt: Date;
  updatedAt: Date;
}

/** A single chip in the footer trust bar. */
export interface TrustBarItem {
  icon: string;
  label: string;
  visible: boolean;
}

/** Default trust bar chips — used as fallback when footerConfig.trustBar.items is not set. */
export const DEFAULT_TRUST_BAR_ITEMS: TrustBarItem[] = [
  { icon: "🚚", label: "Free Shipping", visible: true },
  { icon: "🔄", label: "Easy Returns", visible: true },
  { icon: "🔒", label: "Secure Payment", visible: true },
  { icon: "🎧", label: "24/7 Support", visible: true },
  { icon: "✅", label: "Authentic Sellers", visible: true },
];

/** A single before/after comparison card entry for the homepage results section. */
export interface FeaturedResult {
  /** URL of the "before" image */
  beforeImage: string;
  /** URL of the "after" image */
  afterImage: string;
  /** Short caption displayed below the drag card */
  caption: string;
}

/** Encrypted-at-rest credential blobs stored in Firestore. */
export interface SiteSettingsCredentials {
  /** Razorpay Key ID (semi-public — also returned unmasked in public API for the checkout modal) */
  razorpayKeyId?: string;
  /** Razorpay Key Secret — encrypted, NEVER sent to client */
  razorpayKeySecret?: string;
  /** Razorpay Webhook Secret — encrypted, NEVER sent to client */
  razorpayWebhookSecret?: string;
  /** Resend API key — encrypted, NEVER sent to client */
  resendApiKey?: string;
  /** WhatsApp Business Cloud API key — encrypted, NEVER sent to client */
  whatsappApiKey?: string;
  /** Shiprocket email — for platform-level Shiprocket shipping integration */
  shiprocketEmail?: string;
  /** Shiprocket password — encrypted, NEVER sent to client */
  shiprocketPassword?: string;
  /** Meta (Facebook) App ID — for product catalog / ads OAuth */
  metaAppId?: string;
  /** Meta App Secret — encrypted, NEVER sent to client */
  metaAppSecret?: string;
  /** Meta long-lived page access token — encrypted, obtained via platform OAuth flow */
  metaPageAccessToken?: string;
  /** Meta page ID whose catalog/ads are managed */
  metaPageId?: string;
}

/** Masked credential values safe to return to an authenticated admin. */
export interface SiteSettingsCredentialsMasked {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  resendApiKey?: string;
  whatsappApiKey?: string;
  shiprocketEmail?: string;
  shiprocketPassword?: string;
  metaAppId?: string;
  metaAppSecret?: string;
  metaPageAccessToken?: string;
  metaPageId?: string;
}

/**
 * Strongly-typed key union for featureFlags
 */
export type FeatureFlagKey = keyof SiteSettingsDocument["featureFlags"];

/**
 * Metadata descriptor for each feature flag — used to render admin UI
 */
export interface FeatureFlagMeta {
  key: FeatureFlagKey;
  labelKey: string; // i18n key
  descKey: string; // i18n key
  icon: string;
  category: "platform" | "payment";
}

export const FEATURE_FLAG_META: FeatureFlagMeta[] = [
  {
    key: "chats",
    labelKey: "chats",
    descKey: "chatsDesc",
    icon: "💬",
    category: "platform",
  },
  {
    key: "smsVerification",
    labelKey: "smsVerification",
    descKey: "smsVerificationDesc",
    icon: "📱",
    category: "platform",
  },
  {
    key: "translations",
    labelKey: "translations",
    descKey: "translationsDesc",
    icon: "🌐",
    category: "platform",
  },
  {
    key: "wishlists",
    labelKey: "wishlists",
    descKey: "wishlistsDesc",
    icon: "❤️",
    category: "platform",
  },
  {
    key: "auctions",
    labelKey: "auctions",
    descKey: "auctionsDesc",
    icon: "🔨",
    category: "platform",
  },
  {
    key: "reviews",
    labelKey: "reviews",
    descKey: "reviewsDesc",
    icon: "⭐",
    category: "platform",
  },
  {
    key: "events",
    labelKey: "events",
    descKey: "eventsDesc",
    icon: "🎉",
    category: "platform",
  },
  {
    key: "blog",
    labelKey: "blog",
    descKey: "blogDesc",
    icon: "📝",
    category: "platform",
  },
  {
    key: "coupons",
    labelKey: "coupons",
    descKey: "couponsDesc",
    icon: "🏷️",
    category: "platform",
  },
  {
    key: "notifications",
    labelKey: "notifications",
    descKey: "notificationsDesc",
    icon: "🔔",
    category: "platform",
  },
  {
    key: "rc",
    labelKey: "rc",
    descKey: "rcDesc",
    icon: "🪙",
    category: "platform",
  },
  {
    key: "sellerRegistration",
    labelKey: "sellerRegistration",
    descKey: "sellerRegistrationDesc",
    icon: "🏪",
    category: "platform",
  },
  {
    key: "preOrders",
    labelKey: "preOrders",
    descKey: "preOrdersDesc",
    icon: "📦",
    category: "platform",
  },
] as const;

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
  payment: {
    razorpayEnabled: true,
    upiManualEnabled: true,
    codEnabled: true,
  },
  commissions: {
    razorpayFeePercent: 5,
    codDepositPercent: 10,
    sellerShippingFixed: 50,
    platformShippingPercent: 10,
    platformShippingFixedMin: 50,
  },
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
    upiVpa: "letitrip@upi",
    whatsappNumber: "+91XXXXXXXXXX",
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
  featureFlags: {
    chats: true,
    smsVerification: true,
    translations: true,
    wishlists: true,
    auctions: true,
    reviews: true,
    events: true,
    blog: true,
    coupons: true,
    notifications: true,
    rc: true,
    sellerRegistration: true,
    preOrders: false,
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
  "contact.upiVpa",
  "contact.whatsappNumber",
  "payment",
  "commissions",
  "socialLinks",
  "seo",
  "features",
  "featureFlags",
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
  "payment",
  "commissions",
  "socialLinks",
  "emailSettings",
  "seo",
  "features",
  "featureFlags",
  "legalPages",
  "shipping",
  "returns",
  "faq",
  "credentials",
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
