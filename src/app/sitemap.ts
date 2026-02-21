import type { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  PRODUCT_COLLECTION,
  PRODUCT_FIELDS,
  CATEGORY_FIELDS,
} from "@/db/schema";
import { CATEGORIES_COLLECTION } from "@/db/schema";
import { serverLogger } from "@/lib/server-logger";
import { ROUTES } from "@/constants";

const BASE_URL = SEO_CONFIG.siteUrl;

/** Static public pages included in every sitemap */
const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.PRODUCTS}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.AUCTIONS}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.CATEGORIES}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.BLOG}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.SELLERS}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.ABOUT}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.CONTACT}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.FAQS}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.TERMS}`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.PRIVACY}`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${BASE_URL}${ROUTES.PUBLIC.HELP}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

async function fetchProductUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection(PRODUCT_COLLECTION)
      .where(
        PRODUCT_FIELDS.STATUS,
        "==",
        PRODUCT_FIELDS.STATUS_VALUES.PUBLISHED,
      )
      .select(
        PRODUCT_FIELDS.SLUG,
        PRODUCT_FIELDS.ID,
        PRODUCT_FIELDS.UPDATED_AT ?? "updatedAt",
      )
      .limit(5000)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const slugOrId: string =
        (data[PRODUCT_FIELDS.SLUG] as string | undefined) ?? doc.id;
      return {
        url: `${BASE_URL}${ROUTES.PUBLIC.PRODUCT_DETAIL(slugOrId)}`,
        lastModified: data.updatedAt?.toDate?.() ?? new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      };
    });
  } catch (err) {
    serverLogger.warn("sitemap: failed to fetch product URLs", { error: err });
    return [];
  }
}

async function fetchCategoryUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection(CATEGORIES_COLLECTION)
      .where(CATEGORY_FIELDS.IS_ACTIVE ?? "isActive", "==", true)
      .select(CATEGORY_FIELDS.SLUG, CATEGORY_FIELDS.UPDATED_AT ?? "updatedAt")
      .limit(500)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const slug: string =
        (data[CATEGORY_FIELDS.SLUG] as string | undefined) ?? doc.id;
      return {
        url: `${BASE_URL}/categories/${slug}`,
        lastModified: data.updatedAt?.toDate?.() ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });
  } catch (err) {
    serverLogger.warn("sitemap: failed to fetch category URLs", { error: err });
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productUrls, categoryUrls] = await Promise.all([
    fetchProductUrls(),
    fetchCategoryUrls(),
  ]);

  return [...STATIC_PAGES, ...categoryUrls, ...productUrls];
}

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Re-generate at most once per hour
