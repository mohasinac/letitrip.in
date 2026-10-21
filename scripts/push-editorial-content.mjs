#!/usr/bin/env node
/**
 * Write the editorial + promotional content straight to live Firestore.
 *
 * Runs AFTER `push-editorial-images.mjs`, which puts the bytes in Storage and
 * the `mediaAssets` rows in Firestore that make `/media/<shortId>` resolve.
 * Nothing here uploads anything; it only references those slugs.
 *
 * Steps (each selectable with `--only <step>`, all run by default):
 *
 *   blogs     cover image on all 20 posts + real inline images
 *   coupon    CASHBACK10 — the 10% cashback code
 *   event     the "coming soon" cashback offer event (copyable code)
 *   products  2 Beyblade X event sticker sheets + the Elevate bit spare
 *   bundle    prize-bey trio repriced to exactly 10% off
 *   sections  homepage: hide what has no content, show what now does
 *
 * ── 🛑 WHY THIS WRITES LIVE AND DOES NOT RESEED ───────────────────────────
 *
 * Asked for directly. It matters because a reseed is not a superset of this:
 * `appkit-seed load` writes with `set(merge: true)`, so it can add and
 * overwrite a key but can NEVER REMOVE one, and `appkit-seed status` counts
 * documents by id so it reports a collection as perfectly in sync while its
 * CONTENT has drifted. The seed files are updated alongside this script so a
 * future reseed reproduces the same state — but the live write is what takes
 * effect now.
 *
 * ── 🛑 ADDITIVE AND IDEMPOTENT, NEVER A WIPE ──────────────────────────────
 *
 * Every write is `set(..., { merge: true })` or a field-level `update`, keyed
 * on a known document id. Nothing here deletes a collection, and nothing
 * iterates a collection deleting what it does not recognise. Re-running is a
 * no-op apart from `updatedAt`.
 *
 * Usage:
 *   node scripts/push-editorial-content.mjs --dry-run
 *   node scripts/push-editorial-content.mjs --yes-i-am <projectId>
 *   node scripts/push-editorial-content.mjs --yes-i-am <projectId> --only blogs
 *
 * Exit: 0 = success, 1 = a step failed, 2 = misconfiguration.
 *
 * @tag domain:blog,events,promotions,products,homepage
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:firestore-write
 */

import { initAdmin, ROOT } from "./lib/live-admin.mjs";
import { REUSED_MEDIA } from "./lib/editorial-image-manifest.mjs";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ONLY = (() => {
  const i = args.indexOf("--only");
  return i === -1 ? null : args[i + 1];
})();

const { db, projectId } = initAdmin({ requireConfirm: !DRY_RUN });
console.log(`project: ${projectId}${DRY_RUN ? "  [DRY RUN — no writes]" : ""}\n`);

/* Reuse the shipped tokenizer rather than re-deriving it — a hand-rolled
 * second implementation of search tokens is how a listing becomes unsearchable
 * while looking perfectly well-formed. */
const DIST = `file:///${ROOT.replace(/\\/g, "/")}/node_modules/@mohasinac/appkit/dist/`;
const { buildSearchTxt } = await import(new URL("utils/search-txt.js", DIST).href);

const NOW = new Date();
const daysAgo = (n) => new Date(NOW.getTime() - n * 86_400_000);
const daysAhead = (n) => new Date(NOW.getTime() + n * 86_400_000);

/** Slot key -> the URL to publish. Reused slugs win; everything else is ours. */
const mediaUrl = (key) => REUSED_MEDIA[key] ?? `/media/${key}`;

let writes = 0;
let failures = 0;
const run = (step) => !ONLY || ONLY === step;

