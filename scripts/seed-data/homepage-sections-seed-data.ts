/**
 * Homepage Sections Seed Data
 * Configurable sections for the homepage
 */

import type { HomepageSectionDocument } from "@/db/schema";

export const homepageSectionsSeedData: Partial<HomepageSectionDocument>[] = [
  // Welcome Section
  {
    id: "section-welcome-1707300000001",
    type: "welcome",
    order: 1,
    enabled: true,
    config: {
      h1: "Welcome to LetItRip",
      subtitle: "Your Marketplace",
      description: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Discover products from trusted sellers.",
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

  // Trust Indicators
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

  // Featured Categories
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

  // Featured Products
  {
    id: "section-products-featured-1707300000009",
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

  // Special Collections Banner
  {
    id: "section-special-collections-1707300000010",
    type: "special-collections",
    order: 5,
    enabled: true,
    config: {
      title: "Special Collections",
      collections: [
        {
          id: "col_001",
          name: "Electronics Sale",
          description: "Up to 50% off",
          image:
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop",
          link: "/categories/electronics",
          badgeText: "HOT",
        },
        {
          id: "col_002",
          name: "Fashion Trends",
          description: "Latest arrivals",
          image:
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
          link: "/categories/fashion",
          badgeText: "NEW",
        },
        {
          id: "col_003",
          name: "Home Essentials",
          description: "For your home",
          image:
            "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop",
          link: "/categories/home-kitchen",
        },
      ],
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // New Arrivals Products
  {
    id: "section-products-new-1707300000011",
    type: "products",
    order: 6,
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

  // Promotional Banner
  {
    id: "section-banner-promo-1707300000012",
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

  // Live Auctions
  {
    id: "section-auctions-1707300000013",
    type: "auctions",
    order: 8,
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

  // Features Section
  {
    id: "section-features-1707300000014",
    type: "features",
    order: 9,
    enabled: true,
    config: {
      title: "Platform Features",
      features: ["feature_001", "feature_002", "feature_003", "feature_004"],
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },

  // Customer Reviews
  {
    id: "section-reviews-1707300000015",
    type: "reviews",
    order: 10,
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

  // WhatsApp Community
  {
    id: "section-whatsapp-1707300000016",
    type: "whatsapp-community",
    order: 11,
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

  // FAQ Section
  {
    id: "section-faq-1707300000008",
    type: "faq",
    order: 12,
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

  // Newsletter Signup
  {
    id: "section-newsletter-1707300000007",
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

  // Disabled Section (for testing)
  {
    id: "section-blog-1707300000017",
    type: "blog-articles",
    order: 14,
    enabled: false,
    config: {
      title: "From Our Blog",
      maxArticles: 4,
      showReadTime: true,
      showAuthor: true,
      showThumbnails: true,
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
  },
];
