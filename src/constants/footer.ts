/**
 * @fileoverview TypeScript Module
 * @module src/constants/footer
 * @description This file contains functionality related to footer
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

// Footer Constants

// About Links (Column 1)
/**
 * About Links
 * @constant
 */
export const ABOUT_LINKS = [
  { id: "about", name: "About Let It Rip", link: "/about" },
  { id: "terms", name: "Terms of Service", link: "/terms-of-service" },
  { id: "privacy", name: "Privacy Policy", link: "/privacy-policy" },
  { id: "refund", name: "Refund Policy", link: "/refund-policy" },
  { id: "shipping", name: "Shipping Policy", link: "/shipping-policy" },
  { id: "cookie", name: "Cookie Policy", link: "/cookie-policy" },
];

// Shopping Notes (Column 2)
/**
 * Shopping Notes
 * @constant
 */
export const SHOPPING_NOTES = [
  { id: "faq", name: "FAQ", link: "/faq" },
  { id: "new-user", name: "New Users' Guide", link: "/guide/new-user" },
  { id: "returns", name: "Returns & Refunds", link: "/guide/returns" },
  { id: "prohibited", name: "Prohibited Items", link: "/guide/prohibited" },
];

// Fee Description (Column 3)
/**
 * Fee Description
 * @constant
 */
export const FEE_DESCRIPTION = [
  { id: "payment", name: "Payment Methods", link: "/fees/payment" },
  { id: "structure", name: "Fee Structure", link: "/fees/structure" },
  { id: "optional", name: "Optional Services", link: "/fees/optional" },
  { id: "shipping", name: "International Shipping", link: "/fees/shipping" },
];

// Company Information (Column 4)
/**
 * Company Info
 * @constant
 */
export const COMPANY_INFO = [
  { id: "overview", name: "Company Overview", link: "/company/overview" },
  { id: "ticket", name: "Customer Ticket", link: "/support/ticket" },
];

// Payment Method Logos
/**
 * Payment Methods
 * @constant
 */
export const PAYMENT_METHODS = [
  { id: "visa", name: "Visa", logo: "/payments/visa.svg" },
  { id: "mastercard", name: "Mastercard", logo: "/payments/mastercard.svg" },
  { id: "jcb", name: "JCB", logo: "/payments/jcb.svg" },
  { id: "amex", name: "American Express", logo: "/payments/amex.svg" },
  { id: "dinersclub", name: "Diners Club", logo: "/payments/dinersclub.svg" },
  { id: "discover", name: "Discover", logo: "/payments/discover.svg" },
  { id: "paypal", name: "PayPal", logo: "/payments/paypal.svg" },
  { id: "paidy", name: "Paidy", logo: "/payments/paidy.svg" },
  { id: "alipay", name: "Alipay+", logo: "/payments/alipay.svg" },
  { id: "unionpay", name: "UnionPay", logo: "/payments/unionpay.svg" },
  { id: "atome", name: "Atome", logo: "/payments/atome.svg" },
];

// Language Options
/**
 * Languages
 * @constant
 */
export const LANGUAGES = [
  { code: "en", name: "EN", fullName: "English" },
  { code: "ja", name: "日本語", fullName: "Japanese" },
  { code: "ko", name: "한국어", fullName: "Korean" },
  { code: "zh-cn", name: "简体中文", fullName: "Simplified Chinese" },
  { code: "zh-tw", name: "繁體中文", fullName: "Traditional Chinese" },
  { code: "de", name: "Deutsch", fullName: "German" },
  { code: "it", name: "Italiano", fullName: "Italian" },
  { code: "es", name: "Español", fullName: "Spanish" },
  { code: "fr", name: "Français", fullName: "French" },
  { code: "pl", name: "Polski", fullName: "Polish" },
  { code: "ar", name: "العربية", fullName: "Arabic" },
  { code: "ms", name: "Bahasa Melayu", fullName: "Malay" },
  { code: "th", name: "ภาษาไทย", fullName: "Thai" },
  { code: "tr", name: "Türkçe", fullName: "Turkish" },
  { code: "pt", name: "Português", fullName: "Portuguese" },
  { code: "id", name: "Bahasa Indonesia", fullName: "Indonesian" },
  { code: "ru", name: "Русский", fullName: "Russian" },
];

// Social Media Links
/**
 * Social Links
 * @constant
 */
export const SOCIAL_LINKS = [
  {
    /** Id */
    id: "facebook",
    /** Name */
    name: "Facebook",
    link: "https://facebook.com",
    /** Icon */
    icon: "facebook",
  },
  {
    /** Id */
    id: "youtube",
    /** Name */
    name: "YouTube",
    link: "https://youtube.com",
    /** Icon */
    icon: "youtube",
  },
  {
    /** Id */
    id: "twitter",
    /** Name */
    name: "Twitter",
    link: "https://twitter.com",
    /** Icon */
    icon: "twitter",
  },
  {
    /** Id */
    id: "instagram",
    /** Name */
    name: "Instagram",
    link: "https://instagram.com",
    /** Icon */
    icon: "instagram",
  },
];

/**
 * Copyright Text
 * @constant
 */
export const COPYRIGHT_TEXT =
  "Copyright © 2015-2025 letitrip.com. All Rights Reserved";

/**
 * Support Info
 * @constant
 */
export const SUPPORT_INFO = {
  /** Title */
  title: "Need help? Please use the Customer Ticket",
  /** Ticket Link */
  ticketLink: "/support/ticket",
};
