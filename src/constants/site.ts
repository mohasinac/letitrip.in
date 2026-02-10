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
    sellers: ROUTES.PUBLIC.SELLERS,
    categories: ROUTES.PUBLIC.CATEGORIES,
    promotions: ROUTES.PUBLIC.PROMOTIONS,
    about: ROUTES.PUBLIC.ABOUT,
    contact: ROUTES.PUBLIC.CONTACT,
    blog: ROUTES.PUBLIC.BLOG,
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
    phone: "+1 (555) 123-4567",
    address: "123 Marketplace Street, City, Country",
  },

  // SEO
  seo: {
    title: "LetItRip - Multi-Seller E-commerce & Auction Platform",
    description:
      "Discover unique products, join exciting auctions, and shop from multiple sellers on LetItRip",
    keywords: "e-commerce, marketplace, auctions, products, sellers",
  },
} as const;
