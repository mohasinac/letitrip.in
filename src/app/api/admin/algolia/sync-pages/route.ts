/**
 * Admin Algolia Sync Pages Route
 *
 * POST /api/admin/algolia/sync-pages
 *
 * Fetches navigable pages (static routes, active categories, published blog
 * posts, active events) from Firestore and bulk-saves them to the Algolia
 * `pages_nav` index. Admin-only. Idempotent — safe to run multiple times.
 *
 * This powers the global search overlay's navigation suggestions. Run this
 * endpoint whenever categories, blog posts, or events are bulk-updated, or
 * after initial setup.
 */

import { createRouteHandler } from "@mohasinac/next";
import { successResponse } from "@/lib/api-response";
import {
  isAlgoliaConfigured,
  indexNavPages,
  ALGOLIA_PAGES_INDEX_NAME,
  type AlgoliaNavRecord,
} from "@mohasinac/search-algolia";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  CATEGORIES_COLLECTION,
  CATEGORY_FIELDS,
  BLOG_POSTS_COLLECTION,
  BLOG_POST_FIELDS,
  EVENTS_COLLECTION,
  EVENT_FIELDS,
  STORE_COLLECTION,
  STORE_FIELDS,
} from "@/db/schema";
import {
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SEO_CONFIG,
} from "@/constants";
import { ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

// ── Static pages ──────────────────────────────────────────────────────────────

const STATIC_NAV_PAGES: AlgoliaNavRecord[] = [
  {
    objectID: "/",
    title: "Home",
    subtitle: "LetItRip Marketplace",
    type: "page",
    url: "/",
    priority: 10,
  },
  {
    objectID: ROUTES.PUBLIC.PRODUCTS,
    title: "All Products",
    subtitle: "Browse everything",
    type: "page",
    url: ROUTES.PUBLIC.PRODUCTS,
    priority: 9,
  },
  {
    objectID: ROUTES.PUBLIC.AUCTIONS,
    title: "Auctions",
    subtitle: "Live & upcoming auctions",
    type: "page",
    url: ROUTES.PUBLIC.AUCTIONS,
    priority: 9,
  },
  {
    objectID: ROUTES.PUBLIC.CATEGORIES,
    title: "Categories",
    subtitle: "Shop by category",
    type: "page",
    url: ROUTES.PUBLIC.CATEGORIES,
    priority: 8,
  },
  {
    objectID: ROUTES.PUBLIC.BLOG,
    title: "Blog",
    subtitle: "Tips, news & guides",
    type: "page",
    url: ROUTES.PUBLIC.BLOG,
    priority: 6,
  },
  {
    objectID: ROUTES.PUBLIC.EVENTS,
    title: "Events",
    subtitle: "Sales & special offers",
    type: "page",
    url: ROUTES.PUBLIC.EVENTS,
    priority: 6,
  },
  {
    objectID: ROUTES.PUBLIC.SELLERS,
    title: "Sellers",
    subtitle: "Browse all stores",
    type: "page",
    url: ROUTES.PUBLIC.SELLERS,
    priority: 6,
  },
  {
    objectID: ROUTES.PUBLIC.STORES,
    title: "Stores",
    subtitle: "Find your favourite stores",
    type: "page",
    url: ROUTES.PUBLIC.STORES,
    priority: 6,
  },
  {
    objectID: ROUTES.PUBLIC.PROMOTIONS,
    title: "Promotions",
    subtitle: "Current deals & discounts",
    type: "page",
    url: ROUTES.PUBLIC.PROMOTIONS,
    priority: 7,
  },
  {
    objectID: ROUTES.PUBLIC.ABOUT,
    title: "About Us",
    type: "page",
    url: ROUTES.PUBLIC.ABOUT,
    priority: 3,
  },
  {
    objectID: ROUTES.PUBLIC.CONTACT,
    title: "Contact",
    type: "page",
    url: ROUTES.PUBLIC.CONTACT,
    priority: 3,
  },
  {
    objectID: ROUTES.PUBLIC.FAQS,
    title: "FAQs",
    subtitle: "Frequently asked questions",
    type: "page",
    url: ROUTES.PUBLIC.FAQS,
    priority: 4,
  },
  {
    objectID: ROUTES.PUBLIC.HELP,
    title: "Help",
    subtitle: "Support & guides",
    type: "page",
    url: ROUTES.PUBLIC.HELP,
    priority: 4,
  },
  {
    objectID: ROUTES.PUBLIC.SELLER_GUIDE,
    title: "Seller Guide",
    subtitle: "How to sell on LetItRip",
    type: "page",
    url: ROUTES.PUBLIC.SELLER_GUIDE,
    priority: 4,
  },
];

// ── Firestore helpers ─────────────────────────────────────────────────────────

async function fetchCategoryRecords(): Promise<AlgoliaNavRecord[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection(CATEGORIES_COLLECTION)
      .where(CATEGORY_FIELDS.IS_ACTIVE, "==", true)
      .select(
        CATEGORY_FIELDS.NAME,
        CATEGORY_FIELDS.SLUG,
        CATEGORY_FIELDS.DESCRIPTION,
      )
      .limit(500)
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      const slug = (data[CATEGORY_FIELDS.SLUG] as string | undefined) ?? doc.id;
      const url = `/categories/${slug}`;
      return {
        objectID: url,
        title: (data[CATEGORY_FIELDS.NAME] as string | undefined) ?? slug,
        subtitle:
          (data[CATEGORY_FIELDS.DESCRIPTION] as string | undefined) ??
          undefined,
        type: "category" as const,
        url,
        priority: 7,
      };
    });
  } catch (err) {
    serverLogger.warn("sync-pages: failed to fetch categories", { error: err });
    return [];
  }
}

