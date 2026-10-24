#!/usr/bin/env node
/**
 * audit-searchtxt-migration — a `searchTxt` migration is all-or-nothing.
 *
 * ## Why this exists
 *
 * A collection needs SIX things to be searchable, and any one missing produces
 * silence rather than an error:
 *
 *   1. the field on the document interface
 *   2. the field in `*_INDEXED_FIELDS`
 *   3. the field in `SIEVE_FIELDS` with `canFilter` — Sieve runs with
 *      `throwExceptions: false`, so a filter on an unlisted field is DROPPED
 *   4. tokens on every seed record — `array-contains` against a missing field
 *      matches zero docs, which is exactly how FAQ search returned nothing for
 *      63 documents
 *   5. a composite index — otherwise FAILED_PRECONDITION, swallowed by the
 *      `.catch(() => null)` most callers wrap the query in
 *      6. no PII feeding it — `searchTxt` stores readable fragments, so
 *      indexing an encrypted field would undo the encryption (decision D1)
 *
 * MIGRATED lists what must be fully wired. Every rule above is enforced for
 * each entry.
 *
 * 🛑 There is no PENDING list any more, and its removal is the point.
 *
 * It held eleven names and was reported-but-non-failing, so the audit's own
 * summary line read "11 pending" indefinitely — which invited the reading that
 * eleven collections were queued for the same work. They were not. Measured
 * 2026-10-17, one of the eleven (`bids`) was genuinely migratable and has been
 * migrated; six have no search box anywhere, so there is nothing for an index
 * to serve; two search an OPAQUE ID by equality, where a token index is
 * meaningless because an id has no words; and two search PII through an HMAC
 * blind index, where a plaintext token index would hand back exactly what the
 * encryption withholds (decision D1).
 *
 * "Pending" and "not applicable" are different claims and the number cannot be
 * read without separating them. Each verdict below is therefore ENFORCED
 * against the view files it names rather than asserted in a comment: a search
 * box appearing on a NO_SEARCH_SURFACE collection, or an opaque-id box growing
 * a second field, fails this audit and forces the decision to be retaken.
 */

import { readFileSync, existsSync } from "node:fs";
import { basename, join } from "node:path";

const REPO_ROOT = process.cwd();
const APPKIT = join(REPO_ROOT, "appkit", "src");

/** Fully wired — every rule below is enforced. */
const MIGRATED = [
  {
    /*
     * The physical box registry. `searchTxt` is built by
     * `buildStorageBoxSearchTxt` from the code, the box type and the location
     * — exactly the three fields `AdminStorageBoxesView`'s `search.fields`
     * names, so the placeholder promises only what the index can match.
     *
     * 🛑 Token search, NOT the public artifact. A box is operational: an
     * operator finds `AC60-03` because they are holding it. Putting 100+ box
     * codes into the ~420 KB artifact every browser downloads would cost
     * every visitor for a surface only staff can open.
     *
     * `location` is a free-text shelf note ("Shelf B, second from top") and is
     * in no PII list, so indexing it discloses nothing — see the note on
     * audit-pii-crypto, which briefly believed otherwise because
     * `SessionRepository` declares an unrelated `location.city`.
     */
    name: "storageBoxes",
    schema: "features/inventory/schemas/firestore.ts",
    repo: "features/inventory/repository/storage-boxes.repository.ts",
    seeds: [],
    indexCollection: "storageBoxes",
  },
  {
    /*
     * Migrated 2026-10-17, and the only one of the former eleven "pending"
     * collections that was genuinely pending.
     *
     * `searchTxt` is built from `productTitle` + `userName`. 🛑 `userEmail` is
     * excluded: it is the sole entry in `BID_PII_FIELDS`, and a plaintext
     * prefix index over an encrypted field hands back what the encryption
     * withholds (decision D1). `userName` is already in `BID_PUBLIC_FIELDS`,
     * so indexing it discloses nothing new.
     *
     * What it replaced, on two surfaces:
     *   /api/store/bids — `userName@=`, which is Firestore's only prefix and
     *     is CASE-SENSITIVE. A seller typing "ravi" did not find "Ravi", and
     *     "kumar" never found Ravi Kumar at all, while the box read as working.
     *   /api/user/bids  — `.includes()` over ONE PAGE, after paging, with
     *     `total = bids.length` afterwards. A match on page 2 was unreachable
     *     and the total then asserted the page was the whole result set.
     */
    name: "bids",
    schema: "features/auctions/schemas/firestore.ts",
    repo: "features/auctions/repository/bid.repository.ts",
    seeds: ["seed/bids-seed-data.ts"],
    indexCollection: "bids",
  },
  {
    /*
     * W11. `searchTxt` is built from `subject` ONLY — `description` and every
     * message body are PII-encrypted at rest, and a plaintext prefix index
     * over an encrypted field hands back exactly what the encryption was
     * there to withhold.
     */
    name: "supportTickets",
    schema: "features/support/schemas/firestore.ts",
    repo: "features/support/repository/support.repository.ts",
    seeds: ["seed/support-tickets-seed-data.ts"],
    indexCollection: "supportTickets",
  },
  {
    name: "scammerProfiles",
    schema: "features/scams/schemas/firestore.ts",
    repo: "features/scams/repository/scammer.repository.ts",
    seeds: ["seed/scammers-seed-data.ts"],
    indexCollection: "scammerProfiles",
  },
  {
    /*
     * Migrated 2026-10-10. Before this, category search had no index at all:
     * `/api/admin/categories` scanned a window capped at 100 by
     * `SIEVE_DEFAULTS.maxPageSize` and filtered `name.includes()` in memory —
     * so raising the limit did nothing and the search silently stopped seeing
     * the tail past 100 rows, with the taxonomy heading to ~330. The public
     * route did not read `q` at all.
     *
     * `buildCategorySearchTxt` indexes `ancestors[].name`, which is the part
     * worth protecting: it is what lets "burst" reach a tier-4 model filed
     * under Beyblade Burst without naming it. No PII — `createdBy` is a raw
     * uid and `createdByStoreName` is operator identity; both are excluded.
     */
    name: "categories",
    schema: "features/categories/schemas/firestore.ts",
    repo: "features/categories/repository/categories.repository.ts",
    seeds: ["seed/categories-seed-data.ts"],
    indexCollection: "categories",
  },
  {
    name: "faqs",
    schema: "features/faq/schemas/firestore.ts",
    repo: "features/faq/repository/faqs.repository.ts",
    seeds: ["seed/faq-seed-data.ts"],
    indexCollection: "faqs",
  },
  {
    name: "products",
    schema: "features/products/schemas/firestore.ts",
    repo: "features/products/repository/products.repository.ts",
    seeds: [
      "seed/products-standard-seed-data.ts",
      // 🛑 The "easy miss" B6 names: a seed file absent from this list returns
      // ZERO search results forever, with no error anywhere.
      "seed/products-auctions-seed-data.ts",
      "seed/products-preorders-seed-data.ts",
      "seed/products-prize-draws-seed-data.ts",
      "seed/products-classifieds-seed-data.ts",
      "seed/products-digital-codes-seed-data.ts",
      "seed/products-live-items-seed-data.ts",
      "seed/products-art-seed-data.ts",
      "seed/products-stickers-seed-data.ts",
    ],
    indexCollection: "products",
  },
  {
    name: "stores",
    schema: "features/stores/schemas/firestore.ts",
    repo: "features/stores/repository/store.repository.ts",
    seeds: ["seed/stores-seed-data.ts"],
    indexCollection: "stores",
    indexedFields: false, // this schema has no *_INDEXED_FIELDS list of its own
  },
  {
    name: "events",
    schema: "features/events/schemas/firestore.ts",
    repo: "features/events/repository/events.repository.ts",
    seeds: ["seed/events-seed-data.ts"],
    indexCollection: "events",
  },
  {
    name: "blogPosts",
    schema: "features/blog/schemas/firestore.ts",
    repo: "features/blog/repository/blog.repository.ts",
    seeds: ["seed/blog-posts-seed-data.ts"],
    indexCollection: "blogPosts",
  },
  {
    name: "reviews",
    schema: "features/reviews/schemas/firestore.ts",
    repo: "features/reviews/repository/reviews.repository.ts",
    seeds: ["seed/reviews-seed-data.ts"],
    indexCollection: "reviews",
  },
  {
    name: "orders",
    schema: "features/orders/schemas/firestore.ts",
    repo: "features/orders/repository/orders.repository.ts",
    seeds: ["seed/orders-seed-data.ts"],
    indexCollection: "orders",
  },
  {
    name: "coupons",
    schema: "features/promotions/schemas/firestore.ts",
    repo: "features/promotions/repository/coupons.repository.ts",
    seeds: ["seed/coupons-seed-data.ts"],
    indexCollection: "coupons",
  },
  {
    name: "offers",
    schema: "features/seller/schemas/firestore.ts",
    repo: "features/seller/repository/offer.repository.ts",
    seeds: ["seed/offers-seed-data.ts"],
    indexCollection: "offers",
  },
];

