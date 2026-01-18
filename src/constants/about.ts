/**
 * About Page Constants
 *
 * Static content for the About Us page including company story,
 * products, features, and import sources.
 */

import { COMPANY_NAME } from "./navigation";

export const ABOUT_HERO = {
  title: `About ${COMPANY_NAME}`,
  subtitle: "India's Trusted Source for Authentic Imported Collectibles",
} as const;

export const ABOUT_STORY = {
  title: "Our Story",
  intro: `${COMPANY_NAME} - the famous battle cry from the Beyblade anime - perfectly captures our passion for authentic collectibles! We're India's premier seller of imported toys, trading cards, and collectibles from around the world.`,
  problem:
    "Founded by collectors, for collectors, we understand the frustration of finding authentic products in India. High customs duties, long shipping times, and the prevalence of fake products made it nearly impossible to enjoy your favorite collectibles.",
  solution: `That's why we created ${COMPANY_NAME} - to bring authentic collectibles directly to Indian fans, handling all the import hassles so you don't have to!`,
} as const;

export const PRODUCT_CATEGORIES = [
  {
    icon: "🎯",
    name: "Beyblades",
    description:
      "Authentic Takara Tomy - Burst, X, Metal Fusion, stadiums & launchers",
  },
  {
    icon: "🎴",
    name: "Pokemon TCG",
    description:
      "Official booster packs, elite trainer boxes, singles & collections",
  },
  {
    icon: "🃏",
    name: "Yu-Gi-Oh! TCG",
    description:
      "Konami originals - booster packs, structure decks, tins & rare cards",
  },
  {
    icon: "🤖",
    name: "Transformers",
    description:
      "Hasbro & Takara Tomy - Studio Series, Generations, Masterpiece",
  },
  {
    icon: "🏎️",
    name: "Hot Wheels",
    description: "Die-cast cars, premium editions, Car Culture, track sets",
  },
  {
    icon: "⭐",
    name: "Stickers",
    description:
      "Collectible stickers - anime, gaming, holographic, vinyl designs",
  },
  {
    icon: "🎨",
    name: "Crafts",
    description: "Japanese washi tape, origami, art supplies & DIY materials",
  },
  {
    icon: "🎁",
    name: "Collectibles",
    description:
      "Figurines, model kits, plushies, keychains & limited editions",
  },
] as const;

export const WHY_CHOOSE_US = [
  {
    icon: "✅",
    title: "100% Authentic Products",
    description:
      "We import directly from authorized distributors in Japan, USA, UK, China & Hong Kong. Every product is genuine - we guarantee it!",
  },
  {
    icon: "💰",
    title: "Zero Customs Charges for You",
    description:
      "We handle ALL import customs and duties. The price you see is the price you pay - no surprise charges at delivery!",
  },
  {
    icon: "🚀",
    title: "Fast India Delivery",
    description:
      "In-stock items (most Beyblades, Pokemon packs, Hot Wheels) ship in 3-7 days. Pre-orders take 15-25 days from order to doorstep.",
  },
  {
    icon: "💵",
    title: "COD Available",
    description:
      "Cash on Delivery available for in-stock items. Pay only when you receive your authentic collectibles!",
  },
  {
    icon: "🎯",
    title: "Collector-Friendly",
    description:
      "We're collectors ourselves! We understand the importance of packaging, authenticity certificates, and product condition.",
  },
  {
    icon: "🔄",
    title: "Easy Returns",
    description:
      "Returns to our India warehouse (₹100-300) vs ₹2,000-5,000 to ship back to Japan/USA. Much more affordable!",
  },
] as const;

export const IMPORT_SOURCES = [
  {
    flag: "🇯🇵",
    country: "Japan",
    products:
      "Takara Tomy Beyblades, Japanese Pokemon cards, Transformers, Washi tape, Stickers",
    colorClass: "from-red-50 to-white border-red-200",
  },
  {
    flag: "🇺🇸",
    country: "USA",
    products: "Pokemon TCG, Yu-Gi-Oh TCG, Hasbro Transformers, Hot Wheels",
    colorClass: "from-blue-50 to-white border-blue-200",
  },
  {
    flag: "🇨🇳",
    country: "China",
    products: "Licensed Beyblades, Hot Wheels, Collectibles, Crafts",
    colorClass: "from-yellow-50 to-white border-yellow-200",
  },
] as const;

export const OTHER_IMPORT_SOURCES =
  "Also importing from: 🇬🇧 UK (Pokemon TCG) • 🇭🇰 Hong Kong (Trading Cards, Collectibles)";

export const OUR_PROMISE = {
  title: "Our Promise to You",
  mainMessage:
    "Every product is 100% authentic. Every order is handled with care. Every customer gets the best service.",
  extendedMessage: `We're not just a store - we're fellow collectors who want to share the joy of authentic collectibles with India. When you shop with ${COMPANY_NAME}, you're shopping with people who understand and love these products as much as you do!`,
} as const;

export const CONTACT_CTA = {
  title: "Questions? We're Here to Help!",
  description:
    "Have questions about authenticity, shipping, or specific products? Our team is ready to assist you.",
  buttons: [
    {
      text: "Contact Support",
      href: "/support/ticket",
      variant: "primary" as const,
    },
    {
      text: "View FAQs",
      href: "/faq",
      variant: "secondary" as const,
    },
  ],
} as const;
