/*
 * 🛑 THE TIER BOUNDARY. Read this before changing any list below.
 *
 * A tester run wipes the seeded catalog and re-seeds it. That is only tolerable
 * because it runs against a database where real PEOPLE are preserved and only the
 * catalog — and the transactional rows pointing at it — are disposable.
 *
 * Every collection belongs to exactly one tier:
 *
 *   PRESERVE  never touched. Real accounts, their logins, their saved addresses,
 *             and siteSettings (which carries the AES-encrypted live API keys).
 *   SEED_OWNED deleted wholesale and re-seeded to a known state.
 *   CASCADE   deleted only where a row REFERENCES something in SEED_OWNED.
 *
 * Two rules make the boundary hold:
 *
 *   1. A collection not named here is PRESERVED BY DEFAULT. `assertDeletable`
 *      throws on anything unlisted, so a collection added to the app later is
 *      excluded until someone deliberately classifies it — the opposite of the
 *      usual failure, where a new thing silently joins the sweep.
 *   2. SEED_OWNED mirrors appkit's TEST_DATA_COLLECTIONS plus the rest of the
 *      catalog. It is a superset on purpose and is checked against the seed
 *      modules by scripts/audit-tester-plugin-wiring.mjs in the parent repo.
 */

/**
 * Never deleted, never re-seeded. Damage here is the only permanent damage a run
 * can do.
 *
 * `payoutMethods` holds real sellers' bank and UPI details, and `adminAuditLog` is
 * the record of privileged admin actions — an audit trail is not something a test
 * run gets to erase. Both were UNCLASSIFIED until a live clear surfaced them.
 */