/** Awaiting migration — reported, not enforced. */
/**
 * Re-triaged 2026-08-28 against the actual `*_COLLECTION` constants. Three
 * names were wrong and two were never collections at all, so the old count of
 * 16 overstated the backlog by five and pointed four of the rest at nothing.
 *
 *   scammers  -> scammerProfiles   (SCAMMER_COLLECTION)
 *   catalogue -> catalogueItems    (CATALOGUE_COLLECTION) — this misnaming also
 *                                  made the PII backfill a silent no-op for
 *                                  months; see backfill-pii.mjs
 *   media     -> mediaAssets       (the repository's super() argument)
 *
 * `bundles` and `sublistingCategories` are NOT collections. Both are rows in
 * `categories` discriminated by `categoryType` (SB-UNI-D / the sublisting
 * work), so migrating `categories` covers them and a separate entry could only
 * ever point at an empty collection — the exact failure the `catalogue` typo
 * produced.
 */
const NOT_COLLECTIONS = {
  bundles: 'categories rows with categoryType:"bundle"',
  sublistingCategories: 'categories rows with categoryType:"sublisting"',
};

/*
 * Collections that will NOT gain `searchTxt`, with the reason enforced.
 *
 * `views` names every listing view that reads the collection. `fields` is what
 * that view's `search` capability is allowed to declare — `[]` means it must
 * declare no search box at all. Both are checked below.
 */
/*
 * ---------------------------------------------------------------------------
 * INDEX_ARTIFACT_ONLY — searchable, but NOT through Firestore tokens.
 *
 * 🛑 A third verdict, and it exists because the first two could not express
 * the truth about these collections. `MIGRATED` would be a lie (they have no
 * tokens and never will) and `NOT_APPLICABLE` would be a worse one (they ARE
 * searchable, from the main box, better than a token index could manage).
 *
 * They are in the public search ARTIFACT — a ~420 KB file the browser holds —
 * which gives SUBSTRING matching that `array-contains` structurally cannot:
 * `search-txt.ts` states the limit outright, "word-prefix, not mid-word;
 * 'ariza' will not match 'charizard'". A linear scan gets mid-word free.
 *
 * So the rule for a member is the INVERSE of MIGRATED's: it must NOT declare
 * a `searchTxt` field. `partGlossary` declared one and had 0 of 752 documents
 * carrying it — for the entire life of the collection — and that was
 * invisible here because the collection appeared in no bucket at all. A
 * declared index at 0% coverage is exactly what this audit exists to catch,
 * and it could not see it.
 * ---------------------------------------------------------------------------
 */
