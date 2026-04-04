"use server";

/**
 * Algolia Server Actions
 *
 * Admin-only actions for Algolia index sync/clear operations.
 * Replaces direct apiClient.post() calls in mutation hooks.
 */

import { requireRole } from "@/lib/firebase/auth-server";
import {
  productRepository,
  categoriesRepository,
  storeRepository,
} from "@/repositories";
import {
  isAlgoliaConfigured,
  indexProducts,
  indexNavPages,
  indexCategories,
  indexStores,
  clearAlgoliaIndex,
  ALGOLIA_INDEX_NAME,
  ALGOLIA_PAGES_INDEX_NAME,
  ALGOLIA_CATEGORIES_INDEX_NAME,
  ALGOLIA_STORES_INDEX_NAME,
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
import { ROUTES } from "@/constants";
import { ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError } from "@/lib/errors";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlgoliaSyncResult {
  indexed?: number;
  deleted?: number;
  total?: number;
  cleared?: boolean;
  skipped?: number;
  index?: string;
  error?: string;
}

export type AlgoliaSyncTarget = "products" | "pages" | "categories" | "stores";
export type AlgoliaSyncAction = "sync" | "clear";

export interface AlgoliaSyncVars {
  action: AlgoliaSyncAction;
  target: AlgoliaSyncTarget;
}

// ── Static nav pages (shared with admin sync-pages route) ─────────────────────

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

// ── Firestore helpers for pages sync ──────────────────────────────────────────

async function fetchCategoryNavRecords(): Promise<AlgoliaNavRecord[]> {
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
    serverLogger.warn("algolia-action: failed to fetch categories", {
      error: err,
    });
    return [];
  }
}

async function fetchBlogNavRecords(): Promise<AlgoliaNavRecord[]> {
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
    serverLogger.warn("algolia-action: failed to fetch blog posts", {
      error: err,
    });
    return [];
  }
}

async function fetchEventNavRecords(): Promise<AlgoliaNavRecord[]> {
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
    serverLogger.warn("algolia-action: failed to fetch events", { error: err });
    return [];
  }
}

async function fetchStoreNavRecords(): Promise<AlgoliaNavRecord[]> {
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
    serverLogger.warn("algolia-action: failed to fetch stores", { error: err });
    return [];
  }
}

// ── Guard ─────────────────────────────────────────────────────────────────────

function assertAlgoliaConfigured(): void {
  if (!isAlgoliaConfigured()) {
    throw new ValidationError("Algolia is not configured");
  }
}

// ── Server Actions ────────────────────────────────────────────────────────────

/**
 * Generic Algolia sync/clear — used by AlgoliaDashboardView (dev-only).
 * Dispatches to the correct sync or clear operation based on action+target.
 */
export async function algoliaSyncAction(
  vars: AlgoliaSyncVars,
): Promise<AlgoliaSyncResult> {
  // Dev-only guard: this is the equivalent of the demo endpoint
  if (process.env.NODE_ENV === "production") {
    throw new ValidationError("Not available in production");
  }

  assertAlgoliaConfigured();

  const { action, target } = vars;

  if (action === "clear") {
    const indexMap: Record<AlgoliaSyncTarget, string> = {
      products: ALGOLIA_INDEX_NAME,
      pages: ALGOLIA_PAGES_INDEX_NAME,
      categories: ALGOLIA_CATEGORIES_INDEX_NAME,
      stores: ALGOLIA_STORES_INDEX_NAME,
    };
    const indexName = indexMap[target];
    await clearAlgoliaIndex(indexName);
    serverLogger.warn(`[dev] Algolia ${indexName} cleared`);
    return { cleared: true, index: indexName };
  }

  // action === "sync"
  if (target === "products") return syncProductsInternal();
  if (target === "pages") return syncPagesInternal();
  if (target === "categories") return syncCategoriesInternal();
  if (target === "stores") return syncStoresInternal();

  throw new ValidationError("Invalid sync target");
}

/**
 * Sync products to Algolia. Admin-only.
 */