export const PRESERVE = Object.freeze([
  "users",
  "addresses",
  "sessions",
  "siteSettings",
  "payoutMethods",
  "adminAuditLog",
  // slug -> uid index for real accounts. Deleting it orphans public profile URLs
  // for people whose accounts survive, so it belongs with the users it indexes.
  "userSlugs",
  /*
   * ── the inventory triple ─────────────────────────────────────────────────
   *
   * A wipe here is a delete with NO RESTORE and no seed data to restore from,
   * because the rows describe the physical world: a box exists because
   * somebody labelled a real box, and a placement exists because somebody put
   * a real object in it. Re-running the loader brings back nothing; the only
   * recovery is walking to the shelf with a clipboard.
   *
   * 🛑 `inventoryMovements` is append-only EVIDENCE. Its repository overrides
   * `update` and `delete` to throw so history cannot be rewritten — a tester
   * wipe would do in one command what the repository refuses one row at a
   * time, which would make the whole guarantee decorative.
   *
   * These are PRESERVE and not CASCADE even though placements reference
   * `productId`, which IS seed-owned. A cascade would be the wrong shape: a
   * product being re-seeded does not mean the physical object left the box.
   * The placement would be stale, and a stale placement is a reconciliation
   * report — which is exactly what the `adjust` movement exists for — whereas
   * a deleted one is lost information.
   */
  "storageBoxes",
  "inventoryPlacements",
  "inventoryMovements",
  /*
   * The business's own statutory registration documents — GST certificate,
   * Udyam registration, bank passbook. There is no seed data and there cannot
   * be: the rows point at AES-encrypted objects under
   * `private/business-documents/`, uploaded once by
   * `scripts/upload-business-documents.mjs` from files that are deliberately
   * gitignored.
   *
   * So a wipe here is a delete with no restore, and it orphans the bucket the
   * same way clearing `mediaAssets` orphaned 504 objects in production — except
   * that the staging copies under `public/business/` are disposable after
   * upload, so the bytes may be genuinely unrecoverable. Same reasoning as
   * `stickerSheets` below.
   *
   * Listed explicitly rather than relying on the preserved-by-default rule: an
   * unclassified collection makes `assertDeletable` THROW mid-run, which is
   * safe but reads as a harness fault. `payoutMethods` and `adminAuditLog` are
   * both here for exactly that reason, after a live clear surfaced them.
   */
  "businessDocuments",
  /*
   * The sticker kiss-cut tracer. Admin work product, and the seed holds NONE
   * of it on purpose — a seeded sheet would reference Storage bytes that do not
   * exist, so every image would 404 and a tester would record a defect against
   * a fixture gap (Root Cause #90, inverted).
   *
   * So a wipe here is a delete with no restore: it orphans the whole
   * `private/sticker-sheets/` tree in Storage exactly as clearing `mediaAssets`
   * orphaned 504 objects in production, and loses the run history that IS the
   * feature.
   *
   * `stickerTraceTasks` is transient fan-out rather than work product, but it
   * lands here by the same rule Root Cause #90 sets out — classify by what a
   * row REFERENCES, never by what it is called. A task references a `runId` and
   * a `sheetId`, neither of which is seed-owned, so a CASCADE would match
   * nothing and leave every row standing anyway.
   */
  "stickerSheets",
  "stickerTraceRuns",
  "stickerTraceTasks",
  /*
   * The box-code tables, series windows and generation summaries behind
   * /tools/authenticity. 🛑 MOVED FROM SEED_OWNED 2026-10-19, by explicit
   * instruction — it had been classified there on the reasoning that a
   * wipe-and-reseed is lossless because the seeder deterministically
   * regenerates the exact same rows from the archived sources every time.
   * That reasoning is true of the OUTCOME, and irrelevant to the request:
   * this is provenance data buyers and admin/support rely on to judge whether
   * an item is genuine, and it must never pass through an empty state at
   * all — not even the few seconds between a wipe and its reseed, and not
   * even transiently if a run dies between the two steps (lifecycle.mjs's
   * own `--recover <runId>` exists precisely because that gap is real).
   *
   * Each document is ALSO marked `seedPurpose: "permanent"` (see
   * appkit/src/seed/seed-purpose.ts), which protects it from `npx appkit-seed
   * delete` — but that is a DIFFERENT system from this one. `lifecycle.mjs`'s
   * wipe is a raw bulk delete over the SEED_OWNED/DERIVED tier lists; it does
   * not read `seedPurpose` at all, so the per-document tag gave no protection
   * here until this collection was also moved out of SEED_OWNED. The two
   * mechanisms must agree; leaving it in only one is how "this is permanent"
   * silently stops being true from the other angle.
   *
   * Still not read at request time — /tools/authenticity resolves from
   * bundled static data — so this is not about a case in flight breaking. It
   * is about the collection no longer being a place a tester run may ever
   * leave transiently empty.
   */
  "authenticityKnowledge",
  /*
   * Procurement — 🛑 MOVED FROM SEED_OWNED 2026-10-21, same shape as
   * `authenticityKnowledge` above and for a closely related reason.
   *
   * The SEED_OWNED comment that used to sit on these three is still CORRECT
   * about what it actually argued: their foreign keys are internal
   * (`shipmentId`, `lotId`), `createdBy` points at a PRESERVE-tier user, and
   * no row here references a seed-owned document — so a CASCADE keyed on an
   * internal FK would match nothing and leave every row standing. That
   * reasoning was about which of CASCADE/SEED_OWNED fits, and it answered
   * that question correctly.
   *
   * It just answered the wrong question. The one that matters is "may a run
   * ever delete this", and the answer changed when these collections stopped
   * being admin-authored fixtures and became the only record of what stock
   * actually COST — per lot, including customs and labour. That is money that
   * left the business, it is the basis of COGS and actual-vs-projected margin,
   * and it is what the double-entry books post against. It cannot be
   * regenerated from a seed file, because the seed file is a fixture and the
   * live rows are history.
   *
   * Also marked `seedPurpose: "permanent"` in appkit, which blocks `npx
   * appkit-seed delete` — but `lifecycle.mjs`'s wipe is a raw bulk delete over
   * THESE tier lists and never reads `seedPurpose`, so that tag alone gave no
   * protection from a tester run. Both systems or neither.
   */
  "procurementShipments",
  "shipmentLots",
  "shipmentItems",
  /*
   * Refund idempotency claims. PRESERVE because this collection is the only
   * record that a refund was ATTEMPTED — wiping it lets a replay of the same
   * request issue a second real gateway refund, which is the exact failure the
   * claim exists to prevent.
   *
   * 🛑 `assertDeletable` throws on an unlisted name mid-run, so naming it here
   * is also what stops a tester run aborting with what reads as a harness
   * fault. Same reasoning as `payoutMethods` and `adminAuditLog`.
   */
  "refundClaims",
  /*
   * ── invoice numbering ─────────────────────────────────────────────────────
   *
   * 🛑 THE STRONGEST CASE IN THIS FILE, and the one where a wipe is not
   * recoverable by any means.
   *
   * `invoiceCounters` holds the last-issued number per financial year, and
   * `invoiceAllocations` is the at-most-once claim that gives one subject one
   * number. Wipe the counter and the series RESTARTS AT 1 — so the next real
   * invoice re-issues a number that already exists on a document someone has
   * filed. A gapless, FY-keyed series is the entire point: you cannot patch
   * that afterwards, because both documents are legitimate and only one may
   * carry that number.
   *
   * Re-seeding cannot help either: the counter's correct value is a function
   * of what has already been ISSUED, which lives on the orders, not in a seed
   * file.
   *
   * These are also `seedPurpose: "permanent"` in appkit — and as the
   * `authenticityKnowledge` note above spells out, that tag blocks
   * `npx appkit-seed delete` and does NOTHING for `lifecycle.mjs`'s wipe,
   * which is a raw bulk delete over these tier lists and never reads
   * `seedPurpose`. Both systems or neither.
   */
  "invoiceCounters",
  "invoiceAllocations",
  /*
   * The staff-curated dispute reason list. PRESERVE because it ACCUMULATES
   * from real cases: support adds a row when a genuine gap shows up, and that
   * wording exists nowhere else. A wipe-and-reseed restores the eleven seeded
   * rows and silently loses every reason an agent has written since.
   *
   * The ORDER snapshots the reason's label, so a buyer's own record survives a
   * wipe either way — this protects the list's own history (who added which
   * wording, and when), which is what you need when a leading or badly-worded
   * option turns out to have shaped what buyers reported.
   *
   * Same both-systems rule: `seedPurpose: "permanent"` in appkit covers
   * `appkit-seed delete` only.
   */
  "disputeReasons",
  /*
   * ── the payment-observability trio ────────────────────────────────────────
   *
   * `gatewayEvents` is the durable inbox for every gateway webhook;
   * `gatewayOrderClaims` is the at-most-once gate that decides who places an
   * order; `paymentCases` (Phase 3) is the operator's queue, and a case there
   * carries a `dueAt` taken from the GATEWAY — a chargeback `respond_by` that
   * cannot be re-derived from anything we own.
   *
   * 🛑 All three are PRESERVE for the same reason the procurement triple above
   * is: a run cannot restore them. These rows are a record of what a
   * COUNTERPARTY told us, so there is no seed file to re-load and no way to ask
   * again — Razorpay will not redeliver a 40-day-old event because a test run
   * deleted our copy. Wiping `gatewayOrderClaims` is worse still: it is the
   * thing stopping two callers from placing the same order twice.
   *
   * 🛑 `gatewayOrderClaims` ALREADY EXISTS IN PRODUCTION and was in no tier
   * until now, which means `assertDeletable` would have thrown on it mid-run —
   * reading as a harness fault rather than as an unclassified collection. Found
   * by listing the tiers against the collections that exist, not by hitting it.
   *
   * `protectionClaims` (Phase 6) is in the same family: a buyer's claim against
   * a protection fee they paid, which is money and is evidence.
   */
  "gatewayEvents",
  "gatewayOrderClaims",
  "paymentCases",
  "protectionClaims",
  /*
   * ── obligations ───────────────────────────────────────────────────────────
   *
   * 🛑 CASCADE would be the intuitive tier and it is WRONG, so this is the one
   * entry here worth arguing: an obligation references an ORDER, and orders are
   * CASCADE — so a naive classification would delete the obligations of any
   * order a run removes.
   *
   * The reason it is PRESERVE instead is that deleting an obligation row cannot
   * lose data: it is a derived due-date INDEX, re-created from the order's own
   * facts on the next write. But deleting one DOES silently stop a deadline
   * from firing until that write happens — and for a live buyer's order that is
   * a payout released early or a return window that never closes. The asymmetry
   * is one-sided: a stale row is harmless (the sweep re-reads the subject and
   * closes it `superseded`), while a missing row is a deadline that quietly
   * never arrives.
   *
   * A tester fixture's rows carry `isTestData: true` and are swept by
   * `testDataCleanup` on their own TTL, which is the correct mechanism for them.
   */
  "obligations",
]);

