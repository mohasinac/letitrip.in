/**
 * GET /whatsapp/{storeSlug}/feed.csv
 *
 * WHY: a seller pastes this URL into their OWN Meta Commerce Manager
 *      (Catalogue → Data sources → Data File → "Use a URL"), sets a daily
 *      schedule, and connects their own WhatsApp Business Account to that
 *      catalogue. Meta fetches this file; LetItRip holds no Meta credential for
 *      anyone. See `src/constants/whatsapp-feed.ts` for why that shape was
 *      chosen over the Graph API push removed in 910e68a4e.
 *
 * WHAT: a flat Commerce-Manager-format CSV of one store's buyable listings.
 *
 * ## It is PUBLIC and unauthenticated, on purpose
 *
 * Meta's crawler carries no session. Every row here is already public on the
 * storefront, so the feed exposes nothing new — but it is a bulk read of a
 * store's catalogue at a guessable URL, which is why the store gate below is a
 * real check and not a formality: an unpublished or suspended store must not
 * have a feed at all.
 *
 * ## The read is bounded and cached, not pre-generated
 *
 * `sitemap.ts` is the precedent — it bulk-reads every published product on
 * demand behind a cache rather than materialising a file on a schedule. A
 * scheduled Firebase Function writing to Storage was the first design and buys
 * nothing here: it adds a Cloud Scheduler job (§ Firebase budget), up to 24h of
 * staleness, and a second place for the data to be wrong.
 *
 * 🛑 The cache header is what keeps this inside Rule #6. Uncached, a crawler
 * looping over store slugs would cost one Firestore read per product per hit
 * against the 50K/day quota. `s-maxage` means Meta's own daily fetch, and every
 * stray request between them, is served by Vercel's CDN.
 *
 * EXPORTS: GET
 *
 * @tag domain:whatsapp
 * @tag layer:route
 * @tag access:public
 * @tag sideEffects:firestore-read
 */

import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import {
  ALL_LISTING_TYPES,
  LISTING_TYPE_CAPABILITIES,
  ROUTES,
  enabledListingTypes,
  siteSettingsRepository,
} from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { withProviders } from "@/providers.config";
/*
 * 🛑 `@/constants/seo`, NOT the `@/constants` barrel, and the deep-import lint
 * warning here is the rule being wrong for server code.
 *
 * That barrel re-exports `navigation.tsx`, which imports
 * `@mohasinac/appkit/client` for values — so pulling it into a SERVER graph
 * instantiates appkit a second time under the client condition, with its own
 * empty provider registry. `initProviders()` then registers the session
 * provider into one copy while the route reads the other, and every valid
 * session answers 401. Measured on `/api/payment/create-order`, 10/10, and the
 * whole cost was one import string. Known TS Patterns names this exact line.
 */
import { SEO_CONFIG } from "@/constants/seo";
import { metaFeedCondition } from "@/constants/whatsapp-feed";

/**
 * One hour at the CDN, a day of stale-while-revalidate.
 *
 * 🛑 This was 86400 (one day), reasoning that Meta fetches daily at most so a
 * shorter window buys no freshness. That is true of the SCHEDULED fetch and
 * false of the one that matters when something is wrong: a manual "Fetch now"
 * in Commerce Manager hits the CDN, so a day-long window can hand Meta a file
 * up to 24h stale and make a fix look like it did not work. An hour keeps the
 * feedback loop usable.
 *
 * The SWR tail still means a Firestore blip serves the last good catalogue
 * rather than an error — a feed that 500s on a scheduled fetch is how Meta
 * disables a data source.
 *
 * 🛑 Cost scales with CATALOGUE SIZE, not with this number. At 16 products an
 * hourly revalidation is ~400 Firestore reads/day against the 50K/day quota —
 * nothing. A store with ~1,000 published listings would be ~24,000/day, which
 * is half the quota for one store, so raise this back toward 86400 before any
 * store gets large. Rule #6.
 */
const CACHE_CONTROL = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

/**
 * 🛑 A ceiling that is LOGGED, not a bare `.limit()`.
 *
 * `findByStore` returns the whole store. A silent truncation is indistinguishable
 * from a store that genuinely has fewer products, which is the failure mode
 * `readAllDocs` in appkit's sitemap exists to avoid. No store is near this today
 * (the largest is ~1,000); crossing it must be visible in logs.
 */
const MAX_FEED_ROWS = 10_000;

/**
 * What `enabledListingTypes` accepts, derived from the function itself.
 *
 * 🛑 Not `unknown` with a cast at the call site — that is the shape
 * `audit-unknown-leakage` blocks, and correctly: a cast silences every other
 * field's check on that call, not just the one being worked around (Root Cause
 * #98). appkit does not export `FeatureFlagSnapshot` from its barrel, so the
 * type is taken from the signature instead, which cannot drift from it.
 */
