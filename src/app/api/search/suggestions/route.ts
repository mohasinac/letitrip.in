/**
 * GET /api/search/suggestions?q=<query>&type=<resource>
 *
 * W1-19 — typeahead endpoint for the nav search box. Returns up to 5 matches
 * per resource type (products, categories, blog posts, events). Lightweight
 * shape — no pagination, no Sieve filters — just the bare-minimum fields
 * needed to render a suggestion row + a click target.
 */
import { NextResponse } from "next/server";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  productRepository,
  categoriesRepository,
  blogRepository,
  eventRepository,
  ROUTES,
  sortBy,
} from "@mohasinac/appkit";

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
}> = [
  { title: "Auctions", subtitle: "Browse live auctions", url: String(ROUTES.PUBLIC.AUCTIONS), keywords: ["auction", "bid", "live"] },
  { title: "Products", subtitle: "Browse all listings", url: String(ROUTES.PUBLIC.PRODUCTS), keywords: ["product", "listing", "shop", "buy"] },
  { title: "Pre-orders", subtitle: "Upcoming releases", url: String(ROUTES.PUBLIC.PRE_ORDERS ?? "/pre-orders"), keywords: ["preorder", "pre-order", "upcoming", "release"] },
  { title: "Stores", subtitle: "Browse all sellers", url: String(ROUTES.PUBLIC.STORES ?? "/stores"), keywords: ["store", "seller", "shop", "vendor"] },
  { title: "Categories", subtitle: "Shop by category", url: String(ROUTES.PUBLIC.CATEGORIES ?? "/categories"), keywords: ["category", "collection", "browse"] },
  { title: "Blog", subtitle: "Latest articles", url: String(ROUTES.PUBLIC.BLOG ?? "/blog"), keywords: ["blog", "article", "news", "guide"] },
  { title: "Events", subtitle: "Sales, polls, raffles", url: String(ROUTES.PUBLIC.EVENTS ?? "/events"), keywords: ["event", "raffle", "poll", "sale", "spin"] },
  { title: "FAQs", subtitle: "Help & answers", url: String(ROUTES.PUBLIC.FAQS ?? "/faqs"), keywords: ["faq", "help", "question", "support"] },
];

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

      const filters = (searchTerm: string) =>
        `searchTokens=*${searchTerm.toLowerCase()}*`;

      const [products, categories, blog, events] = await Promise.all([
        wantProduct
          ? productRepository
              .list({
                filters: filters(q),
                sorts: sortBy("createdAt"),
                pageSize: PER_TYPE_LIMIT,
              })
              .catch(() => ({ items: [] as Record<string, unknown>[] }))
          : Promise.resolve({ items: [] as Record<string, unknown>[] }),
        wantCategory
          ? categoriesRepository
              .list({
                filters: filters(q),
                sorts: sortBy("name", "ASC"),
                pageSize: PER_TYPE_LIMIT,
              })
              .catch(() => ({ items: [] as Record<string, unknown>[] }))
          : Promise.resolve({ items: [] as Record<string, unknown>[] }),
        wantBlog
          ? blogRepository
              .listPublished({}, { filters: filters(q), sorts: sortBy("publishedAt"), pageSize: PER_TYPE_LIMIT })
              .then((r) => ({ items: r.items as unknown as Record<string, unknown>[] }))
              .catch(() => ({ items: [] as Record<string, unknown>[] }))
          : Promise.resolve({ items: [] as Record<string, unknown>[] }),
        wantEvent
          ? eventRepository
              .list({
                filters: filters(q),
                sorts: sortBy("startsAt"),
                pageSize: PER_TYPE_LIMIT,
              })
              .catch(() => ({ items: [] as Record<string, unknown>[] }))
          : Promise.resolve({ items: [] as Record<string, unknown>[] }),
      ]);

      const wantPage = wantAll || typeFilter === "page";
      const qLower = q.toLowerCase();
      const pageHits: SuggestionRecord[] = wantPage
        ? PAGE_SUGGESTIONS.filter((p) =>
            p.title.toLowerCase().includes(qLower) ||
            p.keywords.some((k) => k.includes(qLower)),
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
        ...((products.items ?? []) as Array<{ id: string; slug?: string; title?: string; name?: string; price?: number }>).map((p) => ({
          objectID: p.id,
          type: "product" as const,
          title: p.title ?? p.name ?? "Product",
          subtitle: typeof p.price === "number" ? `₹${(p.price / 100).toLocaleString("en-IN")}` : undefined,
          url: String(ROUTES.PUBLIC.PRODUCT_DETAIL?.(p.slug ?? p.id) ?? `/products/${p.slug ?? p.id}`),
        })),
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