const INDEX_ARTIFACT_ONLY = [
  {
    name: "partGlossary",
    why: "752 parts, searched through the public index artifact — /parts has a search box fed by `useSiteSearch({ types: ['part'] })`, and a code like `105` needs the classification shown per hit, which the artifact's `detail` carries",
    schema: join(APPKIT, "features", "parts", "schemas", "firestore.ts"),
  },
  {
    name: "modelComposition",
    why: "259 compositions, same artifact; a composition has no page of its own and resolves to its model's category leaf",
    schema: join(APPKIT, "features", "parts", "schemas", "firestore.ts"),
  },
];

const NOT_APPLICABLE = [
  /*
   * ── the two STAFF-CURATED PICKER collections ───────────────────────────
   *
   * Both are short, operational lists that exist to populate a <select>, and
   * neither is a thing a visitor searches FOR. The decision is recorded here
   * rather than in `audit-search-collection-coverage`'s BASELINE_COLLECTIONS
   * because that file's own header says expanding the baseline is the WRONG
   * fix — it silences the question instead of answering it.
   *
   * 🛑 Neither declares `searchTxt`, and neither should. A reason is reached
   * by opening the dispute form; a box preset by opening the dispatch form.
   * In both cases the full list is already on screen, so a token index would
   * be a second copy of a dropdown.
   */
  /*
   * Per-store WhatsApp Business wiring: phone id, WABA id, catalogue id,
   * template names and an encrypted access token. It is machine
   * configuration for an integration, not content — nobody searches FOR a
   * store's WhatsApp config, and the one field a human would recognise
   * (the store itself) is already findable through `stores`.
   *
   * 🛑 It also carries a SECRET. `whatsappConfig.accessToken` is listed in
   * STORE_SECRET_FIELDS and is double-encrypted, so putting any of this row
   * into the public search artifact would be a new way for it to leak.
   * "Not searchable" here is a security property, not just a product one.
   */
  {
    name: "storeWhatsAppConfig",
    why: "machine configuration for a per-store integration, not content — and the row carries a double-encrypted access token, so keeping it out of the public index artifact is a security property rather than a preference",
    schema: join(APPKIT, "features", "store-extensions", "schemas", "firestore.ts"),
    views: [],
    fields: [],
  },
  {
    name: "disputeReasons",
    why: "a staff-curated picker list — the buyer sees every active reason for their dispute kind in one <select>, so there is nothing to search; the ORDER snapshots the label, so history does not depend on this row being findable",
    schema: join(APPKIT, "features", "dispute-reasons", "schemas", "firestore.ts"),
    views: [],
    fields: [],
  },
  {
    name: "shippingBoxes",
    why: "a global library of named carton presets, picked from a dropdown on the dispatch form; a seller chooses by size, not by typing a name, and the list is short enough to render whole",
    schema: join(APPKIT, "features", "shipping-boxes", "schemas", "firestore.ts"),
    views: [],
    fields: [],
  },
  /*
   * ── per-store INTEGRATION CONFIG ────────────────────────────────────────
   *
   * One document per store holding that store's WhatsApp business catalogue
   * settings and auto-replies. It is reached from the owning store's own
   * settings page and nowhere else — there is no list of these, so there is
   * no list to search. It declares no `searchTxt`, which is the rule for this
   * bucket, and it should not: the only field a human would recognise is the
   * store's name, which lives on `stores` and is already searchable there.
   *
   * It also holds a live Meta access token, so a token index over it would be
   * a second place that credential's neighbourhood is copied to.
   */
  {
    name: "storeWhatsAppConfig",
    why: "per-store integration config, one document per store, reached only from that store's own settings page — there is no list of them to search, and the only human-recognisable field (the store name) is searchable on `stores`",
    schema: join(APPKIT, "features", "store-extensions", "schemas", "firestore.ts"),
    views: [],
    fields: [],
  },
  {
    /*
     * ── the two inventory JOIN/LEDGER collections ──────────────────────────
     *
     * Neither declares `searchTxt`, and neither should. A placement is a
     * `boxId × productId` join row and a movement is an append-only ledger
     * entry; both are reached by FILTERING from a box or a product you already
     * have, never by typing a word. There is nothing on either row a human
     * would search FOR — no title, no name, no code of its own.
     *
     * 🛑 `inventoryMovements` is append-only EVIDENCE: the repository
     * overrides `update` and `delete` to throw so history cannot be rewritten.
     * A searchable mirror of it would be a second copy of that history with
     * none of those guarantees.
     */
    name: "inventoryPlacements",
    why: "a boxId × productId join row with no human-readable field of its own — reached by filtering from the box or the product, never by a search term",
    schema: join(APPKIT, "features", "inventory", "schemas", "firestore.ts"),
    // No search box on either surface, so there is nothing to cross-check.
    views: [],
    fields: [],
  },
  {
    name: "inventoryMovements",
    why: "an append-only stock ledger, filtered by box/product/date from the move-ledger view; the repository blocks update and delete so a searchable mirror would be an unguarded second copy of the evidence",
    schema: join(APPKIT, "features", "inventory", "schemas", "firestore.ts"),
    views: [],
    fields: [],
  },
  /*
   * ── 🛑 The two staff-curated PICKER libraries ───────────────────────────
   *
   * Both are short lists of staff-authored option rows, and both ARE searched
   * — by `label` / `name`, through an ordinary Sieve `canFilter` clause the
   * repository allowlists precisely because `PaginatedSelect` types into it.
   *
   * What neither needs is `searchTxt`. A token index exists to make a word
   * buried in prose findable across thousands of documents; these are eleven
   * reasons and a handful of cartons, whose whole searchable content IS the
   * one short field already being filtered. Adding `searchTxt` would be a
   * derived mirror of a 60-character string (Root Cause #42's shape) on a
   * collection a visitor never queries.
   *
   * And they are not publicly findable at all: a dispute reason is an option
   * inside a buyer's own form, reached by picking a KIND first, and a carton
   * preset is a seller's measurement default. Neither is a destination.
   */
  {
    name: "disputeReasons",
    why: "eleven staff-authored picker options whose entire searchable content is the `label` the repository already allowlists for filtering; reached by choosing a dispute KIND inside a form, never by a search term, and never public",
    schema: join(APPKIT, "features", "dispute-reasons", "schemas", "firestore.ts"),
    views: [],
    fields: [],
  },
  {
    name: "shippingBoxes",
    why: "a carton-size library whose searchable content is the `name` the repository already allowlists; a seller's measurement default inside the dispatch form, never a destination and never public",
    schema: join(APPKIT, "features", "shipping-boxes", "schemas", "firestore.ts"),
    views: [],
    fields: [],
  },
  /*
   * ── 🛑 beys / beyProducts — DISCOVERY IS THE CATEGORY LEAF ──────────────
   *
   * These are reference mirrors of taxonomy that is ALREADY searchable. Every
   * one of the 1,858 beys paired to a leaf shares its slug with
   * `category-{slug}`, and that leaf carries its own `searchTxt` built from
   * the name and aliases — so a visitor typing "Dragoon F" lands on the
   * category, which links straight to the bey page. Indexing both would put
   * two hits for one thing in the same result list.
   *
   * 🛑 NOT `INDEX_ARTIFACT_ONLY`, even though `partGlossary` is and beys
   * mirror parts in every other respect. That bucket's rule is only "must not
   * declare searchTxt" — it does NOT verify the collection is actually in
   * `PUBLIC_INDEX_SOURCES`. Claiming it without wiring the index would be an
   * exemption nobody checks, which is the precise failure Root Cause #106
   * records (a prefix allowlist commented "defined somewhere else",
   * unverified, hiding 40 real defects).
   *
   * Promoting beys INTO the artifact is a reasonable future call and needs a
   * measurement first, not a list edit: the artifact is ~420 KB that every
   * browser holds, and 1,988 more entries is a real page-weight decision.
   */
  {
    name: "beys",
    why: "1,988 reference rows whose discovery path is the category leaf they share a slug with — that leaf is already indexed and already links to /beys/{slug}, so a second hit for the same thing would be noise. Promoting it to the public index artifact needs a page-weight measurement first (the artifact is ~420 KB in every browser), not a bucket change",
    views: [],
    fields: [],
  },
  {
    name: "beyProducts",
    why: "366 boxed-product records with NO public page of their own — there is no /bey-products/{slug} route. They are read only as the 'found in' section of a bey page, resolved by id from that page's own query, so there is nothing for a search box to land on",
    views: [],
    fields: [],
  },

  // ── no search surface exists, so an index would serve nothing ───────────
  {
    name: "pointsLedger",
    why: "a buyer reads their own entries newest-first and there is nothing to search for — every row is one of four kinds with a generated description, and the only useful filter (which order caused this) is a link, not a query. Indexing it would also put one user's balance history into a public artefact for no reader",
    views: [],
    fields: [],
  },
  {
    name: "shipments",
    why: "no search box on AdminShipmentsView — procurement is browsed by status and date, and a shipment id is a generator id nobody types",
    views: ["AdminShipmentsView"],
    fields: [],
  },
  /*
   * ── Phase 7 invoicing — two counters, and a counter is not searchable ────
   *
   * `invoiceCounters` holds one document per (series, financial year) whose
   * entire content is an integer. There is nothing to search for and no view
   * that lists them; the operator-facing question ("what number are we on") is
   * answered by the number on the last invoice.
   *
   * `invoiceAllocations` is the idempotency ledger for the series — one row per
   * numbered document, written by the allocating transaction. A human looking
   * for an invoice searches ORDERS (where the number is also stored and
   * rendered) or types the number into their accounting software; this
   * collection exists so a number cannot be issued twice, not so anyone can
   * browse it. Indexing it would also put every buyer's invoice number into a
   * public artefact for no reader.
   */
  {
    name: "invoiceCounters",
    why: "one document per (series, FY) whose content is an integer — nothing to search, no view lists them, and 'what number are we on' is answered by the last invoice issued",
    views: [],
    fields: [],
  },
  {
    name: "invoiceAllocations",
    why: "the series' idempotency ledger, one row per numbered document. An invoice is found through its ORDER (which stores and renders the same number) or typed into accounting software; this exists so a number cannot be issued twice, not to be browsed — and indexing it would publish every buyer's invoice number for no reader",
    views: [],
    fields: [],
  },
  {
    name: "groupedListings",
    why: "no search box on either view — a group is reached from the product it decorates, not by name",
    views: ["AdminGroupedListingsView", "SellerGroupedListingsView"],
    fields: [],
  },
  {
    name: "mediaAssets",
    why: "no search box on AdminMediaView — assets are browsed by context type, and the filename is a derived slug the admin never authored",
    views: ["AdminMediaView"],
    fields: [],
  },
  {
    name: "catalogueItems",
    why: "no search box on AdminCatalogueApprovalsView — the approval queue is short by construction and ordered by submission",
    views: ["AdminCatalogueApprovalsView"],
    fields: [],
  },
  {
    name: "itemRequests",
    why: "no listing view exists",
    views: [],
    fields: [],
  },
  {
    name: "jobs",
    why: "no listing view exists — jobs are observed through the bulk-event channel that created them",
    views: [],
    fields: [],
  },

  // ── the search is an OPAQUE ID, matched by equality ─────────────────────
  {
    /*
     * `/api/admin/notifications` builds `userId==${q}`, and the view says so.
     * A uid has no word boundaries, so `buildSearchTxt` would emit prefix
     * n-grams of a random string — an index that is larger than the field and
     * matches nothing a human would type.
     */
    name: "notifications",
    why: "searches userId by equality — a token index over an opaque id is meaningless",
    views: ["AdminNotificationsView"],
    fields: ["userId"],
  },
  {
    name: "adminAuditLog",
    why: "searches actorUid by equality, for the same reason",
    views: ["AdminAuditLogView"],
    fields: ["actorUid"],
  },
  /*
   * ── the payment-observability collections ─────────────────────────────────
   *
   * Operational records with no public surface and no human-authored prose to
   * tokenise. Every field is an id, an enum, a timestamp or a redacted
   * machine payload — so `searchTxt` would index gateway identifiers, which an
   * operator looks up by EXACT equality from a dashboard or a gateway's own
   * delivery log, never by word-prefix.
   *
   * 🛑 `views: []` is accurate TODAY and must be revisited when Phase 8 adds
   * `/admin/maintenance/gateway-events` and `/admin/money-cases`. Naming a view
   * that does not exist yet fires VERDICT_VIEW_MISSING, so it cannot be
   * pre-registered — but the moment those views land, add their names here with
   * `fields: []`, which is what makes VERDICT_STALE_NO_SURFACE fire if somebody
   * later adds a search box and quietly indexes a payment identifier.
   */
  {
    name: "gatewayEvents",
    why: "the durable webhook inbox — ids, enums, timestamps and a redacted payload. Looked up by gateway order id or the provider's own event id, both exact-match; the one human-readable field is `rawEvent`, which is a fixed vocabulary of ~30 provider event names better served by a filter chip than a token index",
    views: [],
    fields: [],
  },
  {
    name: "refundClaims",
    why: "idempotency gates keyed on a sha256 of the caller's own idempotency key. There is nothing to search: the only lookup is 'does this id exist', which IS the mechanism. Declared here because it is a NEW collection and audit-search-collection-coverage is strict-zero on undecided ones — it was added with the Phase 1 refund hardening and had no recorded decision, which would have failed that audit",
    views: [],
    fields: [],
  },
  {
    name: "protectionClaims",
    why: "a buyer's claim against protection cover. Admin-only triage, found by filtering status/kind and by the order it belongs to — the one free-text field is the buyer's own account of the problem, which an operator READS on the case rather than searching across claims. Keyed one-per-(order,kind), so the natural lookup is by order id, not by word",
    views: [],
    fields: [],
  },
  {
    name: "obligations",
    why: "a derived due-date index over orders — kind, subjectId, dueAt and a state enum, with no human-authored text at all. Nothing searches it and nothing should: an operator looking at a deadline looks at the ORDER. It is queried by exactly one shape (state + dueAt) and read by one sweep",
    views: [],
    fields: [],
  },
  {
    name: "paymentCases",
    why: "the operator queue for money at risk. Admin-only, never public, and found by FILTERING (kind, severity, status, nearest dueAt) rather than by searching prose — the two free-text fields, title and detail, are machine-generated from ids and enums, so indexing them would index gateway identifiers an operator looks up by exact match anyway. Same views caveat as gatewayEvents: add /admin/money-cases here with fields: [] when Phase 8 builds it",
    views: [],
    fields: [],
  },
  /*
   * ── the BOOKS ────────────────────────────────────────────────────────────
   *
   * Three collections, one decision. The ledger is a record of what happened
   * to money, read by period and by account code — never by prose, and never
   * by a visitor. Every free-text field on a journal entry is derived: the
   * memo is composed from the source event and its id, and the account name
   * comes from `chartOfAccounts`, whose entire contents are twenty-odd rows
   * already on screen in any report.
   *
   * 🛑 These are PERMANENT and admin-only (they are in the tester harness's
   * PRESERVE tier for the same reason — a test run must never leave the books
   * transiently empty). A token index over them would publish nothing a
   * visitor can reach and would add a write to the one write path that must
   * stay cheap: every posted entry is inside the transaction that posts it.
   */
  {
    name: "journalEntries",
    why: "double-entry postings, read by PERIOD and account code through purpose-built report queries, never by prose — the memo is machine-composed from sourceEvent + sourceId, which an operator looks up by exact match anyway. Admin-only and never public",
    views: [],
    fields: [],
  },
  {
    name: "chartOfAccounts",
    why: "the account list itself — a fixed, staff-curated set of about two dozen codes that every report renders in full, so there is nothing to search FOR; the same reasoning as the two picker lists above",
    views: [],
    fields: [],
  },
  {
    name: "accountingPeriods",
    why: "one row per GST period, addressed by its own id (the period key) and never by prose. The only free-text field is a lock reason an admin reads on the one period they just locked",
    views: [],
    fields: [],
  },
  /*
   * ── ad bookings ──────────────────────────────────────────────────────────
   *
   * The document id IS `{placementId}__{period}`, which is the only lookup
   * key anyone uses: a slot is resolved by deriving that id, an advertiser's
   * own bookings by an equality on `advertiserUid`, and the moderation queue
   * by an equality on `moderation.state`. None of those is a search.
   *
   * 🛑 The free-text fields are the advertiser's own CREATIVE — headline, body
   * and the CTA url. Indexing them would make unreviewed, unapproved copy
   * findable, which is precisely what the moderation gate exists to prevent:
   * `isAdBookingLive` refuses to render a booking until it is approved AND
   * paid, and a token index would be a second, ungated reader of the same text.
   */
  {
    name: "adBookings",
    why: "addressed by a DERIVED document id ({placementId}__{period}) or by an equality on advertiserUid / moderation.state — never searched. Its only free text is unreviewed advertiser creative, which must not become findable ahead of the moderation gate that decides whether it may render at all",
    views: [],
    fields: [],
  },
];