type FeatureFlagSettings = Parameters<typeof enabledListingTypes>[0];

/**
 * The listing types a catalogue may carry, derived rather than listed.
 *
 * 🛑 `canAddToCart` is the right predicate and `inGeneralCatalogue` is not. A
 * catalogue card asserts a fixed price and a buy action, which is precisely what
 * that capability means — so `auction` (price moves, `canBid`) and `classified`
 * (`cartLine: "blocked"`, contact-only) drop out on their own, and a tenth
 * listing type joins with no edit here. Deriving from the general-catalogue flag
 * instead would include `classified`, which is in that catalogue only because
 * /products is its sole discovery path, not because it can be bought.
 *
 * `enabledListingTypes` additionally honours the admin's per-type feature
 * flags, so disabling a type in Site Settings empties it from every seller's
 * feed on the next fetch — which is the control the seller-facing page points
 * at when a type is missing.
 */
function purchasableTypes(settings: FeatureFlagSettings): Set<string> {
  const enabled = enabledListingTypes(settings);
  return new Set(
    (enabled as string[]).filter(
      (t) => LISTING_TYPE_CAPABILITIES[t as keyof typeof LISTING_TYPE_CAPABILITIES]?.canAddToCart,
    ),
  );
}

/**
 * Every purchasable type, ignoring admin flags. The fallback when the settings
 * read fails.
 *
 * 🛑 It FAILS OPEN, and that direction is deliberate. Meta empties a connected
 * catalogue when a scheduled fetch returns a file with no rows, so a transient
 * Firestore blip that failed CLOSED would silently wipe every seller's
 * catalogue and require each of them to notice and re-sync. Serving a type an
 * admin has disabled for one day is recoverable; deleting a catalogue is not.
 */
function allPurchasableTypes(): Set<string> {
  return new Set(
    (ALL_LISTING_TYPES as readonly string[]).filter(
      (t) => LISTING_TYPE_CAPABILITIES[t as keyof typeof LISTING_TYPE_CAPABILITIES]?.canAddToCart,
    ),
  );
}

/**
 * Module-scope TTL cache, mirroring `api/search/suggestions`.
 *
 * Lambda instances are reused, so this is ~1 settings read per instance per
 * 10 minutes rather than one per request — and with the CDN in front, per
 * cache miss rather than per fetch.
 */
const FLAGS_TTL_MS = 600_000;
let flagsCache: { at: number; types: Set<string> } | null = null;

async function feedListingTypes(): Promise<Set<string>> {
  const now = Date.now();
  if (flagsCache && now - flagsCache.at < FLAGS_TTL_MS) return flagsCache.types;
  try {
    const settings = await siteSettingsRepository.findById("global");
    const types = purchasableTypes(settings);
    flagsCache = { at: now, types };
    return types;
  } catch (err) {
    const normalized = normalizeError(err);
    serverLogger.error("whatsapp-feed: listing-type flags unreadable, serving all purchasable types", {
      error: normalized.message,
    });
    return allPurchasableTypes();
  }
}

/**
 * Column names and order taken from the template Commerce Manager generates
 * for this catalogue (Data sources → Download template), not from Meta's
 * general product-data spec.
 *
 * 🛑 The two disagree, and the template wins because it is what THIS catalogue
 * was built to parse. Three differences cost a rewrite:
 *
 *   - `product_tags[0..1]`, NOT `product_type` / `custom_label_0`. The template
 *     documents product_tags as the field that "filters them into product
 *     sets", which is exactly what the per-type and per-seller grouping needs.
 *     custom_label_* does not appear in it at all.
 *   - `additional_image_link` does not appear either, so extra images are
 *     dropped rather than sent to a column that may not be read.
 *   - `price` sits AFTER `brand`, and `brand` is REQUIRED while `price` is
 *     optional — the reverse of what a shopping feed suggests.
 */
const COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "link",
  "image_link",
  "brand",
  "price",
  /*
   * 🛑 Required for an item to be BUYABLE on a commerce surface, which
   * includes the WhatsApp catalogue — the template's own wording is "Must be 1
   * or higher or the item won't be buyable". It is listed as Optional there,
   * which is true only of ads: an ad can show an item it cannot sell.
   *
   * Omitting it is why a catalogue can read "Eligible" in Commerce Manager,
   * which grades ads eligibility, while the connected WhatsApp catalogue shows
   * nothing.
   */
  "quantity_to_sell_on_facebook",
  "product_type",
  "product_tags[0]",
  "product_tags[1]",
] as const;

/**
 * Meta's parser is quote-delimited. Every field is quoted unconditionally —
 * conditional quoting is the version of this that works until a title contains
 * the delimiter.
 *
 * Newlines are collapsed rather than escaped: a literal newline inside a quoted
 * CSV field is legal and Meta accepts it, but it makes the file unreadable when
 * someone opens it to debug a rejected row, which is the only time anyone ever
 * looks at it.
 */
