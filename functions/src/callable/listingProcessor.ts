/**
 * Firebase HTTPS Function — Listing Processor (Q1 — S13)
 *
 * Single entry point for all public listing queries. Replaces direct Sieve
 * repository calls from Vercel routes with a Firebase-side processor, so
 * Vercel becomes a thin caching proxy.
 *
 * Every appkit repository extends `BaseRepository` and routes its `.list()`
 * through the same `sieveQuery()` adapter — so adding a new collection is
 * a one-line addition to `LISTERS` below.
 *
 * Cursor support: opaque base64 over `{page}`. Callers may choose either
 *   - `mode="pages"` → pass `p` directly, ignore `cursor`
 *   - `mode="infinite"` → start with no cursor, then forward the `cursor`
 *     returned in each response. Both modes hit the same handler.
 *
 * Auth: `x-internal-secret` header (server-to-server only).
 */

import { onRequest } from "firebase-functions/v2/https";
import type { Request, Response } from "express";
import {
  bidRepository,
  blogRepository,
  brandsRepository,
  categoriesRepository,
  couponsRepository,
  eventEntryRepository,
  eventRepository,
  faqsRepository,
  homepageSectionsRepository,
  notificationRepository,
  orderRepository,
  payoutRepository,
  productFeaturesRepository,
  productRepository,
  productTemplateRepository,
  reviewRepository,
  scammerRepository,
  storeRepository,
  sublistingCategoriesRepository,
  userRepository,
} from "../lib/appkit";
import { COLLECTIONS, REGION } from "../config/constants";
import { logInfo, logError } from "../utils/logger";

const FN = "listingProcessor";

/** s-maxage matches the Vercel CDN tier; stale-while-revalidate masks deploys. */
const CACHE_CONTROL =
  "public, max-age=60, s-maxage=120, stale-while-revalidate=60";
const DEFAULT_SORT = "-createdAt";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

interface ListingRequestBody {
  collection: string;
  q?: string;
  f?: string;
  s?: string;
  p?: number | string;
  ps?: number | string;
  cursor?: string;
  /** Collection-specific base options forwarded to the repo's `list()` call. */
  baseOpts?: Record<string, unknown>;
}

interface ListingResponseBody {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  /** Opaque next-page token; null when at the last page. */
  cursor: string | null;
}

/**
 * One entry per supported listing collection. The Sieve heavy-lifting
 * (filters/sorts/pagination) is provided uniformly by `BaseRepository`, so
 * each entry is just a thin call into the right repo method.
 *
 * `baseOpts` is the per-repo escape hatch (productRepository accepts
 * `{ status, storeId, categoriesIn }`, etc.). The Vercel caller is the
 * security gate — listingProcessor itself trusts the secret-authed input.
 */
