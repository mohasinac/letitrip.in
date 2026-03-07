/**
 * SEO Configuration Constants
 *
 * Centralized SEO metadata for all pages including Open Graph and Twitter Cards.
 * Use this to generate dynamic metadata for each page.
 */

import { Metadata } from "next";

export const SEO_CONFIG = {
  // Site-wide defaults
  siteName: "LetItRip",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://letitrip.in",
  defaultTitle: "LetItRip — Shop, Bid & Win | India's Multi-Seller Marketplace",
  defaultDescription:
    "Shop unique products, join live auctions, and sell from your own store on LetItRip — India's multi-seller marketplace for deals, bidding, and discovery.",
  defaultImage: "/og-image.jpg",
  twitterHandle: "@letitrip",
  locale: "en_IN",

  // Page-specific metadata
  pages: {
    home: {
      title: "LetItRip — Shop, Bid & Win | India's Multi-Seller Marketplace",
      description:
        "Shop unique products, join live auctions, and sell from your own store on LetItRip — India's multi-seller marketplace for deals, bidding, and discovery.",
      keywords: [
        "e-commerce",
        "marketplace",
        "auctions",
        "shopping",
        "online store India",
        "multi-seller platform",
        "bid online",
        "buy and sell",
      ],
    },
    destinations: {
      title: "Product Categories - Browse All Products",
      description:
        "Browse products by category. Find amazing deals and unique items from multiple sellers on LetItRip.",
      keywords: ["categories", "products", "shopping", "browse"],
    },
    services: {
      title: "Services - Find What You Need",
      description:
        "Discover a wide range of services from trusted providers. Book services for your needs.",
      keywords: ["services", "sellers", "providers", "marketplace"],
    },
    auctions: {
      title: "Auctions - Bid and Win",
      description:
        "Participate in exciting auctions. Bid on unique items and win amazing deals.",
      keywords: ["auctions", "bidding", "deals", "online auctions"],
    },
    preOrders: {
      title: "Pre-Orders - Reserve Before It Ships",
      description:
        "Reserve exclusive items before they\'re available. Pre-order new products and limited editions now.",
      keywords: [
        "pre-order",
        "reserve",
        "limited edition",
        "upcoming products",
      ],
    },
    products: {
      title: "Products - Shop Amazing Deals",
      description:
        "Shop a wide variety of products at great prices. Fast shipping and secure checkout.",
      keywords: ["shopping", "products", "online store", "deals"],
    },
    auth: {
      login: {
        title: "Login - LetItRip",
        description: "Sign in to your LetItRip account to access all features.",
        keywords: ["login", "sign in", "account"],
      },
      register: {
        title: "Create Account - LetItRip",
        description:
          "Join LetItRip today. Create your account and start exploring.",
        keywords: ["register", "sign up", "create account"],
      },
      forgotPassword: {
        title: "Forgot Password - LetItRip",
        description: "Reset your password to regain access to your account.",
        keywords: ["forgot password", "reset password"],
      },
    },
    user: {
      profile: {
        title: "My Profile - LetItRip",
        description: "View and manage your profile information.",
        keywords: ["profile", "account", "user settings"],
      },
      settings: {
        title: "Account Settings - LetItRip",
        description: "Manage your account settings and preferences.",
        keywords: ["settings", "account settings", "preferences"],
      },
      orders: {
        title: "My Orders - LetItRip",
        description: "View your order history and track current orders.",
        keywords: ["orders", "order history", "purchases"],
      },
      wishlist: {
        title: "My Wishlist - LetItRip",
        description: "View and manage your saved items.",
        keywords: ["wishlist", "saved items", "favorites"],
      },
      addresses: {
        title: "My Addresses - LetItRip",
        description: "Manage your shipping and billing addresses.",
        keywords: ["addresses", "shipping", "billing"],
      },
    },
    admin: {
      dashboard: {
        title: "Admin Dashboard - LetItRip",
        description: "Manage your LetItRip platform.",
        keywords: ["admin", "dashboard", "management"],
      },
      users: {
        title: "User Management - LetItRip Admin",
        description: "Manage users, roles, and permissions.",
        keywords: ["user management", "admin", "users"],
      },
    },
    blog: {
      title: "Blog - News, Tips & Updates",
      description:
        "Read the latest news, shopping tips, and platform updates from LetItRip.",
      keywords: ["blog", "news", "tips", "updates", "e-commerce"],
    },
    faqs: {
      title: "FAQs - Help & Support",
      description:
        "Find answers to frequently asked questions about LetItRip — shopping, selling, auctions, and more.",
      keywords: ["faq", "help", "support", "questions", "answers"],
    },
    about: {
      title: "About LetItRip",
      description:
        "Learn about LetItRip — our mission, team, and commitment to making online buying and selling better.",
      keywords: ["about", "mission", "company", "team"],
    },
    contact: {
      title: "Contact Us - LetItRip",
      description:
        "Get in touch with the LetItRip support team. We're here to help.",
      keywords: ["contact", "support", "help", "email"],
    },
    sellers: {
      title: "Seller Directory — Browse Trusted Sellers",
      description:
        "Browse our network of trusted sellers on LetItRip. Discover unique shops and products from verified merchants.",
      keywords: [
        "sellers",
        "shops",
        "directory",
        "marketplace",
        "verified sellers",
      ],
    },
    events: {
      title: "Events — Upcoming Sales, Drops & Community Events",
      description:
        "Don't miss flash sales, exclusive drops, and community events on LetItRip. Stay updated and participate.",
      keywords: ["events", "flash sale", "drops", "community", "promotions"],
    },
    stores: {
      title: "Stores — Explore Seller Storefronts",
      description:
        "Browse curated seller storefronts on LetItRip. Discover unique shops with their own brand identity, products, and reviews.",
      keywords: ["stores", "storefronts", "online shops", "seller stores"],
    },
    promotions: {
      title: "Promotions & Deals — Save Big on LetItRip",
      description:
        "Grab the latest promotions, discount codes, and limited-time deals. Save big on your favourite products.",
      keywords: ["promotions", "deals", "discounts", "coupons", "offers"],
    },
    reviews: {
      title: "Customer Reviews — Trusted Feedback on LetItRip",
      description:
        "Read honest customer reviews and ratings. See what buyers think about products and sellers on LetItRip.",
      keywords: ["reviews", "ratings", "customer feedback", "testimonials"],
    },
    sellerGuide: {
      title: "Seller Guide — Start Selling on LetItRip",
      description:
        "Everything you need to start selling on LetItRip. Learn how to set up your store, list products, and manage orders.",
      keywords: ["seller guide", "start selling", "merchant", "how to sell"],
    },
    cookiePolicy: {
      title: "Cookie Policy — LetItRip",
      description:
        "Learn about how LetItRip uses cookies and similar technologies to improve your browsing experience.",
      keywords: ["cookie policy", "cookies", "privacy"],
    },
    refundPolicy: {
      title: "Refund Policy — Returns & Refunds",
      description:
        "Understand our return and refund policy. Know your rights and how to request a refund on LetItRip.",
      keywords: ["refund policy", "returns", "refunds", "exchange"],
    },
    trackOrder: {
      title: "Track Your Order — LetItRip",
      description:
        "Track your order in real-time. Enter your order ID to see the latest shipping and delivery status.",
      keywords: [
        "track order",
        "order tracking",
        "shipping status",
        "delivery",
      ],
    },
  },
} as const;

