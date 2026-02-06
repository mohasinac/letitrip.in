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
    home: "/",
    products: "/products",
    auctions: "/auctions",
    sellers: "/sellers",
    categories: "/categories",
    promotions: "/promotions",
    about: "/about",
    contact: "/contact",
    blog: "/blog",
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
    profile: "/user/profile",
    settings: "/user/settings",
    orders: "/user/orders",
    wishlist: "/user/wishlist",
    addresses: "/user/addresses",
    cart: "/cart",
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    verifyEmail: "/auth/verify-email",
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