interface SieveLikeResult {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

type Lister = (
  model: {
    filters: string;
    sorts: string;
    page: string;
    pageSize: string;
  },
  baseOpts: Record<string, unknown>,
) => Promise<SieveLikeResult>;

const LISTERS: Record<string, Lister> = {
  [COLLECTIONS.PRODUCTS]: (m, o) =>
    productRepository.list(m, o as Parameters<typeof productRepository.list>[1]),
  [COLLECTIONS.CATEGORIES]: (m) => categoriesRepository.list(m),
  [COLLECTIONS.BRANDS]: (m) => brandsRepository.list(m),
  [COLLECTIONS.ORDERS]: (m) => orderRepository.listAll(m),
  [COLLECTIONS.REVIEWS]: (m) => reviewRepository.listAll(m),
  [COLLECTIONS.COUPONS]: (m) => couponsRepository.list(m),
  [COLLECTIONS.BIDS]: (m) => bidRepository.list(m),
  [COLLECTIONS.PAYOUTS]: (m) => payoutRepository.list(m),
  [COLLECTIONS.BLOG_POSTS]: (m) => blogRepository.listAll(m),
  [COLLECTIONS.EVENTS]: (m) => eventRepository.list(m),
  [COLLECTIONS.FAQS]: (m) => faqsRepository.list(m),
  [COLLECTIONS.NOTIFICATIONS]: (m) => notificationRepository.list(m),
  [COLLECTIONS.SCAMMERS]: (m) => scammerRepository.listAll(m),
  [COLLECTIONS.SUBLISTING_CATEGORIES]: (m) =>
    sublistingCategoriesRepository.list(m),
  [COLLECTIONS.PRODUCT_FEATURES]: (m) => productFeaturesRepository.list(m),
  [COLLECTIONS.HOMEPAGE_SECTIONS]: (m) => homepageSectionsRepository.list(m),
  [COLLECTIONS.USERS]: (m) => userRepository.list(m),

  // Parent-id-scoped collections — caller supplies the parent id via baseOpts.
  // Each one is still a Sieve-backed list inside the repo, so filters/sorts
  // /pagination/cursor still apply.
  [COLLECTIONS.STORES]: (m, o) =>
    storeRepository.listStores(m, getBoolOpt(o, "activeOnly", true)),
  [COLLECTIONS.EVENT_ENTRIES]: (m, o) => {
    const eventId = requireOpt(o, "eventId", COLLECTIONS.EVENT_ENTRIES);
    return eventEntryRepository.listForEvent(eventId, m);
  },
  [COLLECTIONS.PRODUCT_TEMPLATES]: (m, o) => {
    const storeId = requireOpt(o, "storeId", COLLECTIONS.PRODUCT_TEMPLATES);
    return productTemplateRepository.listByStore(storeId, m);
  },
  // Still excluded (need their own signature/auth path):
  //   carousels (no Sieve list method — listCarousels returns an array)
  //   sessions / tokens (auth-sensitive — never proxied)
  //   carts / wishlists / history (single-doc-per-user shape, not a listing)
};

function requireOpt(
  baseOpts: Record<string, unknown>,
  key: string,
  collection: string,
): string {
  const value = baseOpts[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new ListingValidationError(
      `${collection} listing requires baseOpts.${key}`,
    );
  }
  return value;
}

function getBoolOpt(
  baseOpts: Record<string, unknown>,
  key: string,
  fallback: boolean,
): boolean {
  const value = baseOpts[key];
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

class ListingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ListingValidationError";
  }
}

const SUPPORTED_COLLECTIONS = Object.keys(LISTERS);

function verifySecret(req: Request): boolean {
  const secret = process.env.LETITRIP_INTERNAL_SECRET;
  if (!secret) return false;
  const header = req.headers["x-internal-secret"];
  const value = Array.isArray(header) ? header[0] : header;
  return value === secret;
}

function decodeCursor(cursor: string | undefined | null): number | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, "base64").toString("utf8");
    const parsed = JSON.parse(json) as { page?: number };
    const page = Number(parsed.page);
    return Number.isFinite(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
}

function encodeCursor(page: number): string {
  return Buffer.from(JSON.stringify({ page }), "utf8").toString("base64");
}

function clampPageSize(raw: number | string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.floor(n), MAX_PAGE_SIZE);
}

function clampPage(raw: number | string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE;
  return Math.floor(n);
}

async function runListing(
  collection: string,
  body: ListingRequestBody,
): Promise<ListingResponseBody> {
  const lister = LISTERS[collection];
  if (!lister) throw new Error(`No lister registered for ${collection}`);

  const cursorPage = decodeCursor(body.cursor);
  const page = cursorPage ?? clampPage(body.p);
  const pageSize = clampPageSize(body.ps);

  const result = await lister(
    {
      filters: body.f ?? "",
      sorts: body.s ?? DEFAULT_SORT,
      page: String(page),
      pageSize: String(pageSize),
    },
    body.baseOpts ?? {},
  );

  return {
    items: result.items,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    hasMore: result.hasMore,
    cursor: result.hasMore ? encodeCursor(result.page + 1) : null,
  };
}

export const listingProcessor = onRequest(
  {
    region: REGION,
    timeoutSeconds: 30,
    memory: "256MiB",
    maxInstances: 20,
    minInstances: 0,
    cors: false,
  },
  async (req: Request, res: Response) => {
    if (!verifySecret(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const body = req.body as ListingRequestBody;
    if (!body || typeof body.collection !== "string") {
      res.status(400).json({ error: "Missing collection" });
      return;
    }

    if (!LISTERS[body.collection]) {
      res.status(400).json({
        error: `Unsupported collection: ${body.collection}`,
        supported: SUPPORTED_COLLECTIONS,
      });
      return;
    }

    try {
      const payload = await runListing(body.collection, body);

      logInfo(FN, "listing served", {
        collection: body.collection,
        page: payload.page,
        pageSize: payload.pageSize,
        total: payload.total,
      });

      res.setHeader("Cache-Control", CACHE_CONTROL);
      res.status(200).json(payload);
    } catch (error) {
      if (error instanceof ListingValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      logError(FN, "listing failed", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);
