/**
 * The editorial image manifest — which image SLOTS need a photograph, and
 * where each one's photograph comes from.
 *
 * ── Why Wikimedia Commons and not Google Images ───────────────────────────
 *
 * The ask was "images from Google". Google Images is a *search over other
 * people's pages*: no public API without a paid CSE key, scraping the results
 * page is against its ToS, and — decisively — a result carries **no licence**.
 * This site sells things, so an unlicensed publisher product shot on an
 * editorial page is a real liability, the same question
 * `fetch-taxonomy-images.mjs` already flags for fandom imagery.
 *
 * Commons is the shippable version of that idea: a real search over real
 * photographs, every one carrying a machine-readable licence and author, which
 * `LICENCE_RANK` sorts so public-domain wins and anything non-free is refused.
 *
 * ── 🛑 REUSE BEFORE FETCH ─────────────────────────────────────────────────
 *
 * Commons has almost no Beyblade photography. Asked for some, it returns the
 * SAME U.S. Air Force crowd shot ("Beyblade tournament.JPG") for every query —
 * six slots deep before anyone notices, because each one reports a tidy ✓.
 *
 * Meanwhile this project already owns 559 real Beyblade images in its own
 * bucket from the taxonomy/parts pipelines, including per-generation covers
 * and an actual product BOX shot. So every Beyblade-topic slot is served from
 * `REUSED_MEDIA` below — no fetch, no licence question, better pictures — and
 * Commons is reserved for the subjects we genuinely do not have: Gunpla,
 * Pokémon, Funko, Tomica, and the abstract marketplace topics.
 *
 * ── Candidate queries, not one query ──────────────────────────────────────
 *
 * Each fetched slot lists several queries tried in order. A slot that resolves
 * nothing is left WITHOUT an image rather than given a wrong one — an
 * illustration that contradicts the article is worse than none.
 *
 * `phrase` is the guard for multi-word brands. "Hot Wheels" tokenises to
 * `hot` + `wheels`, which matched *"Hay rakes, farm wheels, hot-water tanks"*
 * — both tokens present, subject completely wrong. A `phrase` must survive in
 * the title with separators stripped, so `hotwheels` matches
 * "HOTWHEELS_CHEVROLET_COPO_CAMARO" and not the farm photo.
 *
 * @tag domain:blog,events
 * @tag layer:script
 * @tag access:node-only
 */

/** Licence preference, best first. Anything not listed is REFUSED. */
export const LICENCE_RANK = [
  "cc0",
  "public domain",
  "pd",
  "cc by 4.0",
  "cc by 3.0",
  "cc by 2.0",
  "cc by-sa 4.0",
  "cc by-sa 3.0",
  "cc by-sa 2.0",
];

export const ASPECTS = {
  cover: { width: 1200, height: 630 },
  content: { width: 1000, height: 600 },
  square: { width: 900, height: 900 },
  banner: { width: 1200, height: 600 },
  // Carousel backgrounds are full-bleed behind a dim overlay, so they are
  // fetched wider and shorter than an OG cover.
  hero: { width: 1920, height: 860 },
  heroCard: { width: 800, height: 600 },
  // A store banner is a wide letterbox strip behind the store header.
  storeBanner: { width: 1600, height: 400 },
  storeLogo: { width: 600, height: 600 },
};

/**
 * Licences with NO attribution obligation — the "zero copyright" set.
 *
 * 🛑 A slot marked `publicDomainOnly` accepts ONLY these. CC BY and CC BY-SA
 * are free licences but they REQUIRE visible credit, and a full-bleed hero
 * background has nowhere to put it: the slide is a headline, a line of copy
 * and a button. Blog covers are different — those carry a provenance file and
 * a byline area, so they may use CC BY-SA.
 */
export const NO_ATTRIBUTION_LICENCES = ["cc0", "public domain", "pd", "no restrictions"];

/**
 * Slots served from images ALREADY in our bucket. No fetch, no licence
 * question — these are the taxonomy/parts photographs the category pages
 * already use, which for Beyblade subjects are better than anything Commons
 * holds.
 *
 * 🛑 Every value must be a real `/media/<shortId>` that resolves through a
 * `mediaAssets` row. `push-editorial-images.mjs` VERIFIES each one against
 * Firestore before writing it anywhere — a typo here would otherwise publish a
 * cover URL that 404s while looking perfectly well-formed (the exact failure
 * mode in CLAUDE.md's `mediaAssets` orphaning note).
 */
