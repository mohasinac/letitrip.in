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
    logoAlt: "LetItRip Logo",
  },

  // Navigation links
  nav: {
    home: "/",
    products: "/products",
    auctions: "/auctions",
    shops: "/shops",
    stickers: "/stickers",
    about: "/about",
    services: "/services",
    contact: "/contact",
    blog: "/blog",
    destinations: "/destinations",
    categories: "/categories",
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
    profile: "/profile",
    settings: "/settings",
    orders: "/orders",
    wishlist: "/wishlist",
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
    address: "123 Travel Street, City, Country",
  },

  // SEO
  seo: {
    title: "LetItRip - Your Travel Companion",
    description:
      "Discover amazing travel experiences and destinations with LetItRip",
    keywords: "travel, destinations, trips, vacation",
  },
} as const;