/**
 * The catalog. Wiped and re-seeded every run.
 *
 * 🛑 Mirrors COLLECTION_MAP in appkit/scripts/seed-cli.mjs, which is the authoritative
 * registry of what the seeder writes. Four of these were missing until a live clear
 * left them standing: `carousels` (a DIFFERENT collection from `carouselSlides` —
 * named carousels vs individual slides), `productFeatures`, `scammerProfiles` and
 * `conversations`. Nothing failed; the rows simply survived, which is the quiet way
 * this list goes wrong.
 */
export const SEED_OWNED = Object.freeze([
  "categories",
  "stores",
  "products",
  "blogPosts",
  "events",
  "coupons",
  "reviews",
  "groupedListings",
  "carousels",
  "carouselSlides",
  "homepageSections",
  "faqs",
  "productFeatures",
  /*
   * SEED_OWNED, not CASCADE: a tax code references nothing seed-owned (it is
   * referenced BY categories), so a cascade rule would match no rows and
   * leave every one standing. Five rows, fully re-seeded.
   */
  "taxCodes",
  /*
   * E4/D12 — SEED_OWNED, like `taxCodes` and `productFeatures`: wiped and
   * re-seeded by a run, because they are generated reference data with no
   * reference INTO user rows. A product may point at a `partGlossary` id, but
   * the pointer is on the product, so a wipe-and-reseed restores the target
   * rather than orphaning anything.
   *
   * 🛑 Classified by what a row REFERENCES, never by what it is called — the
   * rule that put `supportTickets` in CASCADE and procurement in SEED_OWNED.
   */
  "partGlossary",
  /*
   * SEED_OWNED like `partGlossary`: generated reference data with no reference
   * INTO user rows. A product may point at a `beys` id, but the pointer is on
   * the product, so a wipe-and-reseed restores the target rather than orphaning
   * anything. 🛑 Classified by what a row REFERENCES, never by what it is
   * called — the rule that put `supportTickets` in CASCADE.
   */
  "beys",
  "beyProducts",
  "modelComposition",
  "scammerProfiles",
  "storeAddresses",
  "testerChecklistItems",
  /*
   * 🛑 `conversations` REMOVED 2026-10-12 — it was wiped and re-seeded by
   * nothing.
   *
   * The entry was correct when written: it swept `conv-*` fixtures the
   * messaging feature left behind on 2026-08-31. Measured now, those orphans
   * are gone — `conversations`, `chatRooms` and `chats` all hold **0
   * documents** — and `appkit-seed`'s COLLECTION_MAP has no `conversations`
   * key, so a run deleted a collection NOTHING recreates. That is the one
   * genuinely dangerous shape in this tier: SEED_OWNED means "wiped and
   * restored to a known state", and a wipe with no restore is just a delete.
   *
   * Removing it is also the SAFE direction rather than merely the tidy one:
   * an unlisted collection is PRESERVED by default and `assertDeletable`
   * throws on it, so nothing can touch `conversations` by accident now.
   *
   * 🛑 D9 (chat rebuild) must re-add it — together with a seed fixture, so the
   * wipe has something to restore. `audit-seed-purpose` R7 blocks re-adding it
   * without one.
   */
  /*
   * 🛑 Procurement (`procurementShipments`, `shipmentLots`, `shipmentItems`)
   * MOVED TO PRESERVE 2026-10-21 — see the reasoning there. Do not move them
   * back: the argument that put them here was about CASCADE-vs-SEED_OWNED
   * mechanics and is still sound on its own terms, which is exactly why it
   * reads as settled and is worth the note rather than a silent deletion.
   */
  /*
   * store-extensions config. SEED_OWNED for the same reason as procurement
   * above: every row is scoped by ownerId to a PRESERVE-tier user, so there is
   * nothing to cascade ON. itemRequests joins them -- its only references are
   * authorId/opUserId, both users.
   */
  // payoutMethods is deliberately NOT here — it is PRESERVE-tier (a seller's
  // payout destinations must survive a run). PRESERVE and seeded are compatible:
  // the seeder writes it, the tester never wipes it, exactly like users.
  "shippingConfigs",
  "analyticsCards",
  "analyticsAlerts",
  "storeCategories",
  "listingTemplates",
  "storeGoogleConfig",
  "itemRequests",
]);

