/**
 * Brand Constants
 *
 * Single source of truth for LetItRip brand identity strings and social URLs.
 * Import from here instead of hardcoding brand strings in components.
 */

export const BRAND = {
  NAME: "LetItRip",
  SHORT_NAME: "LT",
  DESCRIPTION:
    "India's collector-first marketplace for figures, TCG gear, cosplay, and curated collectibles. Trusted sellers, authentic products.",
  MADE_IN_TEXT: "Made with ♥ for collectors",
  SOCIAL_URLS: {
    INSTAGRAM: "https://instagram.com/letitrip.in",
    TWITTER: "https://twitter.com/letitrip_in",
    WHATSAPP: "https://wa.me/c/917000000000",
  },
} as const;

export function getBrandCopyright(year = new Date().getFullYear()): string {
  return `© ${year} ${BRAND.NAME}. All rights reserved.`;
}