async function commit(ref, data, label) {
  if (DRY_RUN) {
    console.log(`  [dry-run] ${label}`);
    return;
  }
  try {
    await ref.set(data, { merge: true });
    writes += 1;
    console.log(`  ✓ ${label}`);
  } catch (err) {
    failures += 1;
    console.error(`  ✗ ${label}: ${err.message}`);
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * 1. BLOGS — a cover on all 20, real photographs inline
 * ──────────────────────────────────────────────────────────────────────── */

/** blog id -> [slot key, alt text] */
const BLOG_COVERS = {
  "blog-spot-genuine-takara-tomy-beyblade": ["blog-cover-genuine-beyblade", "A Dragoon Storm Beyblade, the original-series top"],
  "blog-sealed-vs-opened-beyblade-value": ["blog-cover-sealed-vs-opened-beyblade", "A Dragoon V2 Beyblade"],
  "blog-complete-beyblade-x-series-guide": ["blog-cover-beyblade-x-guide", "The Beyblade X CobaltDrake 4-60F"],
  "blog-beginners-guide-hot-wheels-collecting": ["blog-cover-hot-wheels-collecting", "The Hot Wheels Bone Shaker casting"],
  "blog-gundam-model-kit-grades-explained": ["blog-cover-gundam-grades", "A Perfect Grade Gunpla model kit"],
  "blog-beyblade-x-vs-burst-comparison": ["blog-cover-beyblade-x-vs-burst", "The Burst-era Victory Valkyrie Boost Variable"],
  "blog-top-10-most-valuable-vintage-beyblades": ["blog-cover-top10-vintage-beyblade", "A Dragoon F Beyblade from the original series"],
  "blog-pokemon-sv-prismatic-evolutions": ["blog-cover-pokemon-prismatic", "Pokémon Trading Card Game artwork"],
  "blog-funko-pop-india-market-2026": ["blog-cover-funko-pop-india", "A wall of boxed Funko Pop vinyl figures"],
  "blog-tomica-vs-hot-wheels-india": ["blog-cover-tomica-vs-hot-wheels", "A Tomica Nissan Skyline GT-R (BNR34)"],
  "blog-metal-fight-hidden-gems": ["blog-cover-metal-fight-gems", "Storm Pegasus 105RF from the Metal Fight era"],
  "blog-protect-collectibles-indian-climate": ["blog-cover-protect-collectibles", "A Draciel S Beyblade"],
  "blog-selling-tips-letitrip": ["blog-cover-selling-tips", "The Hot Wheels Rodger Dodger casting"],
  "blog-one-piece-tcg-india-primer": ["blog-cover-one-piece-tcg", "One Piece Card Game artwork"],
  "blog-authenticating-beyblades": ["blog-cover-authenticating-beyblades", "A Beyblade X Xtreme Stadium"],
  "blog-collector-spotlight-mumbai-gundam": ["blog-cover-mumbai-gundam", "An RX-78-2 Gundam model kit"],
  "blog-india-collectibles-market-overview": ["blog-cover-india-market", "Pikachu, from the Pokémon franchise"],
  "blog-letitrip-escrow-launch": ["blog-cover-escrow-launch", "An RX-0 Unicorn Gundam model kit"],
  "blog-seller-verification-program": ["blog-cover-seller-verification", "A Dranzer S Beyblade"],
  "blog-auction-feature-launch": ["blog-cover-auction-launch", "The Volkswagen Beach Bomb, the rarest Hot Wheels casting"],
};

/**
 * blog id -> inline image slot keys, IN DOCUMENT ORDER.
 *
 * 🛑 Order is the whole contract. The replacement walks the post's
 * `/images/seed-tiles/*.svg` placeholders left to right and swaps the Nth for
 * the Nth key here, so a reordered array silently puts the weighing-scale
 * photo under the "laser-etched logo" heading — wrong, and invisible to every
 * check. The count is asserted before anything is written.
 */
const BLOG_INLINE = {
  "blog-spot-genuine-takara-tomy-beyblade": ["blog-content-genuine-beyblade-logo", "blog-content-genuine-beyblade-weight"],
  "blog-sealed-vs-opened-beyblade-value": ["blog-content-sealed-beyblade-box"],
  "blog-complete-beyblade-x-series-guide": ["blog-content-beyblade-x-waves"],
  "blog-top-10-most-valuable-vintage-beyblades": ["blog-content-top10-tournament-gold", "blog-content-top10-starter-set"],
  "blog-metal-fight-hidden-gems": ["blog-content-metal-fight-gems"],
};

/*
 * Matches an inline `<img>` whose src is EITHER an unreplaced seed-tile
 * placeholder OR a `/media/` URL this script wrote on an earlier run.
 *
 * 🛑 Both halves are required for idempotency. The first version matched only
 * `/images/seed-tiles/`, so once a run had swapped them the pattern found
 * nothing and every later run reported "0 placeholder(s) but N mapped —
 * inline images left alone". That is the count guard doing its job, but it
 * meant the inline images silently froze on whatever the FIRST run chose and
 * could never be corrected — which is exactly what happened when the Beyblade
 * slots moved from recycled catalogue shots to fetched item shots.
 *
 * It deliberately does NOT match an arbitrary external src: those would be
 * hand-authored content, and positional replacement must never overwrite
 * something a human put there.
 */
const SEED_TILE_IMG = /(<img\b[^>]*\bsrc=")(?:\/images\/seed-tiles\/[^"]*|\/media\/[^"]*)(")/g;

async function stepBlogs() {
  console.log("── blogs ──");
  for (const [id, [slot, alt]] of Object.entries(BLOG_COVERS)) {
    const ref = db.collection("blogPosts").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.warn(`  ! ${id} does not exist — skipped`);
      continue;
    }

    const patch = {
      coverImage: { type: "image", url: mediaUrl(slot), alt },
      updatedAt: NOW,
    };

    const inline = BLOG_INLINE[id];
    if (inline) {
      const content = String(snap.get("content") ?? "");
      const found = content.match(SEED_TILE_IMG) ?? [];
      if (found.length !== inline.length) {
        /*
         * Positional replacement is only safe when the counts agree. A
         * mismatch means the prose changed under the map, so the Nth
         * placeholder is no longer the Nth subject — swap anyway and the
         * article gets an illustration that contradicts its own heading.
         */
        console.warn(
          `  ! ${id}: ${found.length} placeholder(s) but ${inline.length} mapped — inline images left alone`,
        );
      } else if (found.length > 0) {
        let i = 0;
        patch.content = content.replace(SEED_TILE_IMG, (_m, pre, post) => `${pre}${mediaUrl(inline[i++])}${post}`);
      }
    }

    await commit(ref, patch, `${id}${patch.content ? ` (+${inline.length} inline)` : ""}`);
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * 2. COUPON — CASHBACK10
 * ──────────────────────────────────────────────────────────────────────── */

const CASHBACK_CODE = "CASHBACK10";
const CASHBACK_COUPON_ID = "coupon-cashback10";
/*
 * ── Diwali 2026 ───────────────────────────────────────────────────────────
 *
 * 🛑 REAL FESTIVAL DATES, LOOKED UP RATHER THAN GUESSED. Diwali is set by the
 * Hindu lunar calendar and moves between mid-October and mid-November each
 * year, so there is no arithmetic that derives it. Diwali 2026 is **Sunday 8
 * November**; the five days run Dhanteras (Fri 6 Nov) → Bhai Dooj (Tue 10
 * Nov).
 *
 * The sale opens on DHANTERAS, not on Diwali itself — Dhanteras is the day
 * the buying traditionally happens, so opening after it would miss the point
 * of the promotion entirely. It runs a week past Bhai Dooj for the tail.
 *
 * 🛑 Offsets are from the day this was written (2026-10-21): +16 = 6 Nov,
 * +26 = 16 Nov. They are offsets and not literal dates because the seed
 * computes everything from `NOW`, so a hard-coded 2026 date would be in the
 * past on every future reseed. Re-point them when the festival moves.
 *
 * ONE constant drives the coupon's `validity.startDate` AND the event's
 * `startsAt` — two hand-typed dates is how a code goes live a week early.
 */
const CASHBACK_STARTS = daysAhead(16);
const CASHBACK_ENDS = daysAhead(26);

/**
 * 🛑 DELETION, AND THE ONLY ONE IN THIS FILE.
 *
 * Asked for directly: keep `CASHBACK10`, remove the rest. Checked before
 * doing it rather than after — measured 2026-10-21, **0 of 3 orders**
 * reference any `couponCode` or carry `appliedDiscounts`, and both
 * `couponUsage` and `claimedCoupons` are empty. So nothing points at the
 * eleven being removed and this leaves no dangling references.
 *
 * It deletes BY EXPLICIT ID LIST read from the collection, never
 * "everything except" as a blind query — a query-based purge would also take
 * any coupon a parallel session or an admin created while this ran.
 */
async function stepCouponPurge() {
  console.log("── coupon purge ──");
  const all = await db.collection("coupons").get();
  const doomed = all.docs.filter((d) => d.id !== CASHBACK_COUPON_ID);
  if (doomed.length === 0) {
    console.log(`  = only ${CASHBACK_COUPON_ID} remains`);
    return;
  }

  // Re-check references at run time. The counts above were measured once; a
  // deletion is irreversible and the cheap guard is worth repeating.
  const orders = await db.collection("orders").get();
  const referenced = new Set();
  for (const o of orders.docs) {
    const code = o.get("couponCode");
    if (code) referenced.add(String(code));
    for (const d of o.get("appliedDiscounts") ?? []) {
      if (d?.code) referenced.add(String(d.code));
    }
  }
  const blocked = doomed.filter((d) => referenced.has(String(d.get("code"))));
  if (blocked.length) {
    console.error(`  ✗ refusing — these are referenced by an order: ${blocked.map((d) => d.get("code")).join(", ")}`);
    failures += 1;
    return;
  }

  for (const d of doomed) {
    if (DRY_RUN) {
      console.log(`  [dry-run] delete ${d.id} (${d.get("code")})`);
      continue;
    }
    await d.ref.delete();
    writes += 1;
    console.log(`  ✓ deleted ${d.id} (${d.get("code")})`);
  }
  console.log(`  → ${doomed.length} removed, ${CASHBACK_COUPON_ID} kept`);
}

async function stepCoupon() {
  console.log("── coupon ──");
  await commit(
    db.collection("coupons").doc(CASHBACK_COUPON_ID),
    {
      code: CASHBACK_CODE,
      name: "Diwali Cashback — 10% Back",
      description:
        "Get 10% of your order value back as cashback, up to ₹1,000, on orders above ₹999 during the Diwali sale. Applies across the whole catalogue.",
      type: "percentage",
      scope: "admin",
      discount: { value: 10, maxDiscount: 1000, minPurchase: 999 },
      usage: { totalLimit: 2000, perUserLimit: 1, currentUsage: 0 },
      validity: { startDate: CASHBACK_STARTS, endDate: CASHBACK_ENDS, isActive: true },
      restrictions: { firstTimeUserOnly: false },
      createdBy: "user-admin-letitrip",
      createdAt: NOW,
      updatedAt: NOW,
      stats: { totalUses: 0, totalRevenue: 0, totalDiscount: 0 },
      searchTxt: buildSearchTxt([CASHBACK_CODE, "Diwali Cashback 10% Back", "cashback diwali festive"]),
    },
    `${CASHBACK_COUPON_ID} (${CASHBACK_CODE})`,
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * 3. EVENT — the cashback offer, "coming soon"
 * ──────────────────────────────────────────────────────────────────────── */

async function stepEvent() {
  console.log("── event ──");
  const id = "event-festive-cashback-10";
  /*
   * `type: "offer"` + `offerConfig.displayCode` is what renders the
   * copy-to-clipboard card: `events/[id]/page.tsx` mounts `<EventOfferCard>`
   * on exactly that pair. A `sale` event would render a banner with no copy
   * button, which is not what "copyable code" asks for.
   *
   * `status: "active"` with a FUTURE `startsAt` is how this codebase spells
   * "upcoming" — `listPublicEvents` hard-filters `status==active` and sorts by
   * `startsAt`, so a `draft` would be invisible everywhere including the
   * homepage strip, and there is no "upcoming" member of the status union.
   */
  await commit(
    db.collection("events").doc(id),
    {
      // 🛑 SLUG UNCHANGED. `/events/festive-cashback-10` is a live URL and
      // `getPublicEventById` resolves through `findByIdOrSlug`; renaming it to
      // match the new Diwali branding would 404 every existing link for the
      // sake of a prettier address.
      slug: "festive-cashback-10",
      type: "offer",
      title: "Diwali Cashback: 10% Back on Every Order",
      description:
        `<p><strong>Our Diwali sale opens on Dhanteras — Friday 6 November — and runs through the festival.</strong></p>` +
        `<p>Spend ₹999 or more and get <strong>10% of your order value back</strong>, up to ₹1,000. It applies right across the catalogue — Beyblade X tops, spares, sticker sheets and bundles alike.</p>` +
        `<img src="${mediaUrl("event-content-cashback-10")}" alt="Fireworks over a city skyline at night" />` +
        `<h2>How it works</h2>` +
        `<ol><li>Copy the code <strong>${CASHBACK_CODE}</strong> below and save it.</li>` +
        `<li>Paste it at checkout from Dhanteras onwards.</li>` +
        `<li>Cashback is credited to your wallet within 24 hours of delivery.</li></ol>` +
        `<h2>Dates</h2>` +
        `<p>Dhanteras falls on Friday 6 November 2026 and Diwali itself on Sunday 8 November. The code stays live until 16 November, so there is a week after Bhai Dooj to use it.</p>` +
        `<p><em>The code is published now so you can save it ahead of time. It becomes spendable when the sale opens — one use per account, up to ₹1,000 back.</em></p>`,
      status: "active",
      startsAt: CASHBACK_STARTS,
      endsAt: CASHBACK_ENDS,
      coverImage: {
        type: "image",
        url: mediaUrl("event-cover-cashback-10"),
        alt: "Fireworks over a city skyline at night",
      },
      tags: ["offer", "cashback", "diwali", "festive", "coming-soon"],
      offerConfig: {
        couponId: CASHBACK_COUPON_ID,
        displayCode: CASHBACK_CODE,
        bannerText: "Diwali: 10% back on orders above ₹999, up to ₹1,000. One use per account.",
      },
      stats: { totalEntries: 0, approvedEntries: 0, flaggedEntries: 0 },
      createdBy: "user-admin-letitrip",
      createdAt: NOW,
      updatedAt: NOW,
      searchTxt: buildSearchTxt([
        "Diwali Cashback: 10% Back on Every Order",
        "diwali dhanteras cashback offer festive sale",
        CASHBACK_CODE,
        ["offer", "cashback", "diwali", "festive"],
      ]),
    },
    `${id} — Diwali (code ${CASHBACK_CODE}, opens ${CASHBACK_STARTS.toDateString()})`,
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * 4. PRODUCTS — event stickers + the Elevate bit spare
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Resolve `[leaf, ...ancestors]` and their display names from LIVE categories.
 *
 * 🛑 Resolved, never re-derived. `ProductRepository.deriveTaxonomy` builds
 * `categorySlugs = [leaf, ...parentIds.reverse()]`, and a product whose chain
 * is hand-typed one link short is unreachable from that category with no error
 * anywhere — Root Cause #101, and the reason `category-elevate`'s four
 * ancestors are read here rather than copied into this file.
 */
async function taxonomyFor(leafId) {
  const leaf = await db.collection("categories").doc(leafId).get();
  if (!leaf.exists) throw new Error(`category ${leafId} does not exist`);
  const parents = [...(leaf.get("parentIds") ?? [])].reverse();
  const slugs = [leafId, ...parents];
  const names = [];
  for (const id of slugs) {
    const d = id === leafId ? leaf : await db.collection("categories").doc(id).get();
    names.push(d.exists ? d.get("name") : id);
  }
  return { categorySlugs: slugs, categoryNames: names };
}

const STORE = { storeId: "store-letitrip-official", storeName: "LetItRip Official" };

/** Fields every live product in this catalogue carries. */
function productBase({ id, title, description, price, tags, mainImage, listingType, taxonomy, extra = {} }) {
  return {
    slug: id,
    title,
    description,
    ...taxonomy,
    brandSlug: "brand-takara-tomy",
    brand: "Takara-Tomy",
    franchiseSlug: "franchise-beyblade",
    franchise: "Beyblade",
    price,
    currency: "INR",
    stockQuantity: extra.stockQuantity ?? 60,
    availableQuantity: extra.availableQuantity ?? 60,
    isSold: false,
    mainImage,
    images: [{ url: mainImage }],
    status: "published",
    condition: "new",
    listingType,
    ...STORE,
    // GST + HSN are required by the invoice path; 95030020 is the toys/parts
    // heading the rest of this catalogue uses, at the same 5% rate.
    gstRate: 5,
    hsnCode: "95030020",
    authenticity: "unverified",
    allowOffers: false,
    featured: false,
    tags,
    avgRating: 0,
    reviewCount: 0,
    views7d: 0,
    views30d: 0,
    seedPurpose: "permanent",
    createdAt: NOW,
    updatedAt: NOW,
    searchTxt: buildSearchTxt([title, description, "Takara-Tomy", taxonomy.categoryNames, tags]),
    ...extra,
  };
}

async function stepProducts() {
  console.log("── products ──");

  const xTops = await taxonomyFor("category-x-basic");
  const bits = await taxonomyFor("category-elevate");

  const stickers = [
    {
      id: "sticker-beyblade-x-special-event-sheet",
      title: "Beyblade X Special Event Sticker Sheet",
      description:
        "A commemorative A5 sticker sheet produced for the Beyblade X special event — 18 die-cut vinyl stickers covering the X-series blades, ratchets and bits, plus the event wordmark. Weatherproof and UV-laminated.",
      price: 249,
      tags: ["stickers", "beyblade-x", "event-exclusive"],
      slot: "sticker-image-beyblade-x-event-sheet",
      printMeta: { size: "A5 (14.8 x 21 cm) sheet", material: "Vinyl", finish: "Matte UV-laminated" },
    },
    {
      id: "sticker-beyblade-x-special-event-holo",
      title: "Beyblade X Special Event Holographic Sticker Pack",
      description:
        "The holographic companion to the special-event sheet — 8 rainbow-shimmer stickers of the event's featured X blades, on a split-back liner so each peels cleanly.",
      price: 349,
      tags: ["stickers", "beyblade-x", "event-exclusive", "holographic"],
      slot: "sticker-image-beyblade-x-event-holo",
      printMeta: { size: "10 x 15 cm sheet", material: "Holographic vinyl", finish: "Holographic" },
    },
  ];

  for (const s of stickers) {
    await commit(
      db.collection("products").doc(s.id),
      productBase({
        id: s.id,
        title: s.title,
        description: s.description,
        price: s.price,
        tags: s.tags,
        mainImage: mediaUrl(s.slot),
        listingType: "stickers",
        taxonomy: xTops,
        extra: { printMeta: s.printMeta, stockQuantity: 120, availableQuantity: 120 },
      }),
      `${s.id} (stickers, ₹${s.price})`,
    );
  }

  const elevateId = "spare-bit-elevate-beyblade-x";
  await commit(
    db.collection("products").doc(elevateId),
    productBase({
      id: elevateId,
      title: "Elevate Bit (E) — Beyblade X spare",
      description:
        "A loose Elevate bit for Beyblade X. 3.2 g, Basic Line, first released 14 September 2024 as BX-36 (Takara-Tomy) / G1669 (Hasbro). Its raised dome lifts the blade off the floor on impact, trading some stamina for burst resistance and a distinctive high-angle recovery. Shipped with WhaleWave 5-80E and SharkEdge 4-70E among others.",
      price: 299,
      tags: ["spares", "beyblade-x", "bit", "basic-line"],
      mainImage: mediaUrl("spare-image-elevate-bit"),
      listingType: "spares",
      taxonomy: bits,
      extra: { stockQuantity: 40, availableQuantity: 40, condition: "new" },
    }),
    `${elevateId} (spares, ₹299)`,
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * 5. BUNDLE — the prize-bey trio at exactly 10% off
 * ──────────────────────────────────────────────────────────────────────── */

async function stepBundle() {
  console.log("── bundle ──");
  const id = "bundle-x-premium-tops";
  const ref = db.collection("categories").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    console.warn(`  ! ${id} does not exist — skipped`);
    return;
  }

  /*
   * 🛑 Priced FROM the members, not typed.
   *
   * `bundleOriginalTotal` drives the discount badge through
   * `computeBundleDiscount()`, so a total that disagrees with its members
   * shows the buyer a saving that is not real. Summing the live member prices
   * here means the badge can only ever read 10%.
   */
  const memberIds = snap.get("bundleProductIds") ?? [];
  let total = 0;
  const missing = [];
  for (const pid of memberIds) {
    const p = await db.collection("products").doc(pid).get();
    if (!p.exists) {
      missing.push(pid);
      continue;
    }
    total += Number(p.get("price") ?? 0);
  }
  if (missing.length) {
    console.error(`  ✗ ${id}: members not in catalogue: ${missing.join(", ")}`);
    failures += 1;
    return;
  }

  const price = Math.round(total * 0.9);
  await commit(
    ref,
    {
      name: "Prize Beys Trio — 10% Off",
      description:
        "The three prize Beyblade X tops together — CobaltDrake 4-60F, AeroPegasus 3-70A and ValkyrieVolt S4-70V — at 10% off buying them separately.",
      bundlePrice: price,
      bundleOriginalTotal: total,
      isFeatured: true,
      updatedAt: NOW,
    },
    `${id}: ₹${total} → ₹${price} (10% off, ${memberIds.length} members)`,
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * 6. HOMEPAGE SECTIONS — show what has content, hide what does not
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Sections whose visibility is decided by COUNTING their content, live.
 *
 * 🛑 Counted, not assumed. The census that prompted this found `reviews: 0`
 * and `events: 0` while both sections were `enabled: true` — so the homepage
 * had been rendering two headed, empty rails. Equally, `featured-bundles` was
 * off while four real bundles existed. Hard-coding either answer would be
 * wrong again the moment the catalogue moves, so each rule states a MINIMUM
 * and the count decides.
 */
const SECTION_RULES = [
  { id: "section-collector-reviews", collection: "reviews", min: 1, why: "review rail needs at least one review" },
  { id: "section-upcoming-events", collection: "events", min: 1, why: "events rail needs at least one active event" },
  { id: "section-featured-bundles", collection: "categories", where: ["categoryType", "==", "bundle"], min: 1, why: "bundle rail needs at least one bundle" },
  { id: "section-featured-stores", collection: "stores", min: 1, why: "store rail needs at least one store" },
];

async function stepSections() {
  console.log("── homepage sections ──");

  for (const rule of SECTION_RULES) {
    let q = db.collection(rule.collection);
    if (rule.where) q = q.where(...rule.where);
    const n = (await q.count().get()).data().count;
    const shouldEnable = n >= rule.min;

    const ref = db.collection("homepageSections").doc(rule.id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.warn(`  ! ${rule.id} does not exist — skipped`);
      continue;
    }
    const current = snap.get("enabled") === true;
    if (current === shouldEnable) {
      console.log(`  = ${rule.id} already ${current ? "on" : "off"} (${n} ${rule.collection})`);
      continue;
    }
    await commit(
      ref,
      { enabled: shouldEnable, updatedAt: NOW },
      `${rule.id} ${current ? "ON → off" : "off → ON"} (${n} ${rule.collection}) — ${rule.why}`,
    );
  }

  /*
   * 🛑 `featured-bundles` is a TWO-LOCK section and the second lock is a site
   * setting, not a document flag.
   *
   * `MarketplaceHomepageView` filters sections through
   * `HOMEPAGE_SECTION_CATEGORY_TYPE` -> `isCategoryTypeEnabled`, so with
   * `listings.categoryTypes.bundle: false` the rail stays hidden no matter
   * what `enabled` says — and the admin homepage builder would show it as on.
   * Both switches have to agree or the two surfaces contradict each other,
   * which is the exact reason the codebase documents the pair.
   */
  const settingsRef = db.collection("siteSettings").doc("global");
  const settings = await settingsRef.get();
  const bundleOn = settings.get("listings")?.categoryTypes?.bundle === true;
  const bundleCount = (await db.collection("categories").where("categoryType", "==", "bundle").count().get()).data().count;

  if (bundleCount > 0 && !bundleOn) {
    await commit(
      settingsRef,
      { listings: { categoryTypes: { bundle: true } }, updatedAt: NOW },
      `siteSettings.listings.categoryTypes.bundle false → true (${bundleCount} bundles) — second lock on the bundle rail`,
    );
  } else {
    console.log(`  = siteSettings bundle toggle already ${bundleOn ? "on" : "off"} (${bundleCount} bundles)`);
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * 7. CAROUSEL — CC0 backgrounds and copy that matches what the site sells
 * ──────────────────────────────────────────────────────────────────────── */

const dim = (opacity) => ({ enabled: true, opacity });
const heroBg = (key, opacity = 0.55) => ({ type: "image", url: mediaUrl(key), dimOverlay: dim(opacity) });

/**
 * The five active slides, in order, plus the three that are deliberately off.
 *
 * ── 🛑 THE TWO RULES FROM THE SEED HEADER, BOTH LOAD-BEARING ─────────────
 *
 * 1. An active slide MUST carry `overlay` OR `cards`, or it renders as a bare
 *    background with no headline and no CTA. `HeroCarousel` gates slide copy
 *    on `slide.overlay` and the card grid on `slide.cards.length`.
 * 2. NEVER both. The two containers are sibling `POSITION_FILL` elements, so
 *    they stack on the same pixels and the text overlaps.
 *
 * So `slide-hero-homepage` is the cards slide with NO overlay, and every
 * other active slide is overlay-only with `cards: []`.
 *
 * ── 🛑 `MAX_ACTIVE_SLIDES` IS 5 ──────────────────────────────────────────
 *
 * `features/homepage/api/carousel/route.ts` slices to five, so a sixth active
 * slide is not an error — it is silently never shown. Two slides are switched
 * OFF here to make room for two that describe things the site actually has
 * now, which keeps the count at exactly five.
 */
const CAROUSEL_SLIDES = [
  {
    id: "slide-hero-homepage",
    order: 1,
    active: true,
    title: "Three ways to shop",
    background: heroBg("carousel-bg-hero", 0.6),
    // Cards slide: no overlay, by rule 2 above.
    cards: [
      {
        id: "card-hero-shop-now",
        zone: 1,
        mobileZone: 2,
        background: { type: "image", url: mediaUrl("carousel-card-shop"), dimOverlay: dim(0.5) },
        content: {
          eyebrow: "Buy now",
          title: "Ready to ship",
          description: "In-stock Beyblade X tops, spares and stickers, dispatched from India.",
        },
        buttons: [{ id: "card-hero-shop-now-cta", text: "Shop products", href: "/products", variant: "primary" }],
        hover: { effect: "scale" },
      },
      {
        /*
         * 🛑 This card REPLACED a "Live auctions" card pointing at
         * `/auctions` — a dead CTA on the busiest element of the site, since
         * auctions are off at `listings.listingTypes.auction: false`. Live
         * Firestore still held that card; the SEED had already fixed it.
         *
         * 🛑 `/categories`, NOT `/bundles`, and the seed's own note is why:
         * `/spares` and `/art` were rejected as swaps because both are
         * enabled with ZERO published products, and "replacing a dead-end
         * card with a different dead-end card is not a fix". Bundles are
         * populated and would qualify — but they now have their own slide at
         * order 3, so putting them here too spends the hero's third slot on a
         * destination the carousel already sells one screen later.
         * `/categories` is the genuinely different third way to shop.
         */
        id: "card-hero-browse",
        zone: 2,
        mobileZone: 2,
        background: { type: "image", url: mediaUrl("carousel-card-bundles"), dimOverlay: dim(0.5) },
        content: {
          eyebrow: "Explore",
          title: "Shop by category",
          description: "Walk the tree from generation down to a single part.",
        },
        buttons: [{ id: "card-hero-browse-cta", text: "Browse categories", href: "/categories", variant: "primary" }],
        hover: { effect: "scale" },
      },
      {
        id: "card-hero-reserve",
        zone: 3,
        mobileZone: 2,
        background: { type: "image", url: mediaUrl("carousel-card-preorders"), dimOverlay: dim(0.5) },
        content: {
          eyebrow: "Reserve",
          title: "Pre-orders",
          description: "Lock in an upcoming release with a deposit.",
        },
        buttons: [{ id: "card-hero-reserve-cta", text: "See pre-orders", href: "/pre-orders", variant: "primary" }],
        hover: { effect: "scale" },
      },
    ],
  },
  {
    id: "slide-festive-cashback",
    order: 2,
    active: true,
    title: "Diwali cashback (promo)",
    /*
     * 🛑 Uses the EVENT's fireworks cover, not the abstract
     * `carousel-bg-cashback`, so the slide and the page it links to look like
     * the same promotion. It is CC0 and already uploaded, so this costs
     * nothing extra — and it frees `carousel-bg-cashback` rather than
     * orphaning it, since that slug stays in the manifest for the next promo.
     */
    background: heroBg("event-cover-cashback-10", 0.55),
    cards: [],
    overlay: {
      enabled: true,
      subtitle: "Opens Dhanteras, 6 November",
      title: "Diwali: 10% cashback on every order",
      description:
        "Spend ₹999 or more and get 10% back, up to ₹1,000. Copy the code now — it goes live when the sale opens.",
      button: {
        id: "slide-cashback-cta",
        text: "See the offer",
        link: "/events/festive-cashback-10",
        variant: "primary",
        openInNewTab: false,
      },
    },
  },
  {
    id: "slide-bundles-save",
    order: 3,
    active: true,
    title: "Bundles",
    background: heroBg("carousel-bg-bundles", 0.55),
    cards: [],
    overlay: {
      enabled: true,
      subtitle: "Buy the set, pay less",
      title: "Prize Beys Trio — 10% off",
      description:
        "CobaltDrake 4-60F, AeroPegasus 3-70A and ValkyrieVolt S4-70V in one order, ₹43,200 instead of ₹48,000.",
      button: {
        id: "slide-bundles-cta",
        text: "Browse bundles",
        link: "/bundles",
        variant: "primary",
        openInNewTab: false,
      },
    },
  },
  {
    id: "slide-preorders-open",
    order: 4,
    active: true,
    title: "Pre-orders open",
    background: heroBg("carousel-bg-preorders", 0.5),
    cards: [],
    /*
     * 🛑 Copy taken VERBATIM from `carousel-slides-seed-data.ts`, not rewritten.
     *
     * A first pass here said "Cancel any time before dispatch unless the
     * listing says otherwise" — a cancellation promise nothing in the schema
     * guarantees. The seeded line is deliberately narrower and is the one
     * that survives a reader checking it.
     */
    overlay: {
      enabled: true,
      subtitle: "Reserve before release",
      title: "Don't miss the drop",
      description: "Secure upcoming releases with a deposit and pay the balance when they ship.",
      button: {
        id: "slide-preorders-cta",
        text: "See open pre-orders",
        link: "/pre-orders",
        variant: "primary",
        openInNewTab: false,
      },
    },
  },
  {
    id: "slide-authenticated-originals",
    order: 5,
    active: true,
    title: "Authenticity, stated",
    background: heroBg("carousel-bg-authenticity", 0.55),
    cards: [],
    /*
     * 🛑 Copy taken VERBATIM from the seed, and this one matters most.
     *
     * The seeded wording carries a documented correction: an earlier version
     * promised "the seller has to pick one before it can go live", which was
     * FALSE — `authenticity` is `.optional()` in the write schema. The
     * current line says only what is true (every listing carries a label; an
     * unset one reads "unverified", never "original"). Replacing considered
     * copy about THIS subject with a looser paraphrase is how an overclaim
     * gets reintroduced on the one topic where credibility rests.
     */
    overlay: {
      enabled: true,
      subtitle: "Authenticity, stated",
      title: "“Aftermarket” is not a brand. Every listing says which.",
      description:
        "Every listing carries one of three labels — original, reproduction or unverified. A seller can say which; if they do not, it reads “unverified”, because we will not claim “original” on your behalf. Reproductions are welcome here when they are labelled; a listing that leaves you guessing is not.",
      button: {
        id: "slide-authenticity-cta",
        text: "How we check",
        link: "/faqs/product_information",
        variant: "primary",
        openInNewTab: false,
      },
    },
  },

  /*
   * ── Switched OFF, each for a stated reason ─────────────────────────────
   *
   * Their `order` slots are kept so re-enabling puts them back in place.
   */
  {
    // Auctions are off at `listings.listingTypes.auction: false`, so this
    // slide's only CTA leads into a disabled vertical. It also pointed its
    // background at `/demo-media/sample-video.mp4`.
    id: "slide-beyblade-auction",
    order: 6,
    active: false,
  },
  {
    // "Complete your collection → Start browsing" is the hero's first card in
    // different words, and the hero says it above the fold with a picture.
    id: "slide-beyblade-collection-hunt",
    order: 7,
    active: false,
  },
  {
    /*
     * Untouched in content — it is the fixture `getActiveSlides()`'s own
     * filter is tested against ("a draft slide kept unpublished so admins
     * have a starting point to copy"), and the seed header says explicitly
     * not to activate it to backfill the five.
     *
     * Only its `order` moves: it sat on 6, which `slide-beyblade-auction`
     * now also holds. Two slides on one order is the collision the seed
     * header calls out — `MarketplaceHomepageView` tie-breaks on `updatedAt`
     * then `id.localeCompare`, so the running order becomes alphabetical by
     * accident rather than a layout decision.
     */
    id: "slide-upcoming-promo",
    order: 8,
    active: false,
  },
];

async function stepCarousel() {
  console.log("── carousel ──");

  const activeCount = CAROUSEL_SLIDES.filter((s) => s.active).length;
  if (activeCount > 5) {
    console.error(`  ✗ ${activeCount} active slides but MAX_ACTIVE_SLIDES is 5 — the extra would never render.`);
    failures += 1;
    return;
  }

  for (const slide of CAROUSEL_SLIDES) {
    const ref = db.collection("carouselSlides").doc(slide.id);
    const snap = await ref.get();
    if (!snap.exists) {
      // A brand-new slide needs the fields every existing one carries.
      if (!slide.background) {
        console.warn(`  ! ${slide.id} is new but has no background — skipped`);
        continue;
      }
    }

    const { id, ...rest } = slide;
    const patch = { ...rest, updatedAt: NOW };
    if (!snap.exists) {
      patch.createdAt = NOW;
      patch.createdBy = "user-admin-letitrip";
      patch.settings = { autoplayDelayMs: 6000, height: "medium" };
      patch.carouselId = null;
    }

    /*
     * 🛑 Clear the opposite container explicitly.
     *
     * An overlay slide must send `cards: []` and a cards slide must clear
     * `overlay` — because this writes with `merge: true`, so a field left
     * unmentioned SURVIVES. `slide-hero-homepage` already holds cards; if a
     * future edit gave it an overlay without clearing them, the two sibling
     * fill containers would stack and the text would overlap, which is the
     * failure the seed header calls out.
     */
    if (slide.active && patch.overlay) patch.cards = [];
    if (slide.active && patch.cards?.length) patch.overlay = null;

    const kind = !slide.background ? "deactivated" : patch.overlay ? "overlay" : `${patch.cards?.length ?? 0} cards`;
    await commit(ref, patch, `${slide.id} ${slide.active ? "ON " : "off"} (${kind})`);
  }

  const total = (await db.collection("carouselSlides").where("active", "==", true).count().get()).data().count;
  console.log(`  → ${total} active slide(s) after this pass (cap 5)`);
}

/* ────────────────────────────────────────────────────────────────────────
 * 8. BUNDLE COVERS — one composited image of the bundle's own contents
 * ──────────────────────────────────────────────────────────────────────── */

async function stepBundleCovers() {
  console.log("── bundle covers ──");
  const bundles = await db.collection("categories").where("categoryType", "==", "bundle").get();
  for (const doc of bundles.docs) {
    const shortId = `bundle-cover-${doc.id}`;
    const row = await db.collection("mediaAssets").doc(shortId).get();
    if (!row.exists) {
      console.warn(`  ! ${doc.id}: no ${shortId} mediaAsset — run make-bundle-mosaics.mjs then push-editorial-images.mjs`);
      continue;
    }
    /*
     * 🛑 `display` is written whole, not patched field-by-field.
     *
     * `CategoryDocumentDisplay` requires `showInFooter`, so spreading onto
     * `{}` would drop a required field — the same trap `withBundleMosaic`
     * documents. The existing display is read and spread.
     *
     * `mosaicImages` is deliberately LEFT IN PLACE. The composited cover is
     * now what every card renders, but the member list is still true and
     * costs nothing; removing it would break any surface that prefers the
     * collage without giving it a replacement.
     */
    const display = { ...(doc.get("display") ?? {}), coverImage: `/media/${shortId}` };
    await commit(
      db.collection("categories").doc(doc.id),
      { display, updatedAt: NOW },
      `${doc.id} cover → /media/${shortId}`,
    );
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * 9. STORE — the platform store's own logo and banner
 * ──────────────────────────────────────────────────────────────────────── */

async function stepStore() {
  console.log("── store ──");
  const id = "store-letitrip-official";
  const ref = db.collection("stores").doc(id);
  if (!(await ref.get()).exists) {
    console.warn(`  ! ${id} does not exist — skipped`);
    return;
  }
  for (const [field, shortId] of [
    ["storeLogoURL", "store-logo-letitrip-official"],
    ["storeBannerURL", "store-banner-letitrip-official"],
  ]) {
    const row = await db.collection("mediaAssets").doc(shortId).get();
    if (!row.exists) {
      console.warn(`  ! no ${shortId} mediaAsset — skipped ${field}`);
      continue;
    }
    await commit(ref, { [field]: `/media/${shortId}`, updatedAt: NOW }, `${field} → /media/${shortId}`);
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * 10. HOMEPAGE LAYOUT — order, a shop-extras rail, and the WhatsApp link
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * `systems-matrix` moves to sit directly under pre-orders, as asked.
 *
 * 🛑 `order` must stay UNIQUE AND CONTIGUOUS, so this is a RE-NUMBER, not a
 * single write: moving 8 → 5 pushes carousel/trust/categories down one each.
 * Writing only the moved row would put two sections on 5, and
 * `MarketplaceHomepageView` tie-breaks on `updatedAt` then `id.localeCompare`
 * — so the running order would become alphabetical by accident, which is the
 * exact defect the seed header records happening before.
 */
const SECTION_ORDER = {
  "section-systems-matrix": 5,
  "section-hero-carousel": 6,
  "section-trust-indicators": 7,
  "section-collectibles-categories": 8,
};

/**
 * A `custom-cards` rail for stickers and bundles.
 *
 * 🛑 THIS IS NOT A "STICKERS SECTION TYPE", and the difference is worth
 * stating. `SectionType` has no `stickers` member, and `ProductsSectionConfig`
 * marks `filterByCategory` / `filterByBrand` **NO-RENDERER** ("SSR uses one
 * shared fetch", Rule #6) — so a products rail genuinely cannot be scoped to
 * one listing type today. A real stickers rail needs a union member, a config
 * interface, a renderer and an SSR fetch in appkit, which is code, not data,
 * and would not reach the site until appkit is published and the pin bumped.
 *
 * `custom-cards` is the honest thing that works now: real tiles, real images,
 * real links, no fiction about what the section is.
 *
 * 🛑 Stickers browse at `/art`, not `/stickers` — there is no public
 * `/stickers` route. `ROUTES.PUBLIC.ART` is the art-and-stickers page, and
 * `ROUTES.ADMIN.STICKERS` / `ROUTES.STORE.STICKERS` are dashboard-only.
 */
const SHOP_EXTRAS_SECTION = {
  id: "section-shop-extras",
  type: "custom-cards",
  order: 10,
  enabled: true,
  config: {
    title: "Stickers, spares and bundles",
    subtitle: "Three more ways to buy — sheets to decorate with, single parts off a build, and sets that cost less together.",
    layout: "grid",
    /*
     * 🛑 THE COPY IS SIZED TO THE REAL CATALOGUE, measured 2026-10-21:
     * stickers 2 published, spares 1, art 0, bundles 4. So none of these
     * cards says "hundreds of" or "every part" — a tile that promises a
     * catalogue the page cannot show is the dead-end-CTA defect one level up,
     * and it is why the hero's auctions card had to go.
     *
     * The seed holds 6 more spares and 6 more stickers, but all of them sit
     * on `store-beyblade-arena`, which does NOT exist in live Firestore —
     * pushing them would create products pointing at a missing store (Root
     * Cause #26). Widening these rails means seeding that store first, not
     * loosening the copy.
     */
    cards: [
      {
        id: "extras-stickers",
        image: "/media/sticker-image-beyblade-x-event-sheet",
        imageAlt: "A Beyblade X special event sticker sheet",
        eyebrow: "Printed",
        title: "Sticker sheets",
        body: "Die-cut vinyl and holographic sheets of the X-series blades, from the special-event run. Weatherproof and UV-laminated.",
        buttons: [{ label: "Shop stickers", href: "/art", variant: "primary" }],
      },
      {
        id: "extras-spares",
        image: "/media/spare-image-elevate-bit",
        imageAlt: "A Beyblade X Elevate bit",
        eyebrow: "Single parts",
        title: "Spares",
        body: "One component off a build, priced on condition — bits, ratchets and blades, so a broken combo costs a part and not a whole top.",
        buttons: [{ label: "Browse spares", href: "/spares", variant: "primary" }],
      },
      {
        id: "extras-bundles",
        image: "/media/bundle-cover-bundle-x-premium-tops",
        imageAlt: "The three prize Beyblade X tops",
        eyebrow: "Save",
        title: "Bundles",
        body: "Buy the set in one order and pay less than the parts. The Prize Beys Trio is ₹43,200 instead of ₹48,000.",
        buttons: [{ label: "Browse bundles", href: "/bundles", variant: "primary" }],
      },
    ],
  },
};

async function stepLayout() {
  console.log("── homepage layout ──");

  // 1. Re-number so systems-matrix sits under pre-orders.
  for (const [id, order] of Object.entries(SECTION_ORDER)) {
    const ref = db.collection("homepageSections").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.warn(`  ! ${id} does not exist — skipped`);
      continue;
    }
    if (snap.get("order") === order) {
      console.log(`  = ${id} already order ${order}`);
      continue;
    }
    await commit(ref, { order, updatedAt: NOW }, `${id} order ${snap.get("order")} → ${order}`);
  }

  /*
   * 2. The stickers / spares / bundles rail — INSERTED, which means every
   *    section below it shifts down one.
   *
   * 🛑 Writing it at its target order alone is not enough, and the first
   * attempt proved it: `section-shop-extras` landed on 10 beside
   * `section-featured-stores`, which was already there. Two sections on one
   * order makes the running order alphabetical by accident
   * (`MarketplaceHomepageView` tie-breaks `updatedAt` then `id.localeCompare`)
   * — the same defect this file's SECTION_ORDER note warns about, reproduced
   * by the very change that cites it.
   *
   * So the insert RENUMBERS: everything at or after the target slot moves up
   * one, in descending order so no intermediate write collides either.
   */
  const extrasRef = db.collection("homepageSections").doc(SHOP_EXTRAS_SECTION.id);
  const extrasSnap = await extrasRef.get();
  const { id: _id, ...extras } = SHOP_EXTRAS_SECTION;
  const target = extras.order;

  /*
   * 🛑 The guard asks "is the target slot OCCUPIED", not "is shop-extras
   * already there".
   *
   * The first version asked the latter — `!exists || order !== target` — and
   * it skipped the shift on the re-run precisely because shop-extras had
   * already been written at 10. It was at 10, so it "looked" placed, while
   * `section-featured-stores` was ALSO at 10. The collision the renumber
   * exists to prevent was created and then preserved by the check meant to
   * prevent it.
   *
   * Asking about the occupant is also idempotent in the right way: once the
   * shift has happened nothing else holds the slot, so a re-run is a no-op.
   */
  const occupants = (await db.collection("homepageSections").get()).docs
    .filter((d) => d.id !== SHOP_EXTRAS_SECTION.id)
    .filter((d) => (d.get("order") ?? 0) === target);

  if (occupants.length > 0) {
    const toShift = (await db.collection("homepageSections").get()).docs
      .filter((d) => d.id !== SHOP_EXTRAS_SECTION.id)
      .filter((d) => (d.get("order") ?? 0) >= target)
      // Descending, so an intermediate write never lands on a slot that is
      // still occupied by the row below it.
      .sort((a, b) => (b.get("order") ?? 0) - (a.get("order") ?? 0));
    for (const d of toShift) {
      await commit(
        db.collection("homepageSections").doc(d.id),
        { order: (d.get("order") ?? 0) + 1, updatedAt: NOW },
        `${d.id} order ${d.get("order")} → ${(d.get("order") ?? 0) + 1} (shifted)`,
      );
    }
  }

  await commit(
    extrasRef,
    extrasSnap.exists ? { ...extras, updatedAt: NOW } : { ...extras, createdAt: NOW, updatedAt: NOW },
    `${SHOP_EXTRAS_SECTION.id} (${extras.config.cards.length} cards, order ${target})`,
  );

  /*
   * 3. The WhatsApp group link.
   *
   * 🛑 The live config had NO `groupLink` at all, while
   * `WhatsAppCommunitySectionConfig` declares it required — and the component
   * renders its join button only `{groupLink && …}`. So the section showed a
   * "Join the community" card with the button silently missing.
   *
   * The seed sets it `undefined` on purpose, with a note that the real link
   * is env-owned (`WHATSAPP_GROUP_INVITE`) and reaches the card through
   * appkit.config. That indirection is not reaching production, so the
   * resolved value is written onto the document here — read from the env, not
   * typed into this file, so the invite lives in exactly one place.
   */
  const invite = (process.env.WHATSAPP_GROUP_INVITE ?? "").trim();
  const waRef = db.collection("homepageSections").doc("section-whatsapp-community");
  const waSnap = await waRef.get();
  if (!invite) {
    console.warn("  ! WHATSAPP_GROUP_INVITE is not set — group link left alone");
  } else if (!/^https:\/\/chat\.whatsapp\.com\//.test(invite)) {
    // A number link (`wa.me/…`) opens a DM, not the group. Writing one here
    // would look fixed and behave wrongly.
    console.warn(`  ! WHATSAPP_GROUP_INVITE is not a chat.whatsapp.com invite — left alone`);
  } else if (waSnap.exists) {
    const cfg = { ...(waSnap.get("config") ?? {}) };
    cfg.groupLink = invite;
    /*
     * Two of the four benefit bullets promised auction reminders, and
     * auctions are switched off at `listings.listingTypes.auction: false`.
     * A benefit list is a promise; this one could not be kept.
     */
    cfg.benefits = [
      "Deal alerts before they hit the homepage",
      "Early access to limited drops and event codes",
      "Restock pings for sold-out tops, parts and stickers",
      "Direct line to the team for order questions",
    ];
    cfg.description = "Deal alerts, restock pings, and early access to drops.";
    await commit(waRef, { config: cfg, updatedAt: NOW }, `whatsapp groupLink set (${invite.slice(0, 34)}…)`);
  }
}

/* ──────────────────────────────────────────────────────────────────────── */

const STEPS = [
  ["blogs", stepBlogs],
  ["coupon", stepCoupon],
  ["coupon-purge", stepCouponPurge],
  ["event", stepEvent],
  ["products", stepProducts],
  ["bundle", stepBundle],
  ["bundle-covers", stepBundleCovers],
  ["store", stepStore],
  ["carousel", stepCarousel],
  ["layout", stepLayout],
  ["sections", stepSections],
];

if (ONLY && !STEPS.some(([n]) => n === ONLY)) {
  console.error(`✗ unknown --only ${ONLY}. Steps: ${STEPS.map(([n]) => n).join(", ")}`);
  process.exit(2);
}

for (const [name, fn] of STEPS) {
  if (!run(name)) continue;
  try {
    await fn();
  } catch (err) {
    failures += 1;
    console.error(`✗ step ${name} failed: ${err.message}`);
  }
  console.log("");
}

console.log(`${DRY_RUN ? "[dry-run] " : ""}writes ${writes} · failures ${failures}`);
if (failures) process.exit(1);