/**
 * Recomputed by scheduled jobs or by ordinary use. Safe to delete, never seeded, so
 * a wipe is not followed by a re-seed for these — they simply rebuild.
 *
 * Kept separate from SEED_OWNED so nobody reads this list as "the seeder writes it".
 */
export const DERIVED = Object.freeze([
  "analytics",
  "jobs",
  "system",
  // Operational logs. serverErrors is the /admin/maintenance error list and
  // pageViews are the day-buckets that pageViewRollup folds up and pageViewPrune
  // trims — both rebuild from ordinary traffic.
  "serverErrors",
  "pageViews",
  // Tester verdicts. Keyed to testerChecklistItems, which is SEED_OWNED, so once
  // the catalogue is wiped these reference cases that no longer exist. Publish a
  // run's report BEFORE clearing — this is the collection that holds it.
  "testerChecklistResponses",
  // 🛑 Firestore records of uploaded media. Deleting these does NOT delete the
  // underlying Storage objects, so a clear leaves those files behind. Listed as
  // derived because the records are catalogue metadata rather than anyone's
  // account, but reclaiming the bytes is a separate job.
  //
  // 🛑 ONE SUBSET OF THIS COLLECTION DOES NOT MATCH "DERIVED"'S OWN DEFINITION,
  // and it is worth naming rather than letting the blanket comment above imply
  // it. "Recomputed... rebuilds from ordinary traffic" describes a page-view
  // bucket. It does NOT describe the rows `promoteStickerSheetToListings`
  // writes (`contextType: "sticker-part"`) — those are the ONLY thing that
  // turns a private sticker-part PNG into a public, watermarked `/media/{id}`
  // URL (see `mediaShortId` on `SheetPart`). A wipe here silently 404s the
  // IMAGE on every promoted sticker part's live marketplace listing — the
  // listing itself survives (it is `products`, SEED_OWNED), only its picture
  // breaks — and nothing rebuilds it: the fix is a human re-promoting the
  // sheet, which `ensurePartMediaSlug` already makes idempotent (it reuses the
  // existing slug when one is on record, so re-promoting is safe and cheap).
  // Accepted rather than reclassified, because the other ~99% of this
  // collection genuinely is disposable catalogue metadata and splitting one
  // collection's wipe behaviour by `contextType` is more harness than the risk
  // warrants. If this bites in practice, the fix is to skip `promote-to-listings`
  // in whatever pre-run step seeds/wipes the sticker fixtures, not to reclassify
  // the whole collection.
  "mediaAssets",
  /*
   * The site-wide search index's build manifest (2026-10-19) — a Firestore
   * singleton `searchIndex/manifest` plus a versioned artifact in Storage.
   * Fits this tier exactly: never seeded (no seed file writes it), and the
   * scheduled `searchIndexBuild` Function regenerates it within 15 minutes
   * of being marked dirty, or within 24h on its own reconciling full pass
   * regardless. A wipe here costs one extra full rebuild (3,730 reads,
   * measured) and nothing else — it would already have been UNCLASSIFIED
   * and therefore PRESERVED by this file's own default rule, so this entry
   * changes no live behaviour; it exists so the next person reading this
   * list does not have to re-derive that from first principles.
   *
   * 🛑 Storage objects (`search-index/v*.json`) are NOT reachable from this
   * harness at all — it wipes Firestore collections, not Storage — so an
   * orphaned artifact from a wipe is a non-event: the manifest doc that
   * would have pointed at it is itself gone, and the next build publishes a
   * fresh version and prunes old ones exactly as it always does.
   */
  "searchIndex",
]);

