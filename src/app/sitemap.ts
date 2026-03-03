import type { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  PRODUCT_COLLECTION,
  PRODUCT_FIELDS,
  CATEGORY_FIELDS,
  EVENTS_COLLECTION,
  EVENT_FIELDS,
  BLOG_POSTS_COLLECTION,
  BLOG_POST_FIELDS,
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
    url: `${BASE_URL}${ROUTES.PUBLIC.EVENTS}`,
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

async function fetchEventUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection(EVENTS_COLLECTION)
      .where(EVENT_FIELDS.STATUS, "==", EVENT_FIELDS.STATUS_VALUES.ACTIVE)
      .select(EVENT_FIELDS.UPDATED_AT)
      .limit(500)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${BASE_URL}${ROUTES.PUBLIC.EVENT_DETAIL(doc.id)}`,
        lastModified:
          (
            data[EVENT_FIELDS.UPDATED_AT] as { toDate?: () => Date } | undefined
          )?.toDate?.() ?? new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      };
    });
  } catch (err) {
    serverLogger.warn("sitemap: failed to fetch event URLs", { error: err });
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

async function fetchBlogPostUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection(BLOG_POSTS_COLLECTION)
      .where(
        BLOG_POST_FIELDS.STATUS,
        "==",
        BLOG_POST_FIELDS.STATUS_VALUES.PUBLISHED,
      )
      .select(
        BLOG_POST_FIELDS.SLUG,
        BLOG_POST_FIELDS.PUBLISHED_AT,
        BLOG_POST_FIELDS.UPDATED_AT,
      )
      .limit(1000)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const slug: string =
        (data[BLOG_POST_FIELDS.SLUG] as string | undefined) ?? doc.id;
      const updatedAt =
        (
          data[BLOG_POST_FIELDS.UPDATED_AT] as
            | { toDate?: () => Date }
            | undefined
        )?.toDate?.() ??
        (
          data[BLOG_POST_FIELDS.PUBLISHED_AT] as
            | { toDate?: () => Date }
            | undefined
        )?.toDate?.() ??
        new Date();
      return {
        url: `${BASE_URL}${ROUTES.BLOG.ARTICLE(slug)}`,
        lastModified: updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });
  } catch (err) {
    serverLogger.warn("sitemap: failed to fetch blog post URLs", {
      error: err,
    });
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productUrls, categoryUrls, eventUrls, blogUrls] = await Promise.all([
    fetchProductUrls(),
    fetchCategoryUrls(),
    fetchEventUrls(),
    fetchBlogPostUrls(),
  ]);

  return [
    ...STATIC_PAGES,
    ...categoryUrls,
    ...blogUrls,
    ...productUrls,
    ...eventUrls,
  ];
}

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Re-generate at most once per hour
