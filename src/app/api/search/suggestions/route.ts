/**
 * GET /api/search/suggestions?q=<query>&type=<resource>
 *
 * W1-19 â€” typeahead endpoint for the nav search box. Returns up to 5 matches
 * per resource type (products, categories, blog posts, events). Lightweight
 * shape â€” no pagination, no Sieve filters â€” just the bare-minimum fields
 * needed to render a suggestion row + a click target.
 */
import { NextResponse } from "next/server";
import { withProviders } from "@/providers.config";
import { PRODUCT_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { categoriesRepository } from "@mohasinac/appkit/features/categories/repository/categories.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { ProductStatusValues } from "@mohasinac/appkit/features/products/schemas/firestore";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { sieveFilter, SIEVE_OP } from "@mohasinac/appkit/utils/sieve-builder";
import { blogRepository, eventRepository, siteSettingsRepository } from "@mohasinac/appkit";
import { enabledListingTypes } from "@mohasinac/appkit";
import type { ListingType } from "@mohasinac/appkit/features/products/types/index";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";

const PER_TYPE_LIMIT = 5;
const PAGE_SUGGESTION_LIMIT = 3;

type SuggestionType = "page" | "product" | "category" | "blog" | "event";

interface SuggestionRecord {
  objectID: string;
  type: SuggestionType;
  title: string;
  subtitle?: string;
  url: string;
}

/**
 * Top-level navigation destinations the user can search for by name/keyword.
 * Matched against `q.toLowerCase()` over `title` + `keywords` so typing
 * "auc" surfaces "Auctions" before any product hit. Clicking a page
 * suggestion carries the typed query into `?q=` (see Search.handleSuggestionClick).
 */
const PAGE_SUGGESTIONS: Array<{
  title: string;
  subtitle: string;
  url: string;
  keywords: string[];
  /**
   * The listing type this destination IS. Present only on pages that exist
   * because a type is offered — a suggestion for a disabled type is a
   * typeahead row that lands on a page rendering nothing.
   *
   * Absent on Products/Stores/Categories/Blog/Events/FAQs: those are not
   * listing-type pages, and `/products` spans whatever remains enabled.
   */
  listingType?: ListingType;
}> = [
  { title: "Auctions", subtitle: "Browse live auctions", url: String(ROUTES.PUBLIC.AUCTIONS), keywords: ["auction", "bid", "live"], listingType: "auction" },
  { title: "Products", subtitle: "Browse all listings", url: String(ROUTES.PUBLIC.PRODUCTS), keywords: ["product", "listing", "shop", "buy"] },
  { title: "Pre-orders", subtitle: "Upcoming releases", url: String(ROUTES.PUBLIC.PRE_ORDERS ?? "/pre-orders"), keywords: ["preorder", "pre-order", "upcoming", "release"], listingType: "pre-order" },
  { title: "Stores", subtitle: "Browse all sellers", url: String(ROUTES.PUBLIC.STORES ?? "/stores"), keywords: ["store", "seller", "shop", "vendor"] },
  { title: "Categories", subtitle: "Shop by category", url: String(ROUTES.PUBLIC.CATEGORIES ?? "/categories"), keywords: ["category", "collection", "browse"] },
  { title: "Blog", subtitle: "Latest articles", url: String(ROUTES.BLOG.LIST ?? "/blog"), keywords: ["blog", "article", "news", "guide"] },
  { title: "Events", subtitle: "Sales, polls, raffles", url: String(ROUTES.PUBLIC.EVENTS ?? "/events"), keywords: ["event", "raffle", "poll", "sale", "spin"] },
  { title: "FAQs", subtitle: "Help & answers", url: String(ROUTES.PUBLIC.FAQS ?? "/faqs"), keywords: ["faq", "help", "question", "support"] },
];

/**
 * Which listing types this site offers, cached per Lambda instance.
 *
 * 🛑 The TTL is the whole point. This endpoint fires per debounced KEYSTROKE,
 * so a plain `siteSettingsRepository.findById` here would add a Firestore read
 * to every character typed in the nav search box — against the read budget
 * Rule #6 exists to protect, for a value that changes when an admin saves a
 * settings form. Same pattern, and same reason, as `disabledRoutesCache` in
 * `src/proxy.ts`: roughly one read per instance per window, not one per
 * request.
 *
 * Fails OPEN (every type enabled). A settings read that errors must not strip
 * working destinations out of search — the cost of the rare dead row is lower
 * than making the catalogue unfindable.
 */
const LISTING_FLAGS_TTL_MS = 600_000;
let listingFlagsCache: { at: number; enabled: Set<string> } | null = null;

async function enabledListingTypeSet(): Promise<Set<string> | null> {
  const now = Date.now();
  if (listingFlagsCache && now - listingFlagsCache.at < LISTING_FLAGS_TTL_MS) {
    return listingFlagsCache.enabled;
  }
  try {
    const settings = await siteSettingsRepository.findById("global");
    const enabled = new Set(enabledListingTypes(settings) as string[]);
    listingFlagsCache = { at: now, enabled };
    return enabled;
  } catch (err) {
    const normalized = normalizeError(err);
    // Warn, never throw: typeahead degrading to "offer every page" is a far
    // better outcome than a 500 on the nav search box.
    serverLogger.warn("[search] listing-type flags unavailable — offering every page suggestion", {
      message: normalized.message,
    });
    return null;
  }
}

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const q = (url.searchParams.get("q") ?? "").trim();
      const typeFilter = url.searchParams.get("type") ?? "";
      if (!q) return successResponse({ suggestions: [] satisfies SuggestionRecord[] });

      const wantAll = !typeFilter || typeFilter === "all";
      const wantProduct = wantAll || typeFilter === "product";
      const wantCategory = wantAll || typeFilter === "category";
      const wantBlog = wantAll || typeFilter === "blog";
      const wantEvent = wantAll || typeFilter === "event";

      // `searchTokens=*term*` was not a Sieve expression at all: `=*` is not an
      // operator, so `parseFilters` discarded the term and every request ran
      // with ZERO filters. That is why the dropdown returned the same newest
      // rows for every keystroke — and, with no `status` clause either, why it
      // surfaced drafts and archived products to anonymous callers.
      //
      // Sieve cannot express `array-contains`, so the token search travels via
      // `baseOpts.search` on the repository call instead. `status==published`
      // is now explicit rather than accidental.
      const publishedOnly = sieveFilter(
        PRODUCT_FIELDS.STATUS,
        SIEVE_OP.EQ,
        ProductStatusValues.PUBLISHED,
      );

      const [products, categories, blog, events] = await Promise.all([
        wantProduct
          ? productRepository
              .list(
                {
                  filters: publishedOnly,
                  sorts: sortBy("createdAt"),
                  pageSize: PER_TYPE_LIMIT,
                },
                { search: q },
              )
              .catch(() => ({ items: [] as Record<string, JsonValue>[] }))
          : Promise.resolve({ items: [] as Record<string, JsonValue>[] }),
        wantCategory
          ? categoriesRepository
              .list({
                filters: undefined,
                sorts: sortBy("name", "ASC"),
                pageSize: PER_TYPE_LIMIT,
              })
              .catch(() => ({ items: [] as Record<string, JsonValue>[] }))
          : Promise.resolve({ items: [] as Record<string, JsonValue>[] }),
        wantBlog
          ? blogRepository
              .listPublished({}, { filters: undefined, sorts: sortBy("publishedAt"), pageSize: PER_TYPE_LIMIT })
              .then((r) => ({ items: r.items as unknown as Record<string, JsonValue>[] }))
              .catch(() => ({ items: [] as Record<string, JsonValue>[] }))
          : Promise.resolve({ items: [] as Record<string, JsonValue>[] }),
        wantEvent
          ? eventRepository
              .list({
                filters: undefined,
                sorts: sortBy("startsAt"),
                pageSize: PER_TYPE_LIMIT,
              })
              .catch(() => ({ items: [] as Record<string, JsonValue>[] }))
          : Promise.resolve({ items: [] as Record<string, JsonValue>[] }),
      ]);

      const wantPage = wantAll || typeFilter === "page";
      const qLower = q.toLowerCase();
      // `null` means the settings read failed — fail open and offer every page.
      const enabledTypes = wantPage ? await enabledListingTypeSet() : null;
      const pageHits: SuggestionRecord[] = wantPage
        ? PAGE_SUGGESTIONS.filter((p) =>
            (!p.listingType || !enabledTypes || enabledTypes.has(p.listingType)) &&
            (p.title.toLowerCase().includes(qLower) ||
              p.keywords.some((k) => k.includes(qLower))),
          )
            .slice(0, PAGE_SUGGESTION_LIMIT)
            .map((p) => ({
              objectID: `page:${p.url}`,
              type: "page" as const,
              title: p.title,
              subtitle: p.subtitle,
              url: p.url,
            }))
        : [];

      const suggestions: SuggestionRecord[] = [
        ...pageHits,
        ...((products.items ?? []) as Array<{
          id: string;
          slug?: string;
          title?: string;
          name?: string;
          brand?: string;
          categoryNames?: string[];
        }>).map((p) => {
          /*
           * 🛑 NO AMOUNT, EVER. This handler is `auth: false` and its response
           * carries `Cache-Control: public, s-maxage=60`, so there is no viewer
           * to gate on and no per-viewer body to vary — a price here reaches
           * every signed-out visitor on every page, out of a shared cache.
           * It used to emit `₹${p.price}`, which is § Guest price gating
           * (Root Cause #93) in the one place `audit-guest-price-leak` could
           * not see: a template literal inside an API route rather than a view.
           *
           * Brand · leaf category instead — the same non-money detail line
           * `search-sources.ts` already uses for a product hit, so the two
           * surfaces describe a product the same way.
           */
          const names = Array.isArray(p.categoryNames) ? p.categoryNames : [];
          const detail = [p.brand, names[0]].filter(Boolean).join(" · ");
          return {
            objectID: p.id,
            type: "product" as const,
            title: p.title ?? p.name ?? "Product",
            subtitle: detail || undefined,
            url: String(ROUTES.PUBLIC.PRODUCT_DETAIL?.(p.slug ?? p.id) ?? `/products/${p.slug ?? p.id}`),
          };
        }),
        ...((categories.items ?? []) as Array<{ id: string; slug: string; name: string }>).map((c) => ({
          objectID: c.id,
          type: "category" as const,
          title: c.name,
          url: String(ROUTES.PUBLIC.CATEGORY_DETAIL?.(c.slug) ?? `/categories/${c.slug}`),
        })),
        ...((blog.items ?? []) as Array<{ id: string; slug: string; title: string; excerpt?: string }>).map((b) => ({
          objectID: b.id,
          type: "blog" as const,
          title: b.title,
          subtitle: b.excerpt?.slice(0, 80),
          url: `/blog/${b.slug}`,
        })),
        ...((events.items ?? []) as Array<{ id: string; slug?: string; title: string; type?: string }>).map((e) => ({
          objectID: e.id,
          type: "event" as const,
          title: e.title,
          subtitle: e.type,
          url: String(ROUTES.PUBLIC.EVENT_DETAIL?.(e.slug ?? e.id) ?? `/events/${e.slug ?? e.id}`),
        })),
      ];

      const response = successResponse({ suggestions });
      const nextResp = response as unknown as NextResponse;
      nextResp.headers?.set(
        "Cache-Control",
        "public, max-age=10, s-maxage=60, stale-while-revalidate=120",
      );
      return response;
    },
  }),
);