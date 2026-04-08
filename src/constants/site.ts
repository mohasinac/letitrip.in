/**
 * Site Configuration Constants
 *
 * Centralized configuration for all site-wide information including:
 * - Brand identity (name, logo)
 * - Navigation routes
 * - Social media links
 * - User account routes
 * - Contact information
 * - SEO metadata
 *
 * This configuration should be the single source of truth for all
 * site links and brand information to ensure consistency across the app.
 *
 * @constant
 * @example
 * ```tsx
 * import { SITE_CONFIG } from '@/constants/site';
 *
 * <Link href={SITE_CONFIG.nav.home}>
 *   {SITE_CONFIG.brand.name}
 * </Link>
 * ```
 */

import { ROUTES } from "./routes";

export const SITE_CONFIG = {
  // Brand
  brand: {
    name: "LetItRip",
    shortName: "L",
    logoUrl: "/logo.png",
    logoAlt: "LetItRip - Multi-Seller E-commerce & Auction Platform",
    tagline: "Buy, Sell, Bid - All in One Place",
  },

  // Navigation links
  nav: {
    home: ROUTES.HOME,
    products: ROUTES.PUBLIC.PRODUCTS,
    auctions: ROUTES.PUBLIC.AUCTIONS,
    preOrders: ROUTES.PUBLIC.PRE_ORDERS,
    sellers: ROUTES.PUBLIC.SELLERS, // kept for "Sell on LetItRip" page
    stores: ROUTES.PUBLIC.STORES, // storefront directory
    events: ROUTES.PUBLIC.EVENTS,
    blog: ROUTES.PUBLIC.BLOG,
    categories: ROUTES.PUBLIC.CATEGORIES,
    promotions: ROUTES.PUBLIC.PROMOTIONS,
    reviews: ROUTES.PUBLIC.REVIEWS,
    about: ROUTES.PUBLIC.ABOUT,
    contact: ROUTES.PUBLIC.CONTACT,
  },

  // Social media links
  social: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
  },

  // User account links
  account: {
    profile: ROUTES.USER.PROFILE,
    settings: ROUTES.USER.SETTINGS,
    orders: ROUTES.USER.ORDERS,
    wishlist: ROUTES.USER.WISHLIST,
    addresses: ROUTES.USER.ADDRESSES,
    cart: ROUTES.USER.CART,
    login: ROUTES.AUTH.LOGIN,
    register: ROUTES.AUTH.REGISTER,
    forgotPassword: ROUTES.AUTH.FORGOT_PASSWORD,
    verifyEmail: ROUTES.AUTH.VERIFY_EMAIL,
  },

  // Contact info
  contact: {
    email: "info@letitrip.in",
    phone: "+91 22 4567 8900",
    address: "Mumbai, Maharashtra, India",
  },

  // SEO
  seo: {
    title: "LetItRip - Multi-Seller E-commerce & Auction Platform",
    description:
      "Discover unique products, join exciting auctions, and shop from multiple sellers on LetItRip",
    keywords: "e-commerce, marketplace, auctions, products, sellers",
  },
} as const;

/**
 * Feature flags
 * Set to false to disable a feature site-wide (API + UI).
 */
export const FEATURE_FLAGS = {
  /** Chat / messaging between buyers and sellers */
  CHAT_ENABLED: false,
} as const;
