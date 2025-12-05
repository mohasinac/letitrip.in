/**
 * @fileoverview TypeScript Module
 * @module src/lib/seo/metadata
 * @description This file contains functionality related to metadata
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Metadata } from "next";

/**
 * Base metadata configuration for the site
 */
export const siteConfig = {
  /** Name */
  name: "Let It Rip",
  /** Description */
  description:
    "India's trusted seller of authentic imported collectibles - Beyblades, Pokemon TCG, Yu-Gi-Oh TCG, Transformers, Hot Wheels, stickers & more! In-stock items ship in 3-7 days. We handle all customs - you pay zero import duties!",
  url: "https://letitrip.in",
  ogImage: "https://letitrip.in/og-image.jpg",
  /** Links */
  links: {
    twitter: "https://twitter.com/letitrip",
    facebook: "https://facebook.com/letitrip",
    instagram: "https://instagram.com/letitrip",
  },
};

/**
 * Default metadata for all pages
 */
export const defaultMetadata: Metadata = {
  /** Metadata Base */
  metadataBase: new URL(siteConfig.url),
  /** Title */
  title: {
    /** Default */
    default: siteConfig.name,
    /** Template */
    template: `%s | ${siteConfig.name}`,
  },
  /** Description */
  description: siteConfig.description,
  /** Keywords */
  keywords: [
    // Product categories - Collectibles focus
    "beyblades India",
    "Pokemon TCG India",
    "Yu-Gi-Oh TCG India",
    "Transformers India",
    "Hot Wheels India",
    "collectible stickers India",
    "trading cards India",
    "imported collectibles India",
    "anime collectibles India",
    "authentic beyblades",
    "Pokemon cards India",
    "Yu-Gi-Oh cards India",
    "Transformers toys India",
    "die-cast cars India",
    "crafts supplies India",
    // Value propositions
    "no customs charges India",
    "fast delivery India",
    "COD on collectibles",
    "authentic imported collectibles",
    "beyblade online India",
    "Pokemon TCG online India",
    // Country-specific
    "Japan collectibles India",
    "USA collectibles India",
    "authentic Japanese beyblades",
  ],
  /** Authors */
  authors: [{ name: "Let It Rip" }],
  /** Creator */
  creator: "Let It Rip",
  /** Publisher */
  publisher: "Let It Rip",
  /** Format Detection */
  formatDetection: {
    /** Email */
    email: false,
    /** Address */
    address: false,
    /** Telephone */
    telephone: false,
  },
  /** Open Graph */
  openGraph: {
    /** Type */
    type: "website",
    /** Locale */
    locale: "en_IN",
    /** Url */
    url: siteConfig.url,
    /** Title */
    title: siteConfig.name,
    /** Description */
    description: siteConfig.description,
    /** Site Name */
    siteName: siteConfig.name,
    /** Images */
    images: [
      {
        /** Url */
        url: siteConfig.ogImage,
        /** Width */
        width: 1200,
        /** Height */
        height: 630,
        /** Alt */
        alt: siteConfig.name,
      },
    ],
  },
  /** Twitter */
  twitter: {
    /** Card */
    card: "summary_large_image",
    /** Title */
    title: siteConfig.name,
    /** Description */
    description: siteConfig.description,
    /** Images */
    images: [siteConfig.ogImage],
    /** Creator */
    creator: "@letitrip",
  },
  /** Robots */
  robots: {
    /** Index */
    index: true,
    /** Follow */
    follow: true,
    /** Google Bot */
    googleBot: {
      /** Index */
      index: true,
      /** Follow */
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  /** Icons */
  icons: {
    /** Icon */
    icon: "/favicon.ico",
    /** Shortcut */
    shortcut: "/favicon-16x16.png",
    /** Apple */
    apple: "/apple-touch-icon.png",
  },
  /** Manifest */
  manifest: "/manifest.json",
};

/**
 * Generate metadata for a page
 */
/**
 * Performs generate metadata operation
 *
 * @returns {any} The metadata result
 *
 * @example
 * generateMetadata();
 */

/**
 * Performs generate metadata operation
 *
 * @returns {any} The metadata result
 *
 * @example
 * generateMetadata();
 */

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  path = "",
  noIndex = false,
}: {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Keywords */
  keywords?: string[];
  /** Image */
  image?: string;
  /** Path */
  path?: string;
  /** No Index */
  noIndex?: boolean;
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || `${siteConfig.url}/og-image.jpg`;

  return {
    /** Title */
    title: `${title} - ${siteConfig.name}`,
    description,
    /** Keywords */
    keywords: keywords || defaultMetadata.keywords,
    /** Authors */
    authors: [{ name: siteConfig.name }],
    /** Alternates */
    alternates: {
      /** Canonical */
      canonical: url,
    },
    /** Open Graph */
    openGraph: {
      /** Title */
      title: `${title} - ${siteConfig.name}`,
      description,
      url,
      /** Site Name */
      siteName: siteConfig.name,
      /** Images */
      images: [
        {
          /** Url */
          url: ogImage,
          /** Width */
          width: 1200,
          /** Height */
          height: 630,
          /** Alt */
          alt: title,
        },
      ],
      /** Locale */
      locale: "en_IN",
      /** Type */
      type: "website",
    },
    /** Twitter */
    twitter: {
      /** Card */
      card: "summary_large_image",
      /** Title */
      title: `${title} - ${siteConfig.name}`,
      description,
      /** Images */
      images: [ogImage],
    },
    /** Robots */
    robots: noIndex
      ? {
          /** Index */
          index: false,
          /** Follow */
          follow: false,
        }
      : {
          /** Index */
          index: true,
          /** Follow */
          follow: true,
          /** Google Bot */
          googleBot: {
            /** Index */
            index: true,
            /** Follow */
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

/**
 * Generate product metadata
 */
/**
 * Performs generate product metadata operation
 *
 * @returns {any} The productmetadata result
 *
 * @example
 * generateProductMetadata();
 */

/**
 * Performs generate product metadata operation
 *
 * @returns {any} The productmetadata result
 *
 * @example
 * generateProductMetadata();
 */

export function generateProductMetadata({
  title,
  description,
  image,
  price,
  currency = "INR",
  availability = "in stock",
  condition = "new",
  canonical,
}: {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Image */
  image: string;
  /** Price */
  price: number;
  /** Currency */
  currency?: string;
  /** Availability */
  availability?: string;
  /** Condition */
  condition?: string;
  /** Canonical */
  canonical?: string;
}): Metadata {
  return {
    title,
    description,
    /** Open Graph */
    openGraph: {
      /** Type */
      type: "website",
      title,
      description,
      /** Images */
      images: [image],
      /** Url */
      url: canonical,
    },
    /** Twitter */
    twitter: {
      /** Card */
      card: "summary_large_image",
      title,
      description,
      /** Images */
      images: [image],
    },
    /** Alternates */
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    // Product-specific metadata
    /** Other */
    other: {
      "product:price:amount": price.toString(),
      "product:price:currency": currency,
      "product:availability": availability,
      "product:condition": condition,
    },
  };
}

/**
 * Generate breadcrumb list for structured data
 */
/**
 * Performs generate breadcrumb list operation
 *
 * @param {Array<{ name} items - The items
 *
 * @returns {string} The breadcrumblist result
 *
 * @example
 * generateBreadcrumbList([]);
 */

/**
 * Performs generate breadcrumb list operation
 *
 * @param {Array<{ name} /** Items */
  items - The /**  items */
  items
 *
 * @returns {string} The breadcrumblist result
 *
 * @example
 * generateBreadcrumbList([]);
 */

export function generateBreadcrumbList(
  /** Items */
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    /** Item List Element */
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      /** Position */
      position: index + 1,
      /** Name */
      name: item.name,
      /** Item */
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}