/*
 * Collections whose search is PII-bound.
 *
 * Not "not applicable" — the non-PII half of each box (`sellerName`,
 * `displayName`) IS indexable. But the PII half resolves an HMAC blind index
 * and matches EXACTLY, so adding a token index for the other field means one
 * input driving two query shapes with two different match semantics, and a box
 * labelled "exact match" that is sometimes partial. That is a design decision
 * about the search UX, not a cleanup, and it is deliberately not taken here.
 *
 * `piiField` must stay in the collection's PII registry. If it is ever removed
 * from there the field is plaintext anyway, this reasoning evaporates, and the
 * check below fails so the decision gets retaken rather than inherited.
 */
const PII_BOUND = [
  {
    name: "payouts",
    views: ["AdminPayoutsView"],
    fields: ["sellerEmail", "sellerName"],
    piiField: "sellerEmail",
    piiRegistry: "PAYOUT_PII_FIELDS",
  },
  {
    name: "users",
    views: ["AdminUsersView"],
    fields: ["displayName", "email"],
    piiField: "email",
    piiRegistry: "USER_PII_FIELDS",
  },
];

/*
 * `AdminTeamView` is deliberately absent from `users` above.
 *
 * It reads the same collection but filters AFTER `mapDoc` has decrypted, with
 * `(u.email ?? "").toLowerCase().includes(q)` — genuinely partial, which its
 * own comment states. So its box is honest about what it does and needs no
 * index; listing it here would assert a `fields` contract that does not match
 * the one capability it declares.
 */

