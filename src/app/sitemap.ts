/**
 * @fileoverview TypeScript Module
 * @module src/app/sitemap
 * @description This file contains functionality related to sitemap
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { MetadataRoute } from "next";
import { safeToISOString, toISOStringOrDefault } from "@/lib/date-utils";
import { logError } from "@/lib/firebase-error-logger";

// Note: This is a server component, we can fetch data directly
/**
 * Function: Fetch Products
 */
/**
 * Fetches products from server
 *
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 */
/**
 * Fetches products from server
 *
 * @returns {Promise<any>} Promise resolving to products result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Fetches products from server
 *
 * @returns {Promise<any>} Promise resolving to products result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function fetchProducts() {
  try {
    const res = await fetch(
      "https://letitrip.in/api/products?status=active&limit=1000",
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data.products || [];
  } catch (error) {
    logError(error as Error, { component: "sitemap.products" });
    return [];
  }
}

/**
 * Function: Fetch Categories
 */
/**
 * Fetches categories from server
 *
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 */
/**
 * Fetches categories from server
 *
 * @returns {Promise<any>} Promise resolving to categories result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Fetches categories from server
 *
 * @returns {Promise<any>} Promise resolving to categories result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function fetchCategories() {
  try {
    const res = await fetch("https://letitrip.in/api/categories?limit=1000", {
      /** Next */
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data.categories || [];
  } catch (error) {
    logError(error as Error, { component: "sitemap.categories" });
    return [];
  }
}

/**
 * Function: Fetch Shops
 */
/**
 * Fetches shops from server
 *
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 */
/**
 * Fetches shops from server
 *
 * @returns {Promise<any>} Promise resolving to shops result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Fetches shops from server
 *
 * @returns {Promise<any>} Promise resolving to shops result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function fetchShops() {
  try {
    const res = await fetch(
      "https://letitrip.in/api/shops?status=active&limit=1000",
      {
        /** Next */
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data.shops || [];
  } catch (error) {
    logError(error as Error, { component: "sitemap.shops" });
    return [];
  }
}

/**
 * Function: Fetch Auctions
 */
/**
 * Fetches auctions from server
 *
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 */
/**
 * Fetches auctions from server
 *
 * @returns {Promise<any>} Promise resolving to auctions result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Fetches auctions from server
 *
 * @returns {Promise<any>} Promise resolving to auctions result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function fetchAuctions() {
  try {
    const res = await fetch(
      "https://letitrip.in/api/auctions?status=active&limit=1000",
      {
        /** Next */
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data.auctions || [];
  } catch (error) {
    logError(error as Error, { component: "sitemap.auctions" });
    return [];
  }
}

/**
 * Performs sitemap operation
 *
 * @returns {Promise<MetadataRoute.Sitemap>} Promise resolving to the sitemap data
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * const result = sitemap();
 */
export default /**
 * Performs sitemap operation
 *
 * @returns {Promise<MetadataRoute.Sitemap>} The sitemap result
 *
 */
