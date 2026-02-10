/**
 * Site Settings Seed Data
 * Global site configuration (singleton document)
 */

import type { SiteSettingsDocument } from "@/db/schema";

export const siteSettingsSeedData: Partial<SiteSettingsDocument> = {
  id: "global",
  siteName: "LetItRip",
  motto: "Your Marketplace, Your Rules",
  logo: {
    url: "https://api.dicebear.com/7.x/shapes/svg?seed=letitrip",
    alt: "LetItRip Logo",
    format: "svg",
  },
  background: {
    light: {
      type: "gradient",
      value: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
      overlay: {
        enabled: false,
        color: "#000000",
        opacity: 0,
      },
    },
    dark: {
      type: "gradient",
      value: "linear-gradient(135deg, #030712 0%, #1f2937 100%)",
      overlay: {
        enabled: false,
        color: "#000000",
        opacity: 0,
      },
    },
  },
  contact: {
    email: "support@letitrip.in",
    phone: "+91-9876543210",
    address: "123, Marketplace Street, Mumbai, Maharashtra - 400001, India",
  },
  socialLinks: {
    facebook: "https://facebook.com/letitrip",
    twitter: "https://twitter.com/letitrip",
    instagram: "https://instagram.com/letitrip",
    linkedin: "https://linkedin.com/company/letitrip",
  },
  emailSettings: {
    fromName: "LetItRip",
    fromEmail: "noreply@letitrip.in",
    replyTo: "support@letitrip.in",
  },
  seo: {
    defaultTitle: "LetItRip - Multi-Seller E-Commerce & Auction Platform",
    defaultDescription:
      "Buy and sell products, participate in auctions. Shop electronics, fashion, home essentials, and more.",
    keywords: [
      "e-commerce",
      "marketplace",
      "auction",
      "online shopping",
      "multi-seller",
      "buy online",
      "sell online",
      "electronics",
      "fashion",
      "home essentials",
    ],
    ogImage:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=630&fit=crop",
  },
  features: [
    {
      id: "feature_001",
      name: "Wide Range",
      description: "1000+ Products Available",
      icon: "📦",
      enabled: true,
    },
    {
      id: "feature_002",
      name: "Fast Shipping",
      description: "Delivered in 3-5 Days",
      icon: "🚚",
      enabled: true,
    },
    {
      id: "feature_003",
      name: "100% Original",
      description: "Authentic Products Only",
      icon: "✅",
      enabled: true,
    },
    {
      id: "feature_004",
      name: "Secure Payments",
      description: "Safe & Encrypted Transactions",
      icon: "🔒",
      enabled: true,
    },
    {
      id: "feature_005",
      name: "Easy Returns",
      description: "7-Day Return Policy",
      icon: "↩️",
      enabled: true,
    },
    {
      id: "feature_006",
      name: "24/7 Support",
      description: "Always Here to Help",
      icon: "💬",
      enabled: true,
    },
  ],
  legalPages: {
    termsOfService: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Terms of Service" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Welcome to LetItRip. By accessing our platform, you agree to these terms...",
            },
          ],
        },
      ],
    }),
    privacyPolicy: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Privacy Policy" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Your privacy is important to us. This policy describes how we collect and use your data...",
            },
          ],
        },
      ],
    }),
    refundPolicy: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Refund Policy" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "We offer a 7-day return and refund policy on most products. Items must be in original condition...",
            },
          ],
        },
      ],
    }),
    shippingPolicy: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Shipping Policy" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days...",
            },
          ],
        },
      ],
    }),
  },
  shipping: {
    estimatedDays: 5,
    minOrderForFree: 999,
  },
  returns: {
    windowDays: 7,
  },
  faq: {
    variables: {
      shippingDays: 5,
      minOrderValue: 999,
      returnWindow: 7,
      supportEmail: "support@letitrip.in",
      supportPhone: "+91-9876543210",
      codDeposit: 0.1, // 10%
    },
  },
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2026-02-09T00:00:00Z"),
};