// Enforced, not just documented. A name here is a collection that does not
// exist, so a migration targeting it would query nothing and report success —
// which is precisely what the `catalogue`/`catalogueItems` typo did to the PII
// backfill for months. Cheap to check, and it makes the note above load-bearing
// rather than a comment someone can silently contradict.
for (const [name, why] of Object.entries(NOT_COLLECTIONS)) {
  const claimed = [
    ...NOT_APPLICABLE.map((x) => x.name),
    ...PII_BOUND.map((x) => x.name),
    ...MIGRATED.map((x) => x.name),
    ...INDEX_ARTIFACT_ONLY.map((x) => x.name),
  ];
  if (claimed.includes(name)) {
    console.error(
      `audit-searchtxt-migration: "${name}" is not a Firestore collection — ${why}. ` +
      `A migration targeting it would query nothing and pass.`,
    );
    process.exit(1);
  }
}

/** Field names that must never feed searchTxt (decision D1). */
const PII_SHAPED = /\b(email|phone|upiVpa|accountNumber|ifsc|password|token|ip)\b/i;

const read = (rel) => {
  const p = join(APPKIT, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
};

const violations = [];
const v = (rule, where, why) => violations.push({ rule, where, why });

// Indexes live in the appkit base file (the root copy is generated from it).
const indexPath = join(REPO_ROOT, "appkit", "firebase", "base", "firestore.indexes.json");
let indexes = [];
try {
  indexes = JSON.parse(readFileSync(indexPath, "utf8")).indexes ?? [];
} catch {
  v("INDEX_FILE_UNREADABLE", indexPath, "cannot verify composite indexes");
}

for (const c of MIGRATED) {
  const schema = read(c.schema);
  const repo = read(c.repo);

  if (!schema) { v("SCHEMA_MISSING", c.schema, `${c.name}: schema not found`); continue; }
  if (!repo) { v("REPO_MISSING", c.repo, `${c.name}: repository not found`); continue; }

  // 1 — on the interface
  if (!/searchTxt\??:\s*string\[\]/.test(schema)) {
    v("FIELD_NOT_DECLARED", c.schema, `${c.name}: no \`searchTxt?: string[]\` on the document interface`);
  }

  // 2 — in the indexed-field list (skipped where the schema has no such list)
  if (c.indexedFields !== false && !/["']searchTxt["']/.test(schema)) {
    v("NOT_IN_INDEXED_FIELDS", c.schema, `${c.name}: "searchTxt" missing from *_INDEXED_FIELDS`);
  }

  // 3 — filterable in SIEVE_FIELDS
  /*
   * 🛑 Accept a COMPUTED key too — `[X_FIELDS.SEARCH_TXT]: { canFilter: true }`.
   *
   * The literal-only form matched `searchTxt:` and nothing else, so a
   * repository obeying `audit-route-nav-field-constants` R3 (field names must
   * come from a `*_FIELDS` constant) failed this one. `storage-boxes` declares
   * `[STORAGE_BOX_FIELDS.SEARCH_TXT]: { canFilter: true, canSort: false }` and
   * was reported as missing the field entirely — two audits requiring opposite
   * spellings, with the correct one failing.
   */
  const FILTERABLE_SEARCH_TXT =
    /(?:searchTxt|\[\s*[A-Za-z_$][\w$]*\.SEARCH_TXT\s*\])\s*:\s*\{[^}]*canFilter:\s*true/;
  if (!FILTERABLE_SEARCH_TXT.test(repo)) {
    v("NOT_FILTERABLE", c.repo, `${c.name}: searchTxt missing from SIEVE_FIELDS with canFilter — Sieve drops the clause silently`);
  }

  // 4 — every seed file derives tokens
  for (const seedRel of c.seeds) {
    const seed = read(seedRel);
    if (!seed) { v("SEED_MISSING", seedRel, `${c.name}: seed file not found`); continue; }
    // Either the literal field or a derivation call — `withStoreSearchTxt` is
    // capital-S and would not match a case-sensitive /searchTxt/.
    const setsTokens = /searchTxt/.test(seed) || /SearchTxt\(|\.map\(\s*with\w*SearchTxt/.test(seed);
    if (!setsTokens) {
      v("SEED_NO_TOKENS", seedRel, `${c.name}: seed file never sets searchTxt — array-contains will match zero docs`);
    }
    // The wrapper form is what makes omission impossible; an inline literal per
    // record is how five product seed files shipped their last fixture without
    // tokens. Require a mapped/derived form, not a bare per-record literal.
    /*
     * 🛑 Matched by SHAPE, not by an enumeration of builder names.
     *
     * This was `/\.map\(\s*with\w*SearchTxt|withProductSearchTxt|buildFaqSearchTxt|buildSearchTxt\(/`
     * — three specific names plus one pattern. So `buildBidSearchTxt(` failed
     * it: the alternation needs `buildSearchTxt(` contiguously, and that
     * substring is not in `buildBidSearchTxt(`. A seed that derived its tokens
     * correctly, through the same builder the repository's write hook uses,
     * was reported as writing them per record.
     *
     * That is Root Cause #84 in a regex: a measurement narrower than the rule
     * it feeds, where every NEW collection fails for being new. The generalised
     * form is not weaker — a hand-written `searchTxt: ["a", "b"]` still calls
     * no builder and still fails, which is the behaviour this rule exists for.
     */
    const derived =
      /\.map\(\s*with\w*SearchTxt/.test(seed) ||
      /\bwith\w*SearchTxt\s*\(/.test(seed) ||
      /\bbuild\w*SearchTxt\s*\(/.test(seed);
    if (!derived) {
      v("SEED_NOT_DERIVED", seedRel, `${c.name}: tokens must be derived via a wrapper/map, not written per record`);
    }
  }

  // 5 — a composite index mentioning searchTxt
  const hasIndex = indexes.some(
    (idx) => idx.collectionGroup === c.indexCollection &&
      (idx.fields ?? []).some((f) => f.fieldPath === "searchTxt"),
  );
  if (!hasIndex) {
    v("NO_COMPOSITE_INDEX", c.indexCollection, `${c.name}: no composite index on searchTxt — the query throws FAILED_PRECONDITION, which callers swallow`);
  }

  // 6 — no PII feeding it
  const builderMatch = repo.match(/buildSearchTxt\(\[([\s\S]{0,600}?)\]/);
  if (builderMatch && PII_SHAPED.test(builderMatch[1])) {
    v("PII_IN_SEARCHTXT", c.repo, `${c.name}: a PII-shaped field feeds searchTxt — encryption and partial-match search are mutually exclusive (D1)`);
  }

  // ---------------------------------------------------------------------
  // Rules 7 and 8 are why this audit certified FOUR half-migrations.
  //
  // Rules 1-6 check the interface, the indexed-field list, the Sieve config,
  // the seed tokens, the composite index and PII. `stores`, `events`,
  // `blogPosts` and `reviews` satisfied ALL SIX while their repositories
  // contained exactly one line about searchTxt — the SIEVE_FIELDS entry. Seed
  // rows had tokens; anything created through the app had none, and nothing
  // ever queried the field. Being searchable takes SEVEN things, and the two
  // nobody wrote down are the two that make it work.
  // ---------------------------------------------------------------------

  // 7 — a WRITE path derives the field
  const hasWritePath =
    /buildSearchTxtFor\s*\(/.test(repo) ||        // the BaseRepository hook
    /searchTxt:\s*build\w*SearchTxt\(/.test(repo); // or an inline derivation
  if (!hasWritePath) {
    v("NO_WRITE_PATH", c.repo,
      `${c.name}: nothing derives searchTxt on write — only SEEDED rows are searchable, and anything a user creates is invisible to search forever`);
  }

  // 8 — a READ path queries the field
  const hasReadPath = /array-contains["']?\s*,|["']array-contains["']/.test(repo)
    && /SEARCH_TXT|["']searchTxt["']/.test(repo);
  if (!hasReadPath) {
    v("NO_READ_PATH", c.repo,
      `${c.name}: nothing queries searchTxt with array-contains — the field is written and then never read, so search returns whatever the caller's other filters happen to match`);
  }
}

// The old field must be gone everywhere — a leftover means a half-done rename.
const STALE_ROOTS = [join(APPKIT), join(REPO_ROOT, "src")];
function* walk(root) {
  const { readdirSync } = require("node:fs");
  let e; try { e = readdirSync(root, { withFileTypes: true }); } catch { return; }
  for (const x of e) {
    if (["node_modules", "dist", ".next", "out", "__tests__"].includes(x.name)) continue;
    const f = join(root, x.name);
    if (x.isDirectory()) yield* walk(f);
    else if (/\.(ts|tsx)$/.test(x.name)) yield f;
  }
}
const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);
for (const root of STALE_ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8");
    // Doc comments referencing the historical name are fine; code is not.
    const codeHit = src.split(/\r?\n/).some(
      (l) => /searchTokens/.test(l) && !/^\s*(\/\*|\*|\/\/)/.test(l.trim()),
    );
    if (codeHit) {
      v("STALE_SEARCHTOKENS", file.replace(REPO_ROOT + "\\", "").replace(REPO_ROOT + "/", ""),
        "`searchTokens` still referenced in code — the rename is half-done");
    }
  }
}


/*
 * ---------------------------------------------------------------------------
 * Enforce the NOT_APPLICABLE and PII_BOUND verdicts.
 *
 * 🛑 This is the half that makes removing PENDING honest rather than cosmetic.
 *
 * A name moved out of a reported list and into a comment is a number that went
 * to zero without anything changing — the shape Root Cause #22 is about. So
 * each verdict is re-derived from the view files it names: the claim "this
 * collection has no search box" is only worth making if adding one fails the
 * build and forces someone to pick between migrating and re-justifying.
 *
 * It reads the `search` capability rather than any `q` plumbing, because the
 * capability IS the user-visible promise — `audit-listing-search-capability`
 * already checks that a declared box is actually served.
 * ---------------------------------------------------------------------------
 */
const VIEW_ROOTS = [APPKIT, join(REPO_ROOT, "src")];

/** Resolve `AdminFooView` → its file, or null. Basenames are unique here. */
function findView(name) {
  for (const root of VIEW_ROOTS) {
    for (const file of walk(root)) {
      /*
       * `basename`, not a hand-rolled split on a separator class. `join()`
       * yields backslashes on Windows, so a split that only knows `/` returns
       * the whole path and every lookup misses — which reads as "the view does
       * not exist" and would have retired all nine verdicts as untrustworthy
       * while the files sat right there.
       */
      const base = basename(file);
      if (base === `${name}.tsx` || base === `${name}.ts`) return file;
    }
  }
  return null;
}

/**
 * The `fields: [...]` array of a view's `search` capability, or null when the
 * view declares no search box.
 *
 * Deliberately brace-aware rather than a flat regex: a `search: {` block can
 * contain a comment mentioning other field names (several of them do), and a
 * greedy match would read those as declared fields.
 */
function searchFields(src) {
  const at = src.search(/\bsearch:\s*\{/);
  if (at === -1) return null;
  const open = src.indexOf("{", at);
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return [];
  const block = src.slice(open, end);
  const m = block.match(/fields:\s*\[([^\]]*)\]/);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim().replace(/^["'`]|["'`]$/g, ""))
    .filter(Boolean);
}

const same = (a, b) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

for (const entry of [...NOT_APPLICABLE, ...PII_BOUND]) {
  for (const viewName of entry.views) {
    const file = findView(viewName);
    if (!file) {
      v("VERDICT_VIEW_MISSING", viewName,
        `${entry.name}: the verdict names a view that does not exist — the reason cannot be checked, so it cannot be trusted`);
      continue;
    }
    const declared = searchFields(readFileSync(file, "utf8"));
    const expected = entry.fields;

    if (expected.length === 0) {
      if (declared !== null) {
        v("VERDICT_STALE_NO_SURFACE", viewName,
          `${entry.name}: declared as having no search surface, but this view now declares one over [${declared.join(", ")}] — decide: migrate the collection to searchTxt, or re-justify`);
      }
      continue;
    }

    if (declared === null) {
      v("VERDICT_SURFACE_GONE", viewName,
        `${entry.name}: the verdict rests on a search box over [${expected.join(", ")}] and this view no longer has one — the entry is describing something that is not there`);
    } else if (!same(declared, expected)) {
      v("VERDICT_FIELDS_DRIFTED", viewName,
        `${entry.name}: verdict assumes [${expected.join(", ")}], view declares [${declared.join(", ")}] — a field added here is a field nothing indexes`);
    }
  }
}

/*
 * PII_BOUND's reason is "the field is encrypted". Confirm it still is: if the
 * field leaves its PII registry it is plaintext, the argument evaporates, and
 * the collection becomes an ordinary migration candidate.
 */
const piiSchemas = read("security/pii-schemas.ts");
if (!piiSchemas) {
  v("PII_SCHEMAS_MISSING", "security/pii-schemas.ts", "cannot verify PII_BOUND verdicts");
} else {
  for (const entry of PII_BOUND) {
    /*
     * Index-based, not a regex. Building one by interpolating the registry
     * name into a template literal costs a backslash level at every hop that
     * rewrites this file, and a half-escaped character class is a SyntaxError
     * at load — which fails the audit for a reason that has nothing to do with
     * what it checks.
     */
    const at = piiSchemas.indexOf(entry.piiRegistry + " =");
    const open = at === -1 ? -1 : piiSchemas.indexOf("[", at);
    const close = open === -1 ? -1 : piiSchemas.indexOf("]", open);
    const body = close === -1 ? null : piiSchemas.slice(open + 1, close);

    if (body === null) {
      v("PII_REGISTRY_MISSING", entry.piiRegistry,
        `${entry.name}: the verdict cites a PII registry that no longer exists`);
    } else if (
      !body.includes('"' + entry.piiField + '"') &&
      !body.includes("'" + entry.piiField + "'")
    ) {
      v("PII_FIELD_NOT_ENCRYPTED", entry.piiRegistry,
        `${entry.name}: "${entry.piiField}" is no longer in ${entry.piiRegistry}, so it is stored in plaintext — the "a token index would undo the encryption" reason no longer holds and this collection should be reconsidered for searchTxt`);
    }
  }
}

/*
 * ---------------------------------------------------------------------------
 * INDEX_ARTIFACT_ONLY — the INVERSE rule.
 *
 * A member must NOT declare `searchTxt`. The whole reason the bucket exists
 * is that a declared-but-never-written index is a promise the corpus cannot
 * keep, and it reads to every later developer as "this is searchable through
 * Firestore" — which would send them to add a push-down that no document can
 * satisfy.
 *
 * Checked against the schema FILE rather than a document count, because a
 * count needs credentials and this has to run in `npm run check`.
 * ---------------------------------------------------------------------------
 */
for (const entry of INDEX_ARTIFACT_ONLY) {
  if (!existsSync(entry.schema)) {
    v("INDEX_ONLY_SCHEMA_MISSING", entry.schema,
      `${entry.name}: the verdict cites a schema file that no longer exists`);
    continue;
  }
  const body = readFileSync(entry.schema, "utf8");
  /*
   * Match a DECLARATION, not a mention — the file now carries a 🛑 comment
   * explaining the removal, and a rule that fired on its own documentation
   * would be unfixable except by deleting the explanation.
   */
  if (/^\s*searchTxt\??:\s*string\[\]/m.test(body)) {
    v("INDEX_ONLY_DECLARES_SEARCHTXT", entry.schema,
      `${entry.name} is INDEX_ARTIFACT_ONLY but its schema declares a searchTxt field. ` +
        `partGlossary carried that declaration with 0 of 752 documents written — ` +
        `a declared index at 0% coverage, invisible to this audit because the ` +
        `collection was in no bucket. Searchability comes from the public artifact; ` +
        `remove the field or move the collection to MIGRATED and actually write it.`);
  }
}

if (violations.length > 0) {
  console.error(`audit-searchtxt-migration: ${violations.length} violation(s).`);
  for (const x of violations) {
    console.error(`  [${x.rule}] ${x.where}`);
    console.error(`      → ${x.why}`);
  }
  process.exit(1);
}

console.log(
  `audit-searchtxt-migration: clean ✓ (${MIGRATED.length} migrated, 0 pending; ` +
    `${NOT_APPLICABLE.length} not applicable, ${PII_BOUND.length} PII-bound, ${INDEX_ARTIFACT_ONLY.length} artifact-only — all enforced)`,
);