/*
 * 🛑 DELIBERATELY EMPTY since 2026-10-21, and that is the finished state.
 *
 * This map held 14 Beyblade slots pointing at catalogue photography already
 * in our bucket. It worked, but it had two faults that only showed once the
 * pages were looked at side by side:
 *
 *   1. THREE images each served two different articles
 *      (`product-bx-53-box-image`, `category-beyblade-original-image`,
 *      `category-beyblade-metal-image`), so the blog index showed visible
 *      duplicates.
 *   2. Recycling shop photography onto editorial makes the blog look like
 *      the catalogue.
 *
 * Every one of those slots is now FETCHED as a distinct item shot by
 * `fetch-vertical-item-images.mjs`, so `mediaUrl()` resolves all of them to
 * `/media/<slot key>` and there is nothing left to special-case.
 *
 * Kept rather than deleted because `push-editorial-images.mjs` verifies every
 * entry against live Firestore before writing, and that guard should survive
 * for the next slot that genuinely wants an image we already own.
 */
export const REUSED_MEDIA = {};

/**
 * @typedef {{ key: string, aspect: keyof typeof ASPECTS, queries: string[],
 *             phrase?: string, allowMark?: boolean }} Slot
 */

/** @type {Slot[]} */
export const EDITORIAL_SLOTS = [
  // ── Blog covers, non-Beyblade subjects ──────────────────────────────────
  {
    key: "blog-cover-hot-wheels-collecting",
    aspect: "cover",
    phrase: "hotwheels",
    queries: ["Hot Wheels diecast", "Hot Wheels car", "Hot Wheels"],
  },
  { key: "blog-cover-gundam-grades", aspect: "cover", queries: ["Gunpla plastic parts", "Gunpla sprues", "Gundam model kit"] },
  { key: "blog-cover-pokemon-prismatic", aspect: "cover", queries: ["Pyrkon Pokemon Trading Card", "Pokemon Trading Card Game", "Pokemon collection"] },
  { key: "blog-cover-funko-pop-india", aspect: "cover", queries: ["Funko Pop vinyl", "Funko Pop figures", "Funko"] },
  { key: "blog-cover-tomica-vs-hot-wheels", aspect: "cover", phrase: "tomica", queries: ["Tomica diecast", "Tomica car", "Tomica"] },
  { key: "blog-cover-protect-collectibles", aspect: "cover", queries: ["silica gel desiccant", "dehumidifier", "vitrine showcase"] },
  { key: "blog-cover-selling-tips", aspect: "cover", queries: ["shipping parcel box", "cardboard boxes stacked", "packing boxes"] },
  { key: "blog-cover-one-piece-tcg", aspect: "cover", queries: ["One Piece Card Game", "trading cards vending", "card game tournament"] },
  { key: "blog-cover-mumbai-gundam", aspect: "cover", queries: ["Gunpla display", "Gundam figures display", "Gundam model"] },
  { key: "blog-cover-india-market", aspect: "cover", queries: ["Mumbai bazaar shop", "Indian bazaar stall", "Delhi market shop"] },
  { key: "blog-cover-escrow-launch", aspect: "cover", queries: ["padlock security", "padlock", "bank vault door"] },
  /*
   * "verification stamp" resolved a POSTAGE stamp (Serbia-Turkey diplomatic
   * relations, 2019) — both tokens present, subject unrelated. A magnifier
   * over goods is the concrete stand-in for "we inspect every item".
   */
  { key: "blog-cover-seller-verification", aspect: "cover", queries: ["jeweler loupe", "magnifying glass lens", "magnifying glass inspection"] },
  { key: "blog-cover-auction-launch", aspect: "cover", queries: ["auction house bidding", "auction gavel", "auctioneer"] },

  // ── Blog inline content, non-Beyblade subjects ──────────────────────────
  { key: "blog-content-genuine-beyblade-weight", aspect: "content", queries: ["digital kitchen scale", "precision balance scale", "weighing scale"] },
  { key: "blog-content-top10-tournament-gold", aspect: "content", queries: ["trophy cup", "championship trophy", "gold medal"] },

  // ── Event + promo ───────────────────────────────────────────────────────
  { key: "event-cover-cashback-10", aspect: "banner", queries: ["Indian rupee banknotes", "rupee banknote", "indian rupee"] },
  { key: "event-content-cashback-10", aspect: "content", queries: ["500 Indian Rupee Banknote", "Indian Rupee Banknote", "rupee coins"] },

  /*
   * ── Carousel backgrounds — CC0 / public domain ONLY ─────────────────────
   *
   * Asked for explicitly as "net zero copyright". These are the homepage
   * hero, full-bleed behind a dim overlay, so there is nowhere to render an
   * attribution line — which rules out CC BY / CC BY-SA however free they
   * otherwise are. `publicDomainOnly` enforces that at selection time rather
   * than leaving it to whoever reads the provenance file afterwards.
   *
   * They are deliberately ABSTRACT, not product shots. A carousel background
   * sits under inverse-ink copy at ~50% dim; a photograph of a top competes
   * with the headline and loses both. The item photography belongs on the
   * cards, the rails and the blog — which is where it now is.
   */
  { key: "carousel-bg-hero", aspect: "hero", publicDomainOnly: true, queries: ["Lights-dark-abstract-bokeh", "bokeh lights dark", "dark abstract background"] },
  { key: "carousel-bg-cashback", aspect: "hero", publicDomainOnly: true, queries: ["Abstract-Artwork- 1243", "abstract artwork orange", "dark abstract background"] },
  { key: "carousel-bg-bundles", aspect: "hero", publicDomainOnly: true, queries: ["Abstract-Artwork- 1260", "abstract artwork blue", "blue abstract texture"] },
  { key: "carousel-bg-preorders", aspect: "hero", publicDomainOnly: true, queries: ["Dark grey speckled flecked clean seamless concrete building wall texture", "dark concrete wall texture", "dark abstract background"] },
  { key: "carousel-bg-authenticity", aspect: "hero", publicDomainOnly: true, queries: ["Abstract-Artwork- 1229", "dark slate abstract", "dark abstract background"] },

  /*
   * `store-letitrip-official`'s banner. CC0 for the same reason as the
   * carousel: it is a wide strip behind the store header with the store name
   * over it, so there is nowhere to render an attribution line.
   *
   * 🛑 Its LOGO is deliberately NOT here — that is our own `public/logo.svg`,
   * rasterised by `scripts/make-store-logo.mjs`. The platform's own store
   * should carry the platform's own mark, and a fetched image would be both a
   * licence question and simply wrong.
   */
  /*
   * 🛑 A DISTINCT query, not a generic one. "dark abstract background" first
   * resolved `Abstract-Artwork- 1229` — already the authenticity slide's
   * background, so the store banner and a carousel slide would have shown the
   * same picture. Naming the file is how each CC0 slot stays unique; there is
   * no de-duplication in the picker.
   */
  { key: "store-banner-letitrip-official", aspect: "storeBanner", publicDomainOnly: true, queries: ["Dark red garnet painted speckled concrete seamless building wall texture", "dark concrete wall texture", "dark abstract background"] },

  // Hero slide's three cards — smaller, same licence rule.
  { key: "carousel-card-shop", aspect: "heroCard", publicDomainOnly: true, queries: ["Abstract-Artwork- 1263", "abstract artwork green", "dark abstract background"] },
  { key: "carousel-card-bundles", aspect: "heroCard", publicDomainOnly: true, queries: ["Festive Christmas lights create bokeh", "bokeh lights dark", "dark abstract background"] },
  { key: "carousel-card-preorders", aspect: "heroCard", publicDomainOnly: true, queries: ["Dark tan taupe rough moderately worn grubby seamless concrete building wall texture", "dark concrete wall texture", "dark abstract background"] },

  /*
   * 🛑 `spare-image-elevate-bit` and `bundle-cover-x-premium-tops` are
   * DELIBERATELY ABSENT from every list here.
   *
   *   Elevate bit  -> beyblade.fandom.com "Bit - Elevate", fetched through the
   *                   SAME `scripts/lib/wiki-images.mjs` the parts pipeline
   *                   uses, by `fetch-elevate-bit-image.mjs`.
   *   Bundle cover -> its three members' own `/media/product-*-image` shots,
   *                   composed into a real collage by `withBundleMosaic`.
   *
   * Fetching a worse image for a slot that already has a better one is how a
   * catalogue ends up illustrated with stock photography.
   */
];