/**
 * Transactional rows. Deleted ONLY where they reference a seed-owned document.
 *
 * `field` is the foreign key. `arrayField` means the FK lives inside an array of
 * objects, so the whole document is deleted when any element points at a wiped
 * product. `pruneItems` means the document is per-user and must have entries
 * removed rather than being deleted — a wishlist is one doc holding a real
 * person's whole list, and deleting it to remove one stale entry destroys the lot.
 */
/**
 * CASCADE collections that ALSO have seed fixtures, and must be re-seeded after
 * the wipe.
 *
 * 🛑 WITHOUT THIS, A RUN DELETES ITS OWN FIXTURES AND THEN TESTS AGAINST NOTHING.
 *
 * `setup` re-seeds SEED_OWNED only. Everything here is deleted by the cascade
 * (correctly — these rows reference wiped products) and was never restored, so
 * every run began with an empty transactional world. Measured immediately after
 * a real setup:
 *
 *     orders        64 seeded →  0 in db
 *     bids          36 seeded →  0 in db
 *     payouts       10 seeded →  0 in db
 *     eventEntries   8 seeded →  0 in db
 *
 * The cost was not subtle. 309 of 1,025 pending cases were order- or
 * payment-dependent and could only record "blocked"; `/user/orders` answered
 * `{total:0}` for every orders, returns, tracking and payout case; and the bid
 * history case that expects 13 rows and pagination saw a single row, because a
 * single row was the truth. Roughly 30% of a 45-hour run was spent proving that
 * absent fixtures are absent.
 *
 * Ordering is load-bearing: these reference products, stores and users, so they
 * are seeded AFTER SEED_OWNED (products/stores) and users are PRESERVE, hence
 * always present.
 *
 * Not listed here on purpose: `wishlists`, `history`, `carts` and `couponUsage`
 * are per-user documents that the cascade PRUNES rather than deletes, so they
 * survive with their real rows intact and re-seeding them wholesale would write
 * over a real person's list.
 */