export async function algoliaSyncProductsAction(): Promise<AlgoliaSyncResult> {
  const admin = await requireRole(["admin"]);
  const rl = await rateLimitByIdentifier(
    `algolia-sync-products:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  assertAlgoliaConfigured();
  return syncProductsInternal();
}

/**
 * Sync pages (nav) to Algolia. Admin-only.
 */
export async function algoliaSyncPagesAction(): Promise<AlgoliaSyncResult> {
  const admin = await requireRole(["admin"]);
  const rl = await rateLimitByIdentifier(
    `algolia-sync-pages:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  assertAlgoliaConfigured();
  return syncPagesInternal();
}

/**
 * Sync categories to Algolia. Admin-only.
 */
export async function algoliaSyncCategoriesAction(): Promise<AlgoliaSyncResult> {
  const admin = await requireRole(["admin"]);
  const rl = await rateLimitByIdentifier(
    `algolia-sync-categories:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  assertAlgoliaConfigured();
  return syncCategoriesInternal();
}

/**
 * Sync stores to Algolia. Admin-only.
 */
export async function algoliaSyncStoresAction(): Promise<AlgoliaSyncResult> {
  const admin = await requireRole(["admin"]);
  const rl = await rateLimitByIdentifier(
    `algolia-sync-stores:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  assertAlgoliaConfigured();
  return syncStoresInternal();
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function syncProductsInternal(): Promise<AlgoliaSyncResult> {
  const allProducts = await productRepository.findAll();
  const published = allProducts.filter((p) => p.status === "published");

  serverLogger.info("Starting Algolia products sync", {
    total: allProducts.length,
    published: published.length,
    index: ALGOLIA_INDEX_NAME,
  });

  const result = await indexProducts(published);

  serverLogger.info("Algolia products sync completed", {
    indexed: result.indexed,
    index: ALGOLIA_INDEX_NAME,
  });

  return {
    indexed: result.indexed,
    total: allProducts.length,
    skipped: allProducts.length - published.length,
    index: ALGOLIA_INDEX_NAME,
  };
}

async function syncPagesInternal(): Promise<AlgoliaSyncResult> {
  const [categories, blogPosts, events, stores] = await Promise.all([
    fetchCategoryNavRecords(),
    fetchBlogNavRecords(),
    fetchEventNavRecords(),
    fetchStoreNavRecords(),
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

  return {
    indexed: result.indexed,
    total: records.length,
    index: ALGOLIA_PAGES_INDEX_NAME,
  };
}

async function syncCategoriesInternal(): Promise<AlgoliaSyncResult> {
  const allCategories = await categoriesRepository.findAll();
  const active = allCategories.filter((c) => c.isActive);

  serverLogger.info("Starting Algolia categories sync", {
    total: allCategories.length,
    active: active.length,
    index: ALGOLIA_CATEGORIES_INDEX_NAME,
  });

  const result = await indexCategories(active);

  serverLogger.info("Algolia categories sync completed", {
    indexed: result.indexed,
    index: ALGOLIA_CATEGORIES_INDEX_NAME,
  });

  return {
    indexed: result.indexed,
    total: allCategories.length,
    skipped: allCategories.length - active.length,
    index: ALGOLIA_CATEGORIES_INDEX_NAME,
  };
}

async function syncStoresInternal(): Promise<AlgoliaSyncResult> {
  const allStores = await storeRepository.findAll();
  const eligible = allStores.filter((s) => s.status === "active" && s.isPublic);

  serverLogger.info("Starting Algolia stores sync", {
    total: allStores.length,
    eligible: eligible.length,
    index: ALGOLIA_STORES_INDEX_NAME,
  });

  const result = await indexStores(eligible);

  serverLogger.info("Algolia stores sync completed", {
    indexed: result.indexed,
    index: ALGOLIA_STORES_INDEX_NAME,
  });

  return {
    indexed: result.indexed,
    total: allStores.length,
    skipped: allStores.length - eligible.length,
    index: ALGOLIA_STORES_INDEX_NAME,
  };
}
