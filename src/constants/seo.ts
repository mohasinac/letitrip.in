// Minimal local SEO base to avoid importing server-only modules into client bundles.
const APPKIT_SEO_CONFIG = {
  siteUrl: "https://letitrip.in",
  defaultTitle: "letitrip — Curated Marketplace",
  defaultDescription:
    "Discover unique products, auctions, and pre-orders on letitrip — your curated online marketplace.",
  defaultImage: "/images/og-default.png",
  siteName: "letitrip",
  twitterHandle: "@letitrip",
  locale: "en-IN",
};

type PageSeoEntry = { title: string; description: string; keywords: string[] };

export const SEO_CONFIG = {
  ...APPKIT_SEO_CONFIG,
  pages: {
    home: {
      title: "letitrip — Curated Marketplace",
      description:
        "Discover unique products, auctions, and pre-orders on letitrip — your curated online marketplace.",
      keywords: ["marketplace", "shop", "buy online", "letitrip"],
    } as PageSeoEntry,
    products: {
      title: "Products — letitrip",
      description: "Browse our full range of products on letitrip.",
      keywords: ["products", "shop", "buy", "letitrip"],
    } as PageSeoEntry,
    auctions: {
      title: "Auctions — letitrip",
      description: "Bid on exclusive items in live and upcoming auctions.",
      keywords: ["auctions", "bid", "live auction", "letitrip"],
    } as PageSeoEntry,
    preOrders: {
      title: "Pre-Orders — letitrip",
      description: "Reserve upcoming products with pre-orders on letitrip.",
      keywords: ["pre-order", "reserve", "upcoming", "letitrip"],
    } as PageSeoEntry,
    categories: {
      title: "Categories — letitrip",
      description: "Explore products across all categories on letitrip.",
      keywords: ["categories", "browse", "shop by category", "letitrip"],
    } as PageSeoEntry,
    destinations: {
      title: "Categories — letitrip",
      description: "Explore products across all categories on letitrip.",
      keywords: ["categories", "browse", "shop by category", "letitrip"],
    } as PageSeoEntry,
    blog: {
      title: "Blog — letitrip",
      description: "Stories, guides, and updates from the letitrip team.",
      keywords: ["blog", "articles", "guides", "letitrip"],
    } as PageSeoEntry,
    sellers: {
      title: "Sellers — letitrip",
      description: "Meet the verified sellers and artisans on letitrip.",
      keywords: ["sellers", "vendors", "artisans", "letitrip"],
    } as PageSeoEntry,
    contact: {
      title: "Contact — letitrip",
      description: "Get in touch with the letitrip team.",
      keywords: ["contact", "support", "help", "letitrip"],
    } as PageSeoEntry,
    promotions: {
      title: "Promotions — letitrip",
      description: "Exclusive deals, discounts, and promotions on letitrip.",
      keywords: ["promotions", "deals", "discounts", "offers", "letitrip"],
    } as PageSeoEntry,
  },
};

// Server-only helpers (generateMetadata, etc.) are exported from
// `src/constants/seo.server.ts` to avoid pulling server-only modules
// into client bundles that import `@/constants`.

