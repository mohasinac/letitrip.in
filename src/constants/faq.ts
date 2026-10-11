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
    description: "Launchers, parts, compatibility, and troubleshooting",
  },
  /*
   * 🛑 `scam_awareness` was MISSING from this map while THREE seeded FAQs
   * already carried it — so those rows had no chip and were unreachable from
   * the category UI. Root Cause #72's shape: the check that no chip names a
   * dead value never checked that every real value HAS a chip.
   */
  scam_awareness: {
    label: "Scam Awareness",
    icon: "🛡️",
    description: "Spotting fakes, unlabelled replicas, and off-platform scams",
  },
  /* D6b. See the `FAQCategory` union for why this is not `orders_payment`. */
  fees_and_taxes: {
    label: "Fees & Taxes",
    icon: "🧾",
    description: "GST, the platform fee, shipping costs, and what sellers receive",
  },
} as const;

export type FAQCategoryKey = keyof typeof FAQ_CATEGORIES;


