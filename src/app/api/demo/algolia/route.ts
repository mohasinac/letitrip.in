/**
 * Dev-Only Algolia Operations Route
 *
 * POST /api/demo/algolia
 *
 * Handles sync and clear for both Algolia indexes without requiring auth.
 * Dev-only — returns 403 in production.
 *
 * Body: { action: "sync" | "clear", target: "products" | "pages" }
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { serverLogger } from "@/lib/server-logger";
import {
  isAlgoliaConfigured,
  indexProducts,
  indexNavPages,
  clearAlgoliaIndex,
  ALGOLIA_INDEX_NAME,
  ALGOLIA_PAGES_INDEX_NAME,
  type AlgoliaNavRecord,
} from "@mohasinac/search-algolia";
import { productRepository } from "@/repositories";
import {
  CATEGORIES_COLLECTION,
  CATEGORY_FIELDS,
  BLOG_POSTS_COLLECTION,
  BLOG_POST_FIELDS,
  EVENTS_COLLECTION,
  EVENT_FIELDS,
} from "@/db/schema";
import { ROUTES } from "@/constants";

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
    serverLogger.warn("demo/algolia: failed to fetch categories", {
      error: err,
    });
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
    serverLogger.warn("demo/algolia: failed to fetch blog posts", {
      error: err,
    });
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
    serverLogger.warn("demo/algolia: failed to fetch events", { error: err });
    return [];
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Not available in production" },
      { status: 403 },
    );
  }

  if (!isAlgoliaConfigured()) {
    return NextResponse.json(
      { success: false, error: "Algolia is not configured" },
      { status: 503 },
    );
  }

  let body: { action?: string; target?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { action, target } = body;

  if (
    !action ||
    !target ||
    !["sync", "clear"].includes(action) ||
    !["products", "pages"].includes(target)
  ) {
    return NextResponse.json(
      { success: false, error: "Invalid action or target" },
      { status: 400 },
    );
  }

  try {
    if (action === "clear") {
      const indexName =
        target === "products" ? ALGOLIA_INDEX_NAME : ALGOLIA_PAGES_INDEX_NAME;
      await clearAlgoliaIndex(indexName);
      serverLogger.warn(`[dev] Algolia ${indexName} cleared`);
      return NextResponse.json({
        success: true,
        data: { cleared: true, index: indexName },
      });
    }

    if (action === "sync" && target === "products") {
      const all = await productRepository.findAll();
      const published = all.filter((p) => p.status === "published");
      const result = await indexProducts(published);
      serverLogger.info(`[dev] Algolia products synced`, {
        indexed: result.indexed,
      });
      return NextResponse.json({
        success: true,
        data: {
          indexed: result.indexed,
          total: all.length,
          skipped: all.length - published.length,
        },
      });
    }

    if (action === "sync" && target === "pages") {
      const [categories, blogPosts, events] = await Promise.all([
        fetchCategoryRecords(),
        fetchBlogRecords(),
        fetchEventRecords(),
      ]);
      const records: AlgoliaNavRecord[] = [
        ...STATIC_NAV_PAGES,
        ...categories,
        ...blogPosts,
        ...events,
      ];
      const result = await indexNavPages(records);
      serverLogger.info(`[dev] Algolia pages_nav synced`, {
        indexed: result.indexed,
      });
      return NextResponse.json({
        success: true,
        data: { indexed: result.indexed, total: records.length },
      });
    }

    return NextResponse.json(
      { success: false, error: "Unhandled action/target combination" },
      { status: 400 },
    );
  } catch (err: unknown) {
    serverLogger.error("[dev] Algolia operation failed", { error: err });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Operation failed",
      },
      { status: 500 },
    );
  }
}
