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
  defaultTitle: "LetItRip - Your Ultimate Travel & E-commerce Platform",
  defaultDescription:
    "Discover amazing travel destinations, shop products, join auctions, and explore unique services on LetItRip.",
  defaultImage: "/og-image.jpg",
  twitterHandle: "@letitrip",
  locale: "en_US",

  // Page-specific metadata
  pages: {
    home: {
      title: "LetItRip - Your Ultimate Travel & E-commerce Platform",
      description:
        "Discover amazing travel destinations, shop products, join auctions, and explore unique services.",
      keywords: [
        "travel",
        "e-commerce",
        "auctions",
        "shopping",
        "destinations",
        "services",
      ],
    },
    destinations: {
      title: "Travel Destinations - Explore the World",
      description:
        "Browse amazing travel destinations around the world. Find your next adventure with LetItRip.",
      keywords: ["travel destinations", "vacation", "tourism", "explore"],
    },
    services: {
      title: "Services - Find What You Need",
      description:
        "Discover a wide range of services from trusted providers. Book services for your needs.",
      keywords: ["services", "booking", "providers", "local services"],
    },
    auctions: {
      title: "Auctions - Bid and Win",
      description:
        "Participate in exciting auctions. Bid on unique items and win amazing deals.",
      keywords: ["auctions", "bidding", "deals", "online auctions"],
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
    title: fullTitle,
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
