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
  products: {
    label: "Products & Auctions",
    icon: "🛍️",
    description: "Product listings, auctions, bidding, and quality",
  },
  auctions: {
    label: "Auctions & Bidding",
    icon: "🔨",
    description: "How auctions work, bidding rules, winning, and payment",
  },
  preorders: {
    label: "Pre-Orders",
    icon: "📦",
    description:
      "Pre-order process, deposits, production timelines, and cancellations",
  },
  shipping: {
    label: "Shipping & Delivery",
    icon: "🚚",
    description: "Delivery times, tracking, shipping options, and COD",
  },
  returns: {
    label: "Returns & Refunds",
    icon: "🔄",
    description: "Return policy, refund process, and timelines",
  },
  payment: {
    label: "Payment & Coupons",
    icon: "💳",
    description: "Payment methods, COD deposit, coupons, and pricing",
  },
  account: {
    label: "Account & Security",
    icon: "👤",
    description: "Registration, login, verification, and profile",
  },
  sellers: {
    label: "For Sellers",
    icon: "🏪",
    description: "Selling guidelines, fees, payouts, and dashboard",
  },
} as const;

export type FAQCategoryKey = keyof typeof FAQ_CATEGORIES;
