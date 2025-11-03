/**
 * Dynamic Sitemap Generation
 * Generates sitemap.xml for search engines
 * Next.js 13+ App Router approach
 */

import { MetadataRoute } from "next";
import { getAdminDb } from "@/app/api/_lib/database/admin";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hobbiesspot.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/game`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  sitemapEntries.push(...staticPages);

  try {
    const db = getAdminDb();

    // Add categories
    const categoriesSnapshot = await db
      .collection("categories")
      .where("isActive", "==", true)
      .get();

    categoriesSnapshot.docs.forEach((doc: any) => {
      const category = doc.data();
      sitemapEntries.push({
        url: `${BASE_URL}/categories/${category.slug}`,
        lastModified: category.updatedAt?.toDate() || new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    // Add products (limit to active products)
    const productsSnapshot = await db
      .collection("products")
      .where("status", "==", "active")
      .limit(1000) // Limit for performance
      .get();

    productsSnapshot.docs.forEach((doc: any) => {
      const product = doc.data();
      sitemapEntries.push({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt?.toDate() || new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      });
    });

    // Add shops (active sellers)
    const shopsSnapshot = await db
      .collection("shops")
      .where("isActive", "==", true)
      .where("isVerified", "==", true)
      .limit(500)
      .get();

    shopsSnapshot.docs.forEach((doc: any) => {
      const shop = doc.data();
      sitemapEntries.push({
        url: `${BASE_URL}/shops/${shop.storeSlug}`,
        lastModified: shop.updatedAt?.toDate() || new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return at least static pages if database fails
  }

  return sitemapEntries;
}
