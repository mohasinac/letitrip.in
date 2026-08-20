import appkitConfig from "@/lib/appkit-config";

const s = appkitConfig.seo!;

type PageSeoEntry = { title: string; description: string; keywords: string[] };

export const SEO_CONFIG = {
  siteUrl: s.siteUrl,
  defaultTitle: s.defaultTitle ?? "",
  defaultDescription: s.defaultDescription ?? "",
  defaultImage: s.defaultImage ?? "/images/og-default.png",
  siteName: s.siteName ?? "",
  twitterHandle: s.twitterHandle ?? "",
  locale: s.locale ?? "en",
  pages: {
    home: {
      title: "LetItRip — India's Collectibles Marketplace",
      description:
        "Buy, sell & auction action figures, trading cards, spinning tops, model kits and more. India's largest collectibles marketplace.",
      keywords: ["collectibles", "beyblade", "trading cards", "action figures", "LetItRip"],
    } as PageSeoEntry,
    products: {
      title: "Products — LetItRip",
      description: "Browse Beyblade and collectibles listings on LetItRip.",
      keywords: ["products", "beyblade", "collectibles", "buy", "LetItRip"],
    } as PageSeoEntry,
    auctions: {
      title: "Auctions — LetItRip",
      description: "Bid on exclusive collectibles in live and upcoming auctions on LetItRip.",
      keywords: ["auctions", "bid", "live auction", "collectibles", "LetItRip"],
    } as PageSeoEntry,
    preOrders: {
      title: "Pre-Orders — LetItRip",
      description: "Reserve upcoming collectibles with pre-orders on LetItRip.",
      keywords: ["pre-order", "reserve", "upcoming", "collectibles", "LetItRip"],
    } as PageSeoEntry,
    categories: {
      title: "Categories — LetItRip",
      description: "Explore collectibles across all categories on LetItRip.",
      keywords: ["categories", "browse", "shop by category", "LetItRip"],
    } as PageSeoEntry,
    destinations: {
      title: "Categories — LetItRip",
      description: "Explore collectibles across all categories on LetItRip.",
      keywords: ["categories", "browse", "shop by category", "LetItRip"],
    } as PageSeoEntry,
    blog: {
      title: "Blog — LetItRip",
      description: "Stories, guides, and updates from the LetItRip team.",
      keywords: ["blog", "articles", "guides", "LetItRip"],
    } as PageSeoEntry,
    sellers: {
      title: "Sellers — LetItRip",
      description: "Meet the verified sellers on LetItRip.",
      keywords: ["sellers", "vendors", "stores", "LetItRip"],
    } as PageSeoEntry,
    contact: {
      title: "Contact — LetItRip",
      description: "Get in touch with the LetItRip team.",
      keywords: ["contact", "support", "help", "LetItRip"],
    } as PageSeoEntry,
    promotions: {
      title: "Promotions — LetItRip",
      description: "Exclusive deals, discounts, and promotions on LetItRip.",
      keywords: ["promotions", "deals", "discounts", "offers", "LetItRip"],
    } as PageSeoEntry,
  },
};

// Server-only helpers (generateMetadata, etc.) are exported from
// `src/constants/seo.server.ts` to avoid pulling server-only modules
// into client bundles that import `@/constants`.