function csvCell(value: unknown): string {
  const raw = value === null || value === undefined ? "" : String(value);
  return `"${raw.replace(/\s+/g, " ").trim().replace(/"/g, '""')}"`;
}

/** Descriptions are authored as rich HTML; Meta wants plain text. */
function plainText(html: string | undefined, max: number): string {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * 🛑 Absolute, and on the canonical host.
 *
 * `SEO_CONFIG.siteUrl` is the ONE definition of the host (Root Cause #81 — two
 * owners of it is what put every sitemap URL on a host that 307-redirected and
 * took the site out of Google). A relative `/media/...` in a feed is simply
 * dropped by Meta, and a redirecting absolute one is re-crawled on every fetch.
 */
function absolute(path: string): string {
  const base = SEO_CONFIG.siteUrl.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * The image URL, re-encoded to a format Meta will accept.
 *
 * The catalogue is stored as WebP and the template states JPG/GIF/PNG, so the
 * proxy transcodes on request (`?fmt=`). Our URLs are extensionless, so the
 * format a fetcher sees is whatever `Content-Type` we send — no re-upload and
 * no storage migration is involved.
 *
 * 🛑 `jpg`, NOT `png`, and the reason is Root Cause #104. PNG is lossless, so a
 * product photograph re-encodes to several times the size of its WebP original;
 * across a four-figure catalogue that is gigabytes of Fast Origin Transfer, the
 * exact meter whose 52.52 GB against a 10 GB allowance suspended this project.
 * JPEG at q82 lands near the WebP size and is first in the template's own list
 * of accepted formats. `?fmt=png` exists and works if a fetcher ever demands it.
 *
 * 🛑 Only applied to a `/media/...` URL we serve. A third-party absolute URL is
 * left alone — appending a param to someone else's CDN link does nothing at
 * best and breaks a signature at worst.
 */
function feedImage(path: string): string {
  const url = absolute(path);
  return url.startsWith(SEO_CONFIG.siteUrl.replace(/\/$/, "")) ? `${url}?fmt=jpg` : url;
}

/**
 * The listing's own public page.
 *
 * 🛑 Per-type, not a single `/products/{slug}`. Root Cause #48 is the record of
 * three listing types whose `detailRoute` silently defaulted to the standard
 * product page; here the same mistake would send every digital-code buyer to a
 * 404 from inside WhatsApp. Built from `ROUTES`, never a literal.
 */
function detailPath(listingType: string, slug: string): string {
  return listingType === "digital-code"
    ? String(ROUTES.PUBLIC.DIGITAL_CODE_DETAIL(slug))
    : String(ROUTES.PUBLIC.PRODUCT_DETAIL(slug));
}

/**
 * 🛑 TWO values, not five.
 *
 * Meta's general spec lists `preorder`, `available for order` and
 * `discontinued` as well, and an earlier draft of this file mapped a pre-order
 * listing to `preorder` on that basis. The downloaded template is explicit —
 * *"Supported values: in stock; out of stock"* — and a value outside the
 * supported set does not degrade, it REJECTS the row.
 *
 * So a pre-order with no stock reports `out of stock`, which is less
 * expressive and true.
 */
function availability(stockQuantity: number): string {
  return stockQuantity > 0 ? "in stock" : "out of stock";
}

/**
 * The item's category, as a root-to-leaf breadcrumb.
 *
 * 🛑 `product_type` is the FREE-FORM category field and takes our own
 * taxonomy. Its two neighbours do NOT: `google_product_category` and
 * `fb_product_category` accept only values from fixed published taxonomies,
 * so putting "Beyblade X Tops" in either is a rejected row. They are
 * deliberately omitted rather than guessed at — a wrong taxonomy id is worse
 * than none, because Meta will classify the whole catalogue by it.
 *
 * `categoryNames` is stored LEAF-FIRST (`["Basic Line", "Beyblade X Tops",
 * "Beyblade X", "Spinning Tops"]`) and a breadcrumb reads root-first, so it is
 * reversed. Falls back to the scalar `category` for any row whose chain was
 * never derived — `deriveTaxonomy` only backfills on create/update, so rows
 * predating it can still be bare (Root Cause #101).
 */
function productType(
  categoryNames: readonly string[] | undefined,
  category: string | undefined,
): string {
  const names = (categoryNames ?? []).filter((n) => typeof n === "string" && n.length > 0);
  if (names.length > 0) return [...names].reverse().join(" > ");
  return category ?? "";
}

export const GET = withProviders(async (_request: Request, context?: any): Promise<Response> => {
  const params = await context?.params;
  const storeSlug = String(params?.storeSlug ?? "").trim();

  if (!storeSlug) return new Response("Not found\n", { status: 404 });

  try {
    const [store, allowedTypes] = await Promise.all([
      storeRepository.findBySlug(storeSlug),
      feedListingTypes(),
    ]);

    /*
     * A feed exists only for a store a shopper could buy from today. Pending,
     * suspended and non-public stores get a 404 rather than an empty feed:
     * Meta treats a 200 with zero rows as "the seller deleted everything" and
     * empties the connected catalogue, which is a destructive answer to what is
     * really a temporary state.
     */
    if (!store || store.status !== "active" || store.isPublic === false) {
      return new Response("Not found\n", { status: 404 });
    }

    const all = await productRepository.findByStore(storeSlug);

    const eligible = all.filter((p) => {
      if (p.status !== "published") return false;
      if (!allowedTypes.has(String(p.listingType))) return false;
      /*
       * 🛑 In-memory, never a Firestore `!=` on isTestData. An inequality
       * excludes every document LACKING the field — which is every real
       * product, since the flag is optional and was added later — so the query
       * would return ONLY test data. Documented in CLAUDE.md § Tester QA.
       */
      if (p.isTestData === true) return false;
      /* A row with no image is rejected by Meta, so emit no row rather than a
       * known-bad one — a rejected row costs the seller a support question. */
      const image = p.mainImage || p.images?.[0];
      return Boolean(image) && Boolean(p.slug || p.id);
    });

    if (eligible.length > MAX_FEED_ROWS) {
      serverLogger.error(
        `whatsapp-feed: store "${storeSlug}" hit the ${MAX_FEED_ROWS}-row ceiling and is TRUNCATED`,
        { store: storeSlug, eligible: eligible.length },
      );
    }

    const rows = eligible.slice(0, MAX_FEED_ROWS).map((p) => {
      const slug = String(p.slug ?? p.id);
      const listingType = String(p.listingType);
      const mainImage = String(p.mainImage || p.images?.[0] || "");
      const url = absolute(detailPath(listingType, slug));

      /*
       * The product URL is appended to the description, not left to the `link`
       * column alone.
       *
       * `link` is where Meta sends a tap, but the WhatsApp catalogue card
       * renders the description as the body text and does not surface the link
       * as a visible address — so a customer browsing via `wa.me/c/<number>`
       * can read the description and still have no idea where to buy. Repeating
       * it in text is the only way it reaches their eyes. 4,600 leaves room
       * under Meta's description cap for the URL and the separator.
       */
      const body = plainText(p.description, 4600) || plainText(p.title, 200);

      return [
        slug,
        plainText(p.title, 200),
        /* Meta rejects an empty description; the title is a truthful fallback. */
        `${body} · ${url}`,
        availability(p.stockQuantity ?? 0),
        metaFeedCondition(p.condition),
        url,
        feedImage(mainImage),
        /*
         * 🛑 `brand` is REQUIRED by the template, and most of this catalogue
         * has none — a bare `p.brand ?? ""` would reject every unbranded
         * listing with an error only the seller ever sees. The shop's own name
         * is the truthful fallback: on a marketplace of fan-art, stickers and
         * loose spares, the seller IS the brand.
         */
        p.brand || store.storeName || storeSlug,
        `${Number(p.price ?? 0).toFixed(2)} ${p.currency || "INR"}`,
        /*
         * A pre-order has no stock yet but must still be buyable, so it floors
         * at 1 — reporting 0 would make the one listing type whose entire
         * purpose is selling-before-stock the one type nobody can buy.
         */
        Math.max(listingType === "pre-order" ? 1 : 0, Number(p.stockQuantity ?? 0)),
        productType(p.categoryNames, p.category),
        /*
         * product_tags, which the template documents as the field that filters
         * products into Sets — so these two columns are what give the catalogue
         * its browsable per-type and per-seller groups. The file itself stays
         * flat; grouping is always a filter over a column, never structure.
         */
        listingType,
        storeSlug,
      ].map(csvCell).join(",");
    });

    const csv = [COLUMNS.join(","), ...rows].join("\n");

    return new Response(`${csv}\n`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": CACHE_CONTROL,
        "Content-Disposition": `inline; filename="${storeSlug}-whatsapp-feed.csv"`,
      },
    });
  } catch (err) {
    const normalized = normalizeError(err);
    serverLogger.error("whatsapp-feed: failed to build feed", {
      store: storeSlug,
      error: normalized.message,
    });
    /*
     * 503, not 200-with-no-rows. Meta empties a connected catalogue when a
     * scheduled fetch returns an empty file, and repeated 5xx only pauses the
     * data source — the recoverable failure is the right one to report.
     */
    return new Response("Feed temporarily unavailable\n", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
});
