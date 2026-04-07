/**
 * FAQ Category Constants
 *
 * Centralized FAQ category definitions used in FAQCategorySidebar,
 * FAQ pages, and any component that needs to enumerate FAQ categories.
 */

export const FAQ_CATEGORIES = {
  general: {
    label: "General",
    icon: "ℹ️",
    description: "About our platform, services, and policies",
  },
  orders_payment: {
    label: "Orders & Payment",
    icon: "💳",
    description: "Orders, payments, coupons, and billing help",
  },
  shipping_delivery: {
    label: "Shipping & Delivery",
    icon: "🚚",
    description: "Delivery times, tracking, shipping options, and COD",
  },
  returns_refunds: {
    label: "Returns & Refunds",
    icon: "🔄",
    description: "Return policy, refund process, and timelines",
  },
  product_information: {
    label: "Product Information",
    icon: "🛍️",
    description: "Product listings, quality, authenticity, and condition",
  },
  account_security: {
    label: "Account & Security",
    icon: "👤",
    description: "Registration, login, verification, and profile",
  },
  technical_support: {
    label: "Technical Support",
    icon: "🛠️",
    description: "App, account, and technical troubleshooting",
  },
} as const;

export type FAQCategoryKey = keyof typeof FAQ_CATEGORIES;