export const SEED_TRANSACTIONAL = Object.freeze([
  "orders",
  "bids",
  "payouts",
  "eventEntries",
  "notifications",
  /*
   * 🛑 `offers` WAS IN CASCADE AND NOT HERE — DELETED EVERY RUN, RESTORED NEVER.
   *
   * Worse, it could not have been restored: `appkit-seed` had no `offers` entry
   * in its COLLECTION_MAP at all, so the collection never appeared in
   * `appkit-seed status` and Firestore held ZERO offers in every run to date.
   * Measured 2026-09-11 mid-run: `offers 10 seed / 0 in db`.
   *
   * The gap was invisible because the PII half WAS wired — OFFER_PII_FIELDS was
   * imported and mapped in seed-cli — so every grep for "offers" in the seeding
   * code found a hit and the loader's omission looked like support. Same shape
   * as Root Cause #57: the feature exists end to end except for one adapter, and
   * the symptom is a polite "No offers received" rather than an error.
   *
   * Cost: 8 batches (7 `buying/offers*` plus `money-flows/offer-to-purchase`)
   * could only ever record `null` — the tester correctly reported "the fixture
   * did not seed any offers for this seller" rather than inventing a verdict.
   */
  "offers",
  "supportTickets",
  "catalogueItems",
  /*
   * 🛑 Also in DERIVED — and that is not a contradiction.
   *
   * DERIVED says "wipe it at setup", which is right: a previous run's verdicts
   * reference catalogue items that no longer exist, and leaking them into the
   * next run would publish stale answers as if they were fresh. This list says
   * "and then restore the seeded fixtures", which is a separate question.
   *
   * Without the restore, three admin/bug-hunter-rewards cases have nothing to
   * confirm or reopen — you cannot test "confirm this reported bug" against an
   * empty inbox. Measured 2026-09-11: that page returned 0 pass / 0 fail /
   * 5 blocked with both calibration controls answered correctly, so the batch
   * was trustworthy and the emptiness was real rather than a tester failure.
   *
   * Ordering is fine: responses reference testerChecklistItems, which is
   * SEED_OWNED and therefore already re-seeded by the time this list runs.
   */
  "testerChecklistResponses",
  // Both carry seed fixtures, so both must be restored after a cascade wipe.
  "moderationQueue",
  "reports",
]);