async function fetchBlogRecords(): Promise<AlgoliaNavRecord[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection(BLOG_POSTS_COLLECTION)
      .where(
        BLOG_POST_FIELDS.STATUS,
        "==",
        BLOG_POST_FIELDS.STATUS_VALUES.PUBLISHED,
      )
      .select(
        BLOG_POST_FIELDS.TITLE,
        BLOG_POST_FIELDS.SLUG,
        BLOG_POST_FIELDS.EXCERPT,
        BLOG_POST_FIELDS.COVER_IMAGE,
      )
      .limit(1000)
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      const slug =
        (data[BLOG_POST_FIELDS.SLUG] as string | undefined) ?? doc.id;
      const url = ROUTES.BLOG.ARTICLE(slug);
      return {
        objectID: url,
        title: (data[BLOG_POST_FIELDS.TITLE] as string | undefined) ?? slug,
        subtitle:
          (data[BLOG_POST_FIELDS.EXCERPT] as string | undefined) ?? undefined,
        image:
          (data[BLOG_POST_FIELDS.COVER_IMAGE] as string | undefined) ??
          undefined,
        type: "blog" as const,
        url,
        priority: 5,
      };
    });
  } catch (err) {
    serverLogger.warn("sync-pages: failed to fetch blog posts", { error: err });
    return [];
  }
}

async function fetchEventRecords(): Promise<AlgoliaNavRecord[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection(EVENTS_COLLECTION)
      .where(EVENT_FIELDS.STATUS, "==", EVENT_FIELDS.STATUS_VALUES.ACTIVE)
      .select(
        EVENT_FIELDS.TITLE,
        EVENT_FIELDS.DESCRIPTION,
        EVENT_FIELDS.COVER_IMAGE_URL,
      )
      .limit(500)
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      const url = ROUTES.PUBLIC.EVENT_DETAIL(doc.id);
      return {
        objectID: url,
        title: (data[EVENT_FIELDS.TITLE] as string | undefined) ?? doc.id,
        subtitle:
          (data[EVENT_FIELDS.DESCRIPTION] as string | undefined) ?? undefined,
        image:
          (data[EVENT_FIELDS.COVER_IMAGE_URL] as string | undefined) ??
          undefined,
        type: "event" as const,
        url,
        priority: 6,
      };
    });
  } catch (err) {
    serverLogger.warn("sync-pages: failed to fetch events", { error: err });
    return [];
  }
}

async function fetchStoreRecords(): Promise<AlgoliaNavRecord[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection(STORE_COLLECTION)
      .where(STORE_FIELDS.STATUS, "==", STORE_FIELDS.STATUS_VALUES.ACTIVE)
      .where(STORE_FIELDS.IS_PUBLIC, "==", true)
      .select(
        STORE_FIELDS.STORE_NAME,
        STORE_FIELDS.STORE_SLUG,
        STORE_FIELDS.STORE_DESCRIPTION,
        STORE_FIELDS.STORE_LOGO_URL,
      )
      .limit(500)
      .get();

    return snap.docs.map((doc) => {
      const data = doc.data();
      const slug =
        (data[STORE_FIELDS.STORE_SLUG] as string | undefined) ?? doc.id;
      const url = ROUTES.PUBLIC.STORE_DETAIL(slug);
      return {
        objectID: url,
        title: (data[STORE_FIELDS.STORE_NAME] as string | undefined) ?? slug,
        subtitle:
          (data[STORE_FIELDS.STORE_DESCRIPTION] as string | undefined) ??
          undefined,
        image:
          (data[STORE_FIELDS.STORE_LOGO_URL] as string | undefined) ??
          undefined,
        type: "page" as const,
        url,
        priority: 5,
      };
    });
  } catch (err) {
    serverLogger.warn("sync-pages: failed to fetch stores", { error: err });
    return [];
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export const POST = createRouteHandler({
  auth: true,
  roles: ["admin"],
  handler: async () => {
    if (!isAlgoliaConfigured()) {
      throw new ValidationError(ERROR_MESSAGES.ADMIN.ALGOLIA_NOT_CONFIGURED);
    }

    const [categories, blogPosts, events, stores] = await Promise.all([
      fetchCategoryRecords(),
      fetchBlogRecords(),
      fetchEventRecords(),
      fetchStoreRecords(),
    ]);

    const records: AlgoliaNavRecord[] = [
      ...STATIC_NAV_PAGES,
      ...categories,
      ...blogPosts,
      ...events,
      ...stores,
    ];

    serverLogger.info("Starting Algolia pages sync", {
      static: STATIC_NAV_PAGES.length,
      categories: categories.length,
      blogPosts: blogPosts.length,
      events: events.length,
      stores: stores.length,
      total: records.length,
      index: ALGOLIA_PAGES_INDEX_NAME,
    });

    const result = await indexNavPages(records);

    serverLogger.info("Algolia pages sync completed", {
      indexed: result.indexed,
      index: ALGOLIA_PAGES_INDEX_NAME,
    });

    return successResponse(
      {
        indexed: result.indexed,
        index: ALGOLIA_PAGES_INDEX_NAME,
        breakdown: {
          static: STATIC_NAV_PAGES.length,
          categories: categories.length,
          blogPosts: blogPosts.length,
          events: events.length,
        },
      },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_PAGES_SYNCED,
    );
  },
});