async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://letitrip.in";
  const currentDate = new Date();

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      /** Url */
      url: baseUrl,
      /** Last Modified */
      lastModified: currentDate,
      /** Change Frequency */
      changeFrequency: "daily",
      /** Priority */
      priority: 1.0,
    },
    {
      /** Url */
      url: `${baseUrl}/about`,
      /** Last Modified */
      lastModified: currentDate,
      /** Change Frequency */
      changeFrequency: "monthly",
      /** Priority */
      priority: 0.8,
    },
    {
      /** Url */
      url: `${baseUrl}/faq`,
      /** Last Modified */
      lastModified: new Date("2025-11-07"),
      /** Change Frequency */
      changeFrequency: "weekly",
      /** Priority */
      priority: 0.9,
    },
    {
      /** Url */
      url: `${baseUrl}/categories`,
      /** Last Modified */
      lastModified: currentDate,
      /** Change Frequency */
      changeFrequency: "daily",
      /** Priority */
      priority: 0.9,
    },
    {
      /** Url */
      url: `${baseUrl}/shops`,
      /** Last Modified */
      lastModified: currentDate,
      /** Change Frequency */
      changeFrequency: "daily",
      /** Priority */
      priority: 0.9,
    },
    {
      /** Url */
      url: `${baseUrl}/cart`,
      /** Last Modified */
      lastModified: currentDate,
      /** Change Frequency */
      changeFrequency: "always",
      /** Priority */
      priority: 0.3,
    },
    {
      /** Url */
      url: `${baseUrl}/coupons`,
      /** Last Modified */
      lastModified: currentDate,
      /** Change Frequency */
      changeFrequency: "daily",
      /** Priority */
      priority: 0.7,
    },
    // Legal Pages
    {
      /** Url */
      url: `${baseUrl}/privacy-policy`,
      /** Last Modified */
      lastModified: new Date("2025-11-07"),
      /** Change Frequency */
      changeFrequency: "monthly",
      /** Priority */
      priority: 0.6,
    },
    {
      /** Url */
      url: `${baseUrl}/terms-of-service`,
      /** Last Modified */
      lastModified: new Date("2025-11-07"),
      /** Change Frequency */
      changeFrequency: "monthly",
      /** Priority */
      priority: 0.6,
    },
    {
      /** Url */
      url: `${baseUrl}/refund-policy`,
      /** Last Modified */
      lastModified: new Date("2025-11-07"),
      /** Change Frequency */
      changeFrequency: "monthly",
      /** Priority */
      priority: 0.7,
    },
    {
      /** Url */
      url: `${baseUrl}/shipping-policy`,
      /** Last Modified */
      lastModified: new Date("2025-11-07"),
      /** Change Frequency */
      changeFrequency: "monthly",
      /** Priority */
      priority: 0.7,
    },
    {
      /** Url */
      url: `${baseUrl}/cookie-policy`,
      /** Last Modified */
      lastModified: new Date("2025-11-07"),
      /** Change Frequency */
      changeFrequency: "monthly",
      /** Priority */
      priority: 0.5,
    },
    // Auth Pages (low priority, noindex in robots)
    {
      /** Url */
      url: `${baseUrl}/login`,
      /** Last Modified */
      lastModified: currentDate,
      /** Change Frequency */
      changeFrequency: "yearly",
      /** Priority */
      priority: 0.3,
    },
    {
      /** Url */
      url: `${baseUrl}/register`,
      /** Last Modified */
      lastModified: currentDate,
      /** Change Frequency */
      changeFrequency: "yearly",
      /** Priority */
      priority: 0.3,
    },
  ];

  // Fetch dynamic data
  const [products, categories, shops, auctions] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchShops(),
    fetchAuctions(),
  ]);

  // Dynamic product pages
  /**
 * Performs product pages operation
 *
 * @param {any} (product - The (product
 *
 * @returns {any} The productpages result
 *
 */
const productPages: MetadataRoute.Sitemap = products
    .filter((product: any) => product.slug) // Only include products with valid slugs
    .map((product: any) => {
      const lastMod = safeToISOString(product.updated_at || product.updatedAt);
      return {
        /** Url */
        url: `${baseUrl}/products/${product.slug}`,
        /** Last Modified */
        lastModified: lastMod ? new Date(lastMod) : currentDate,
        /** Change Frequency */
        ch/**
 * Performs category pages operation
 *
 * @param {any} (category - The (category
 *
 * @returns {any} The categorypages result
 *
 */
angeFrequency: "weekly" as const,
        /** Priority */
        priority: 0.8,
      };
    });

  // Dynamic category pages
  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((category: any) => category.slug)
    .map((category: any) => {
      const lastMod = safeToISOString(
        category.updated_at || category.updatedAt,
      );
      return {
        /** Url */
        url: `${baseUrl}/categories/${category.sl/**
 * Performs shop pages operation
 *
 * @param {any} (shop - The (shop
 *
 * @returns {any} The shoppages result
 *
 */
ug}`,
        /** Last Modified */
        lastModified: lastMod ? new Date(lastMod) : currentDate,
        /** Change Frequency */
        changeFrequency: "daily" as const,
        /** Priority */
        priority: 0.9,
      };
    });

  // Dynamic shop pages
  const shopPages: MetadataRoute.Sitemap = shops
    .filter((shop: any) => shop.slug)
    .map((shop: any) => {
      const lastMod = safeToIS/**
 * Performs auction pages operation
 *
 * @param {any} (auction - The (auction
 *
 * @returns {any} The auctionpages result
 *
 */
OString(shop.updated_at || shop.updatedAt);
      return {
        /** Url */
        url: `${baseUrl}/shops/${shop.slug}`,
        /** Last Modified */
        lastModified: lastMod ? new Date(lastMod) : currentDate,
        /** Change Frequency */
        changeFrequency: "daily" as const,
        /** Priority */
        priority: 0.7,
      };
    });

  // Dynamic auction pages
  const auctionPages: MetadataRoute.Sitemap = auctions
    .filter((auction: any) => auction.slug || auction.id)
    .map((auction: any) => {
      const lastMod = safeToISOString(auction.updated_at || auction.updatedAt);
      return {
        /** Url */
        url: `${baseUrl}/auctions/${auction.slug || auction.id}`,
        /** Last Modified */
        lastModified: lastMod ? new Date(lastMod) : currentDate,
        /** Change Frequency */
        changeFrequency: "hourly" as const,
        /** Priority */
        priority: 0.8,
      };
    });

  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...shopPages,
    ...auctionPages,
  ];
}
