/**
 * Homepage Sections Seed Data
 * Configurable sections for the homepage
 *
 * ID Pattern: section-{type}-{timestamp}
 * All IDs follow the generateHomepageSectionId() pattern from @/utils
 *
 * Section order follows DEFAULT_SECTION_ORDER from schema:
 * welcome(1) → trust-indicators(2) → categories(3) → products(4,5) →
 * auctions(6) → banner(7) → features(8) → reviews(9) →
 * whatsapp-community(10) → faq(11) → blog-articles(12) → newsletter(13)
 *
 * 13 total sections (12 enabled, 1 disabled for testing)
 */

import type { HomepageSectionDocument } from "@/db/schema";

export const homepageSectionsSeedData: Partial<HomepageSectionDocument>[] = [
  // ============================================
  // 1. WELCOME SECTION
  // ============================================
  {
    id: "section-welcome-1707300000001",
    type: "welcome",
    order: 1,
    enabled: true,
    config: {
      h1: "Welcome to LetItRip",
      subtitle: "Your Marketplace, Your Rules",
      description: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Discover amazing products from trusted sellers across India.",
              },
            ],
          },
        ],
      }),
      showCTA: true,
      ctaText: "Start Shopping",
      ctaLink: "/products",
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 2. TRUST INDICATORS
  // ============================================
  {
    id: "section-trust-indicators-1707300000002",
    type: "trust-indicators",
    order: 2,
    enabled: true,
    config: {
      title: "Why Shop With Us",
      indicators: [
        {
          id: "trust_001",
          icon: "🚚",
          title: "Free Shipping",
          description: "On orders above ₹999",
        },
        {
          id: "trust_002",
          icon: "🔒",
          title: "Secure Payments",
          description: "100% secure transactions",
        },
        {
          id: "trust_003",
          icon: "↩️",
          title: "Easy Returns",
          description: "7-day return policy",
        },
        {
          id: "trust_004",
          icon: "🎁",
          title: "Best Deals",
          description: "Unbeatable prices guaranteed",
        },
      ],
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 3. FEATURED CATEGORIES
  // ============================================
  {
    id: "section-categories-1707300000003",
    type: "categories",
    order: 3,
    enabled: true,
    config: {
      title: "Shop by Category",
      maxCategories: 4,
      autoScroll: false,
      scrollInterval: 3000,
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 4. FEATURED PRODUCTS
  // ============================================
  {
    id: "section-products-1707300000004",
    type: "products",
    order: 4,
    enabled: true,
    config: {
      title: "Featured Products",
      subtitle: "Handpicked for you",
      maxProducts: 18,
      rows: 2,
      itemsPerRow: 3,
      mobileItemsPerRow: 1,
      autoScroll: false,
      scrollInterval: 5000,
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 5. NEW ARRIVALS PRODUCTS
  // ============================================
  {
    id: "section-products-1707300000005",
    type: "products",
    order: 5,
    enabled: true,
    config: {
      title: "New Arrivals",
      subtitle: "Just in for you",
      maxProducts: 18,
      rows: 2,
      itemsPerRow: 3,
      mobileItemsPerRow: 1,
      autoScroll: true,
      scrollInterval: 4000,
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 6. LIVE AUCTIONS
  // ============================================
  {
    id: "section-auctions-1707300000006",
    type: "auctions",
    order: 6,
    enabled: true,
    config: {
      title: "Live Auctions",
      subtitle: "Bid and win amazing products",
      maxAuctions: 18,
      rows: 2,
      itemsPerRow: 3,
      mobileItemsPerRow: 1,
      autoScroll: false,
      scrollInterval: 5000,
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 7. PROMOTIONAL BANNER
  // ============================================
  {
    id: "section-banner-1707300000007",
    type: "banner",
    order: 7,
    enabled: true,
    config: {
      height: "md",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      content: {
        title: "Limited Time Offer",
        subtitle: "Get 20% Off Sitewide",
        description: "Use code SAVE20 at checkout",
      },
      buttons: [
        {
          text: "Shop Now",
          link: "/products",
          variant: "primary",
        },
      ],
      clickable: true,
      clickLink: "/deals",
    },
    createdAt: new Date("2026-02-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 8. FEATURES SECTION
  // ============================================
  {
    id: "section-features-1707300000008",
    type: "features",
    order: 8,
    enabled: true,
    config: {
      title: "Platform Features",
      features: ["feature_001", "feature_002", "feature_003", "feature_004"],
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 9. CUSTOMER REVIEWS
  // ============================================
  {
    id: "section-reviews-1707300000009",
    type: "reviews",
    order: 9,
    enabled: true,
    config: {
      title: "What Our Customers Say",
      maxReviews: 18,
      itemsPerView: 3,
      mobileItemsPerView: 1,
      autoScroll: true,
      scrollInterval: 6000,
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 10. WHATSAPP COMMUNITY
  // ============================================
  {
    id: "section-whatsapp-community-1707300000010",
    type: "whatsapp-community",
    order: 10,
    enabled: true,
    config: {
      title: "Join Our Community",
      description: "Get exclusive deals and connect with shoppers",
      groupLink: "https://chat.whatsapp.com/example",
      memberCount: 5000,
      benefits: [
        "Exclusive discounts",
        "Early sale access",
        "Product tips",
        "Direct support",
      ],
      buttonText: "Join WhatsApp Community",
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 11. FAQ SECTION
  // ============================================
  {
    id: "section-faq-1707300000011",
    type: "faq",
    order: 11,
    enabled: true,
    config: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions",
      showOnHomepage: true,
      displayCount: 6,
      expandedByDefault: false,
      linkToFullPage: true,
      categories: ["general", "shipping", "returns", "payment"],
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // ============================================
  // 12. BLOG ARTICLES
  // ============================================
  {
    id: "section-blog-articles-1707300000012",
    type: "blog-articles",
    order: 12,
    enabled: true,
    config: {
      title: "From Our Blog",
      subtitle: "Tips, guides, and stories from our community",
      maxArticles: 4,
      showReadTime: true,
      showAuthor: true,
      showThumbnails: true,
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-12T00:00:00Z"),
  },

  // ============================================
  // 13. NEWSLETTER SIGNUP
  // ============================================
  {
    id: "section-newsletter-1707300000013",
    type: "newsletter",
    order: 13,
    enabled: true,
    config: {
      title: "Stay Updated",
      description: "Subscribe for exclusive deals and updates",
      placeholder: "Enter your email",
      buttonText: "Subscribe",
      privacyText: "We respect your privacy",
      privacyLink: "/privacy-policy",
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },
];