export const CASCADE = Object.freeze([
  { collection: "carts", arrayField: "items", refField: "productId", orphanSweep: true },
  // Orders carry BOTH shapes in this database. The current OrderDocument fans out
  // into items[], but 232 live rows are the flat legacy shape with a top-level
  // productId (see Root Cause #60 — createFromAuction wrote orders that were not
  // OrderDocuments). Matching only items[] left every one of them behind.
  { collection: "orders", arrayField: "items", refField: "productId", field: "productId", orphanSweep: true },
  { collection: "bids", field: "productId", orphanSweep: true },
  { collection: "offers", field: "productId", orphanSweep: true },
  /*
   * A real person's support ticket and a real person's catalogue item must
   * survive a run, so neither can be SEED_OWNED. Both instead cascade on their
   * reference INTO seed-owned products -- a seeded fixture pointing at a seeded
   * product is removed and restored, while a real row with no such reference is
   * never touched. Same shape as orders.
   */
  { collection: "supportTickets", field: "productId", orphanSweep: true },
  { collection: "catalogueItems", field: "linkedProductId", orphanSweep: true },
  { collection: "eventEntries", field: "eventId", refTarget: "events", orphanSweep: true },
  { collection: "couponUsage", field: "couponId", refTarget: "coupons", orphanSweep: true },
  // relatedId / relatedType, NOT entityId — the field this rule named for weeks
  // does not exist on the document, so the rule matched nothing.
  { collection: "notifications", field: "relatedId" },
  { collection: "payouts", field: "storeId", refTarget: "stores", orphanSweep: true },
  // moderationQueue cascades on storeId -- NOT on its entityId, which is
  // polymorphic (entityType: product|store|review|event). storeId points at one
  // collection, so the sweep can evaluate it safely.
  { collection: "moderationQueue", field: "storeId", refTarget: "stores", orphanSweep: true },
  /*
   * reports.entityId IS polymorphic and refTarget does NOT filter by type, so a
   * sweep would compare a store id against products and delete on whichever did
   * not resolve. Declared WITHOUT orphanSweep, exactly as notifications.relatedId
   * is above: the tier is known (R1 passes) and no row is deleted on a reference
   * the sweep cannot evaluate. A stale report is noise; a swept one is a real
   * person's complaint deleted without trace.
   */
  { collection: "reports", field: "entityId" },
  { collection: "wishlists", pruneItems: { arrayField: "items", refField: "productId" } },
  { collection: "history", pruneItems: { arrayField: "items", refField: "productId" } },
]);

const CASCADE_NAMES = CASCADE.map((c) => c.collection);
const DELETABLE = new Set([...SEED_OWNED, ...DERIVED, ...CASCADE_NAMES]);
const PRESERVED = new Set(PRESERVE);

/**
 * The single gate every destructive operation goes through.
 *
 * Deliberately throws rather than returning false: a caller that forgot to check
 * should crash loudly during a dry run, not quietly skip and leave the operator
 * believing the collection was handled.
 */
export function assertDeletable(collection) {
  if (PRESERVED.has(collection)) {
    throw new Error(
      `Refusing to delete from "${collection}" — it is in the PRESERVE tier. ` +
        `Real accounts, logins, addresses and live API keys live there and no run may touch them.`,
    );
  }
  if (!DELETABLE.has(collection)) {
    throw new Error(
      `Refusing to delete from "${collection}" — it is not classified in any tier. ` +
        `Add it to PRESERVE, SEED_OWNED or CASCADE in tester/scripts/lib/collections.mjs first. ` +
        `Unclassified means preserved: a run never sweeps something nobody has thought about.`,
    );
  }
  return collection;
}

/** True when a collection is safe to read but must never be written by a run. */
export function isPreserved(collection) {
  return PRESERVED.has(collection);
}

/** Every collection a run may touch, for the dry-run plan. */
export function allTiers() {
  return {
    preserve: [...PRESERVE],
    seedOwned: [...SEED_OWNED],
    derived: [...DERIVED],
    cascade: CASCADE.map((c) => c.collection),
  };
}