/**
 * Generate metadata for a page
 * @param config Page-specific configuration
 * @returns Next.js Metadata object
 */
export function generateMetadata(config: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  path?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}): Metadata {
  const {
    title = SEO_CONFIG.defaultTitle,
    description = SEO_CONFIG.defaultDescription,
    keywords = [],
    image = SEO_CONFIG.defaultImage,
    path = "",
    type = "website",
    author,
    publishedTime,
    modifiedTime,
    noIndex = false,
  } = config;

  const url = `${SEO_CONFIG.siteUrl}${path}`;
  const fullTitle = title.includes(SEO_CONFIG.siteName)
    ? title
    : `${title} - ${SEO_CONFIG.siteName}`;
  const imageUrl = image.startsWith("http")
    ? image
    : `${SEO_CONFIG.siteUrl}${image}`;

  return {
    // Use absolute to bypass the root layout's title template ("%s | LetItRip").
    // generateMetadata already constructs the full branded title.
    title: { absolute: fullTitle },
    description,
    keywords: keywords.join(", "),
    authors: author ? [{ name: author }] : undefined,
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      type,
      locale: SEO_CONFIG.locale,
      url,
      siteName: SEO_CONFIG.siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      site: SEO_CONFIG.twitterHandle,
      creator: SEO_CONFIG.twitterHandle,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate metadata for a public user profile
 */
export function generateProfileMetadata(user: {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: string;
  uid: string;
}): Metadata {
  const profileName = user.displayName || user.email?.split("@")[0] || "User";
  const profileImage = user.photoURL || SEO_CONFIG.defaultImage;

  return generateMetadata({
    title: `${profileName}'s Profile`,
    description: `View ${profileName}'s profile on LetItRip. See their activity, orders, and more.`,
    keywords: ["profile", "user", profileName],
    image: profileImage,
    path: `/profile/${user.uid}`,
    type: "profile",
  });
}

// ─── Typed input shapes (lightweight, schema-compatible) ─────────────────────

export interface ProductSeoInput {
  title: string;
  description: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  mainImage?: string;
  category?: string;
}

export interface CategorySeoInput {
  name: string;
  slug: string;
  description?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

export interface BlogSeoInput {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  authorName?: string;
}

export interface AuctionSeoInput {
  title: string;
  slug: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  mainImage?: string;
  auctionEndDate?: Date;
}

// ─── Resource-specific metadata generators ───────────────────────────────────

/**
 * Generate metadata for a product detail page
 * Prefers seoTitle/seoDescription over auto-generated values
 */
export function generateProductMetadata(product: ProductSeoInput): Metadata {
  const title = product.seoTitle || product.title;
  const description =
    product.seoDescription ||
    product.description.slice(0, 160) ||
    `Buy ${product.title} on LetItRip.`;
  const keywords = product.seoKeywords || [
    product.title,
    ...(product.category ? [product.category] : []),
    "buy",
    "shop",
    "LetItRip",
  ];

  return generateMetadata({
    title,
    description,
    keywords,
    image: product.mainImage || SEO_CONFIG.defaultImage,
    path: `/products/${product.slug}`,
    type: "website",
  });
}

/**
 * Generate metadata for a category page
 * Prefers seo.title/seo.description over auto-generated values
 */
export function generateCategoryMetadata(category: CategorySeoInput): Metadata {
  const title = category.seo?.title || `${category.name} - LetItRip`;
  const description =
    category.seo?.description ||
    category.description ||
    `Shop ${category.name} products on LetItRip — great deals from multiple sellers.`;
  const keywords = category.seo?.keywords || [
    category.name,
    "products",
    "shop",
    "LetItRip",
  ];

  return generateMetadata({
    title,
    description,
    keywords,
    image: category.seo?.ogImage || SEO_CONFIG.defaultImage,
    path: `/categories/${category.slug}`,
    type: "website",
  });
}

/**
 * Generate metadata for a blog post page
 * Sets publishedTime/modifiedTime in OG tags
 */
export function generateBlogMetadata(post: BlogSeoInput): Metadata {
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  return generateMetadata({
    title,
    description,
    image: post.coverImage || SEO_CONFIG.defaultImage,
    path: `/blog/${post.slug}`,
    type: "article",
    author: post.authorName,
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt?.toISOString(),
  });
}

/**
 * Generate metadata for an auction detail page
 */
export function generateAuctionMetadata(auction: AuctionSeoInput): Metadata {
  const title = auction.seoTitle || `Auction: ${auction.title}`;
  const description =
    auction.seoDescription ||
    auction.description.slice(0, 160) ||
    `Bid on ${auction.title} — live auction on LetItRip.`;

  return generateMetadata({
    title,
    description,
    image: auction.mainImage || SEO_CONFIG.defaultImage,
    path: `/auctions/${auction.slug}`,
    type: "website",
  });
}

/**
 * Generate metadata for the search results page
 * Includes the active search query in the page title
 */
export function generateSearchMetadata(q: string, category?: string): Metadata {
  const queryLabel = q ? `"${q}"` : "All Products";
  const categoryLabel = category ? ` in ${category}` : "";
  const title = `Search: ${queryLabel}${categoryLabel}`;
  const description = `Search results for ${queryLabel}${categoryLabel} on LetItRip. Find great deals from multiple sellers.`;

  return generateMetadata({
    title,
    description,
    keywords: [q, ...(category ? [category] : []), "search", "LetItRip"],
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    noIndex: true, // Search results pages should not be indexed
  });
}
