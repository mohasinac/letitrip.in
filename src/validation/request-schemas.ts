/**
 * letitrip.in — Request Validation Schemas
 *
 * Letitrip-specific Zod schemas for API request body and query validation.
 * Common helpers (validateRequestBody, formatZodErrors, mediaUrlSchema, etc.)
 * are in @mohasinac/appkit/validation — import from there directly.
 *
 * This file contains only schemas with letitrip-specific rules or complex
 * multi-field validation that cannot be owned by appkit generically.
 */

import { z } from "zod";
import { getDefaultCurrency } from "@mohasinac/appkit/core/baseline-resolver";

// ============================================
// SHARED PRIMITIVE SCHEMAS (Zod v4)
// These mirror appkit/validation equivalents but use the local Zod v4 instance
// so they remain type-compatible with letitrip's local z.* combinators.
// Remove when appkit is upgraded to Zod v4.
// ============================================

export const objectIdSchema = z.string().regex(/^[a-z0-9-]+$/);

export const urlSchema = z.string().url().max(2048);

export const dateStringSchema = z.string().datetime({ offset: true });

import { MEDIA_ENDPOINTS } from "@mohasinac/appkit/constants/api-endpoints";
import { isStoredMediaRef, MEDIA_URL_MAX_LENGTH, MEDIA_URL_MESSAGE, getYouTubeVideoId } from "@mohasinac/appkit/utils/media-url";
import { addressFormSchema, addressUpdateSchema } from "@mohasinac/appkit/server";
import { MAX_FEATURES_PER_PRODUCT } from "@mohasinac/appkit/features/products/schemas/product-features";
import { ALL_LISTING_TYPES, PRODUCT_MAX_IMAGES } from "@mohasinac/appkit";
import type { ListingType } from "@mohasinac/appkit/features/products/types/index";

/**
 * A media reference we are willing to PERSIST. The zod-4 twin of appkit's
 * `mediaUrlSchema` — the two Zod majors mean the schema object can't be
 * shared, so both refine on the SAME predicate (`isStoredMediaRef`) instead
 * of each re-deriving the rule. That re-derivation is what let both copies
 * be wrong in the same way.
 *
 * For a genuine EXTERNAL link (brand website, social handle, tracking URL)
 * use `urlSchema` above — not this.
 */
export const mediaUrlSchema = z
  .string()
  .max(MEDIA_URL_MAX_LENGTH)
  .refine(isStoredMediaRef, { message: MEDIA_URL_MESSAGE });

/**
 * What a LISTING's own media may be, on the way into Firestore.
 *
 * 🛑 Never `urlSchema` for a media field. `z.string().url()` demands an
 * absolute URL, and **every** form this platform actually mints is relative:
 * `/media/<slug>` from `/api/media/finalize`, and `/api/media/ext?url=…` from
 * `seedExtMedia`. `mainImage` was declared `urlSchema`, so it rejected the
 * product's OWN stored image and **every seller listing edit failed** with a
 * bare "Invalid URL" — for a value the seller never typed and could not see.
 * appkit's twin of `mediaUrlSchema` carries a comment about having already
 * fixed this exact mistake for avatars; the fix was made to the helper here and
 * never applied to the fields that needed it.
 *
 * This is deliberately WIDER than `isStoredMediaRef`, which rejects the `ext`
 * proxy form. That rejection is right for a user-supplied avatar — an arbitrary
 * third-party image should not be persisted as if it were ours — but a listing
 * legitimately carries `ext` refs, because the platform itself mints them and
 * the endpoint validates and watermarks what it serves. Widening here rather
 * than loosening `isStoredMediaRef` keeps the stricter rule for every other
 * consumer of it.
 */
const isPersistableListingMedia = (value: string): boolean =>
  isStoredMediaRef(value) || value.startsWith(MEDIA_ENDPOINTS.EXT);

export const listingMediaUrlSchema = z
  .string()
  .max(MEDIA_URL_MAX_LENGTH)
  .refine(isPersistableListingMedia, { message: MEDIA_URL_MESSAGE });

export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function formatZodErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  });
  return formatted;
}

// ============================================
// PRODUCT SCHEMAS
// ============================================

const productSpecificationSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(200),
  unit: z.string().max(20).optional(),
});

const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];

/**
 * A listing video's source.
 *
 * Three shapes are legitimate and the previous `urlSchema` + extension refine
 * accepted only one of them:
 *   1. an uploaded file — `/media/<slug>`, relative, so `urlSchema` rejected it;
 *   2. a raw external file — absolute, with a video extension;
 *   3. a **YouTube** watch URL — which `MediaUploadField` deliberately mints
 *      from its own "YouTube" tab, and which has no video extension, so the
 *      refine rejected it. A YouTube-sourced listing could be authored in the
 *      picker and then never saved (Root Cause #49, on the write side).
 */
const isPersistableVideoSource = (u: string): boolean => {
  if (isPersistableListingMedia(u)) return true;
  if (getYouTubeVideoId(u)) return true;
  return ALLOWED_VIDEO_EXTENSIONS.some((ext) =>
    u.toLowerCase().split("?")[0].endsWith(ext),
  );
};

const videoSchema = z
  .object({
    url: z
      .string()
      .max(2048)
      .refine(isPersistableVideoSource, {
        message:
          "Video must be an uploaded file, a YouTube link, or a direct mp4/webm/ogg/mov/m4v URL",
      }),
    // An image, and the seed wraps it through the ext proxy — so it is a media
    // ref, not an absolute URL.
    thumbnailUrl: listingMediaUrlSchema,
    duration: z.number().positive().max(600),
    trimStart: z.number().min(0).optional(),
    trimEnd: z.number().positive().optional(),
  })
  .refine(
    (data) => !data.trimEnd || !data.trimStart || data.trimEnd > data.trimStart,
    { message: "Trim end must be after trim start" },
  )
  .refine((data) => !data.trimEnd || data.trimEnd <= data.duration, {
    message: "Trim end cannot exceed video duration",
  });

const PROHIBITED_WORDS = ["scam", "fraud", "counterfeit", "replica", "illegal"];
const containsProhibited = (text: string) =>
  PROHIBITED_WORDS.some((word) => text.toLowerCase().includes(word));

const productBaseSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200)
    .refine((t) => !containsProhibited(t), {
      message: "Title contains prohibited content",
    }),
  description: z
    .string()
    .min(20)
    .max(5000)
    .refine((d) => !containsProhibited(d), {
      message: "Description contains prohibited content",
    }),
  category: z.string().min(1).max(100),
  /*
   * I1 — the ASSIGNED categories, when a caller sends more than one.
   *
   * 🛑 Must be named here or it is STRIPPED on every seller and admin write and
   * the write still returns 200 — this schema has no `.passthrough()`, and that
   * is exactly how a UI-created product lost its `categorySlugs` chain
   * (Root Cause #101). The same trap as `finalSale` and `isLot` below.
   *
   * Capped at 4 to match `MAX_CATEGORY_ASSIGNMENTS`: the derived closure is
   * `array-contains`-indexed and Firestore's `array-contains-any` takes at most
   * 30 values, so 4 assignments x 5 tiers leaves headroom.
   *
   * Optional, because `category` alone remains a complete, valid payload — it
   * means one assignment, which is what every current form sends. The
   * one-per-root and leaf/non-leaf rules are NOT checked here: they need the
   * category documents, so they live in `deriveTaxonomy` where the read already
   * happens.
   */
  categoryIds: z.array(z.string().trim().min(1).max(100)).min(1).max(4).optional(),
  subcategory: z.string().min(1).max(100).optional(),
  brand: z.string().min(1).max(100).optional(),
  price: z.number().positive().max(10000000),
  originalPrice: z.number().positive().max(10000000).optional(),
  currency: z.string().length(3).default(getDefaultCurrency()),
  // Optional here — required only for listing types whose wizard step actually
  // renders a stock field (see STOCK_QUANTITY_REQUIRED_LISTING_TYPES below).
  // Auction/pre-order/prize-draw/digital-code listings have no stock input,
  // so making this unconditionally required made those 4 types un-publishable.
  stockQuantity: z.number().int().nonnegative().optional(),
  mainImage: listingMediaUrlSchema,
  images: z.array(listingMediaUrlSchema).max(PRODUCT_MAX_IMAGES).optional(),
  video: videoSchema.optional(),
  specifications: z.array(productSpecificationSchema).max(50).optional(),
  /*
   * 🛑 `MAX_FEATURES_PER_PRODUCT`, not a literal 20, and the two DISAGREED.
   *
   * appkit caps at **24** — `deriveTaxonomy` merges the category's inherited
   * features and truncates there, so a legitimate derive can produce 21–24.
   * This schema said 20, so the next seller save of such a listing failed
   * validation on a value the platform had written itself. The cap was raised
   * to 24 when the feature vocabulary absorbed tags (a reproduction,
   * new-in-box, japan-import, attack-type, right-spin, limited-release bey is
   * six features before anything optional) and this literal was not.
   */
  features: z.array(z.string().min(1).max(200)).max(MAX_FEATURES_PER_PRODUCT).optional(),
  /*
   * WHO MADE IT — distinct from `condition` (how worn) and `brand` (whose
   * marque is on it, which a reproduction has none of).
   *
   * 🛑 Must be named here or it is STRIPPED on every write, like `finalSale`
   * below. There is deliberately no "fake" value: a lead-bearing counterfeit
   * is not a listing state this marketplace offers, it is a scam report.
   */
  authenticity: z.enum(["original", "reproduction", "unverified"]).optional(),
  /*
   * The PACKED parcel, optional on purpose (C5a) — the category's packed
   * default drives the checkout estimate and the real figure is entered at
   * shipment time, when the seller has the box in front of them. An item
   * weight here would under-estimate every booking.
   */
  weightG: z.number().nonnegative().max(100000).optional(),
  dimensionsCm: z
    .object({
      l: z.number().positive().max(500),
      w: z.number().positive().max(500),
      h: z.number().positive().max(500),
    })
    .optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  shippingInfo: z.string().max(1000).optional(),
  returnPolicy: z.string().max(1000).optional(),
  // 🛑 Must be named here or it is STRIPPED on every seller and admin write —
  // this schema has no `.passthrough()` (see the block comment below).
  // Optional with NO `.default()`: absent means final sale, and defaulting it
  // to `true` here would write an explicit value the seller never chose,
  // making "seller opted in" and "seller said nothing" indistinguishable.
  finalSale: z.boolean().optional(),
  /*
   * G3 — a LOT is many items in one listing; a SINGLE is one.
   *
   * 🛑 `isLot` is what makes a category count unambiguous, so the repository
   * REFUSES a lot filed at a leaf. That is a 400 from `deriveTaxonomy`, not a
   * silent correction — guessing which the seller meant is how a leaf's own
   * count ends up mixing the two with no way to tell them apart.
   *
   * 🛑 CORRECTED: this comment used to claim the mirror half — "and a single
   * filed at a non-leaf" — was also refused. It was not. Measured 2026-10-13:
   * **70 of 71 hand-authored products file at a non-leaf** and none is a lot,
   * so enforcing it would have failed almost the whole catalogue. It now
   * REPORTS, and flips to a refusal via `ENFORCE_LEAF_FILING` once the data is
   * clean — see `appkit/src/features/products/repository/category-assignment.ts`.
   *
   * No `.default(false)`: absent means single, and writing an explicit `false`
   * on every product would make "the seller said single" and "the seller
   * never saw this field" indistinguishable — the `finalSale` reasoning one
   * field up.
   */
  isLot: z.boolean().optional(),
  /*
   * How many items the lot holds. Bounded at 999: it drives the per-item price
   * hint, and an unbounded count divides a real price by a typo.
   *
   * 🛑 Deliberately NOT required when `isLot` is true, and not cross-validated
   * here. A seller who knows it is a lot but has not counted the pile yet must
   * be able to save a draft — the repository's filing rule is the invariant
   * that matters, and a count is a display detail.
   */
  lotSize: z.number().int().min(2).max(999).optional(),
  // ── D13/D14 ─────────────────────────────────────────────────────────────
  //
  // 🛑 No `.default()` on any of them. An absent value must stay
  // distinguishable from a chosen one — the same reason `isLot` carries no
  // `.default(false)`, and the reason `gstRate` distinguishes `undefined` from
  // `0` (C0c defect 6: a display default that writes a hard value is a
  // one-click foot-gun).
  unitLabel: z.string().trim().min(1).max(24).optional(),
  // The `partGlossary` document id — `${slot}--${tail}`. Bounded, and the
  // shape is asserted rather than trusted, because it is also a URL segment.
  partGlossaryId: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+--[a-z0-9-]+$/, "Not a part id")
    .max(120)
    .optional(),
  colourway: z.string().trim().min(1).max(40).optional(),
  mouldVariant: z.string().trim().min(1).max(60).optional(),
  // 🛑 Capped at 8. The deepest real composition is five slots and the widest
  // is nine with merges split out; a caller sending 500 entries would be 500
  // transactional reads in one assembly.
  assembledFrom: z
    .array(
      z.object({
        slotKey: z.string().trim().min(1).max(40),
        productId: z.string().trim().min(1).max(200),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .max(8)
    .optional(),
  isDraft: z.boolean().default(false),
  /*
   * 🛑 NINE values, matching `ProductDocument.condition` and
   * `PRODUCT_FIELDS.CONDITION_VALUES`. It declared **four**, and that was a
   * live defect rather than a narrowing.
   *
   * The seller form offers new / like_new / good / fair / used / refurbished.
   * Three of those six — `like_new`, `good`, `fair` — were not in the enum, so
   * a seller who picked one got a VALIDATION FAILURE on publish, not a
   * silently-dropped field. `poor` and `graded` were unreachable too, and the
   * seed writes `like_new` and `good` through the repository, which bypasses
   * this schema — so the fixtures carry values the API refuses, and editing
   * one through the UI would have failed on a field the seller never touched.
   *
   * Sourced from the union rather than retyped: a condition list has now
   * existed in three places with three different lengths.
   */
  condition: z
    .enum([
      "new",
      "like_new",
      "good",
      "fair",
      "poor",
      "used",
      "refurbished",
      "broken",
      "graded",
    ])
    .optional(),
  insurance: z.boolean().optional(),
  insuranceCost: z.number().nonnegative().optional(),
  shippingPaidBy: z.enum(["seller", "buyer"]).optional(),
  pickupAddressId: objectIdSchema.optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string().min(1).max(50)).max(10).optional(),
  /*
   * SB1-G Phase 4 — canonical discriminator (booleans removed).
   *
   * 🛑 DERIVED from `ALL_LISTING_TYPES`, never restated. The hand-written
   * literal that used to sit here had drifted in BOTH directions at once:
   *
   *   - `spares` was missing, added to the union 2026-10-19. Every
   *     `/store/spares/new` save failed Zod validation — autosave AND publish —
   *     so the listing type could not be created at all through the seller flow
   *     while its 21 per-type pages, nav entry and `/spares` browse page all
   *     existed and looked complete.
   *   - `bundle` was still present, dropped from the union in SB-UNI-D. A
   *     caller could POST it and pass validation, producing a product that
   *     `pluginFor`, `LISTING_KIND_ALIAS_MAP` and `isListingRowAvailable` have
   *     no branch for — invisible on every surface and uneditable from any UI.
   *
   * `appkit/src/features/products/types/index.ts` warns that adding a union
   * member touches 21 named sites of which only 11 are compile-checked. This
   * was one of the ten unchecked ones; deriving it makes it the eleventh.
   * Root Cause #61.
   *
   * The `as [T, ...T[]]` cast is the established convention for this —
   * `z.enum` wants a non-empty tuple and `Object.keys` yields an array. Same
   * spelling as `src/app/api/admin/events/route.ts`'s `ALL_EVENT_TYPES`.
   */
  listingType: z
    .enum(ALL_LISTING_TYPES as [ListingType, ...ListingType[]])
    .optional(),
  auctionEndDate: dateStringSchema.optional(),
  startingBid: z.number().positive().optional(),
  reservePrice: z.number().positive().optional(),
  buyNowPrice: z.number().positive().optional(),
  minBidIncrement: z.number().positive().optional(),
  autoExtendable: z.boolean().optional(),
  auctionExtensionMinutes: z.number().int().positive().optional(),
  auctionShippingPaidBy: z.enum(["seller", "winner"]).optional(),
  preOrderDeliveryDate: dateStringSchema.optional(),
  preOrderDepositPercent: z.number().min(0).max(100).optional(),
  preOrderDepositAmount: z.number().nonnegative().optional(),
  preOrderMaxQuantity: z.number().int().nonnegative().optional(),
  preOrderProductionStatus: z
    .enum(["upcoming", "in_production", "ready_to_ship"])
    .optional(),
  preOrderCancellable: z.boolean().optional(),
  allowShipBeforeEmiComplete: z.boolean().optional(),
  allowOffers: z.boolean().optional(),
  minOfferPercent: z.number().min(0).max(100).optional(),
  gstRate: z.union([z.literal(0), z.literal(5), z.literal(12), z.literal(18), z.literal(28)]).optional(),
  hsnCode: z.string().max(20).optional(),
  printMeta: z
    .object({
      size: z.string().max(80).optional(),
      material: z.string().max(80).optional(),
      finish: z.string().max(80).optional(),
      editionSize: z.number().int().positive().optional(),
    })
    .optional(),
});

// Listing types whose wizard step renders a stock-quantity field — kept in
// sync with `showsStockQuantity` in appkit/src/_internal/shared/listing-types/*/config.ts.
const STOCK_QUANTITY_REQUIRED_LISTING_TYPES = new Set([
  "standard",
  "art",
  "stickers",
  "classified",
  "live",
]);

/*
 * ---------------------------------------------------------------------------
 * PER-TYPE LISTING FIELDS — the ones `productBaseSchema` was missing.
 * ---------------------------------------------------------------------------
 *
 * 🛑 This was live, silent data loss.
 *
 * `productBaseSchema` is a plain `z.object()` with no `.passthrough()`, so it
 * STRIPS every key it does not name. It named none of the classified,
 * digital-code, live-item or prize-draw fields — and the real seller create
 * path (`createSellerProductAction` -> `productCreateSchema.safeParse`) runs
 * through it.
 *
 * So a seller filled in a classified's meetup city, a digital code's delivery
 * method, a live animal's species and CITES permit, or a prize draw's entry
 * price — pressed Publish, got a success — and every one of those fields was
 * dropped before the document was written. The listing existed; the thing that
 * made it that KIND of listing did not.
 *
 * Shapes mirror `ProductClassifiedMeta` / `ProductDigitalCodeMeta` /
 * `ProductLiveItemMeta` and the prize-draw fields on `ProductDocument`. They
 * are nested exactly as the document nests them: `classified.meetupArea.city`,
 * not a flattened `classifiedCity`, because a flattened shape here would be a
 * second spelling of the same data and the write path would have to translate.
 */

const classifiedMetaSchema = z.object({
  meetupArea: z.object({
    city: z.string().min(1, "A meetup city is required for a classified listing."),
    locality: z.string().optional(),
    pincode: z.string().optional(),
  }),
  // `contactMethod` removed 2026-08-31 — display-only, never branched on, and
  // its "phone" value had no phone-number field anywhere to back it.
  acceptsShipping: z.boolean().optional(),
  negotiable: z.boolean().optional(),
});

const digitalCodeMetaSchema = z.object({
  codeDeliveryMethod: z.enum(["auto-claim", "manual-email"]),
  codePoolSize: z.coerce.number().int().min(0).optional(),
  codesAvailable: z.coerce.number().int().min(0).optional(),
  redemptionInstructions: z.string().max(2000).optional(),
  expiresAt: z.string().optional(),
});

const liveItemMetaSchema = z.object({
  species: z.string().min(1, "A species is required for a live-item listing."),
  ageMonths: z.coerce.number().int().min(0).optional(),
  sex: z.enum(["male", "female", "unknown", "n/a"]).optional(),
  careInfo: z.string().max(4000).optional(),
  transport: z.object({
    method: z.enum(["courier", "in-person", "specialist"]),
    handlingFee: z.coerce.number().min(0).optional(),
    insuranceIncluded: z.boolean().optional(),
  }),
  // Not optional on purpose: shipping a live animal into a jurisdiction that
  // forbids it is the one mistake this field exists to prevent.
  jurisdictionAllowed: z.array(z.string()).min(1, "At least one permitted jurisdiction is required."),
  vendorVerified: z.boolean().optional(),
  cites: z.string().optional(),
});

export const productCreateSchema = productBaseSchema
  .extend({
    status: z.enum(["draft", "published"]).optional(),

    // The four blocks above, plus the prize-draw fields, which live at the top
    // level of ProductDocument rather than in a nested meta object.
    classified: classifiedMetaSchema.optional(),
    digitalCode: digitalCodeMetaSchema.optional(),
    liveItem: liveItemMetaSchema.optional(),

    pricePerEntry: z.coerce.number().min(0).optional(),
    prizeMaxEntries: z.coerce.number().int().min(1).optional(),
    prizeDrawMode: z.enum(["reveal", "lottery"]).optional(),
    prizeRevealMode: z.enum(["instant", "scheduled"]).optional(),
    prizeRevealWindowStart: z.string().optional(),
    prizeRevealWindowEnd: z.string().optional(),
    prizeDrawDurationDays: z.coerce.number().int().min(1).optional(),
    prizeSlotPrice: z.coerce.number().min(0).optional(),
    prizeGithubFileUrl: z.string().optional(),
  })
  .refine(
    (data) =>
      data.listingType !== "auction" ||
      (data.auctionEndDate && data.startingBid),
    { message: "Auction items must have end date and starting bid" },
  )
  .refine(
    (data) =>
      !data.auctionEndDate || new Date(data.auctionEndDate as string) > new Date(),
    { message: "Auction end date must be in the future" },
  )
  .refine(
    (data) =>
      !data.listingType ||
      !STOCK_QUANTITY_REQUIRED_LISTING_TYPES.has(data.listingType) ||
      data.stockQuantity !== undefined,
    { message: "Stock quantity is required for this listing type", path: ["stockQuantity"] },
  )
  .refine(
    (data) => data.listingType !== "live" || Boolean(data.video?.url),
    {
      message: "A video is required for live-item listings — buyers must see the actual animal/plant moving before purchase.",
      path: ["video"],
    },
  );

export const productUpdateSchema = productBaseSchema.partial().extend({
  // Editing has to carry these too. A create-only fix would mean a classified
  // could be created correctly and then lose its meetup city the first time
  // anyone edited its title — the create/update transform asymmetry of
  // Recurrent Root Cause #39.
  classified: classifiedMetaSchema.optional(),
  digitalCode: digitalCodeMetaSchema.optional(),
  liveItem: liveItemMetaSchema.optional(),
  pricePerEntry: z.coerce.number().min(0).optional(),
  prizeMaxEntries: z.coerce.number().int().min(1).optional(),
  prizeDrawMode: z.enum(["reveal", "lottery"]).optional(),
  prizeRevealMode: z.enum(["instant", "scheduled"]).optional(),
  prizeRevealWindowStart: z.string().optional(),
  prizeRevealWindowEnd: z.string().optional(),
  prizeDrawDurationDays: z.coerce.number().int().min(1).optional(),
  prizeSlotPrice: z.coerce.number().min(0).optional(),
  prizeGithubFileUrl: z.string().optional(),
  status: z
    .enum(["draft", "published", "in_review", "archived"])
    .optional(),
  version: z.number().optional(),
  featured: z.boolean().optional(),
  isPromoted: z.boolean().optional(),
  promotionEndDate: dateStringSchema.optional(),
});

// ============================================
// CATEGORY SCHEMAS
// ============================================

const categoryBaseSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: objectIdSchema.optional(),
  description: z.string().max(500).optional(),
  display: z
    .object({
      icon: z.string().max(100).optional(),
      coverImage: listingMediaUrlSchema.optional(),
      color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      showInMenu: z.boolean().default(true),
      showInFooter: z.boolean().default(false),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().min(1).max(200).optional(),
      description: z.string().min(1).max(500).optional(),
      keywords: z.array(z.string().min(1).max(50)).max(20).optional(),
    })
    .optional(),
});

export const categoryCreateSchema = categoryBaseSchema;

export const categoryUpdateSchema = categoryBaseSchema.partial().extend({
  order: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBrand: z.boolean().optional(),
  showOnHomepage: z.boolean().optional(),
  isSearchable: z.boolean().optional(),
});

// ============================================
// USER ADDRESS SCHEMAS
// ============================================

/*
 * The SHARED address shape and the SHARED postal rule (W5 / D19).
 *
 * This declared its own eleven fields with
 * `postalCode: /^\d{6}$/, country: .default("India")` — an India-only rule on
 * a form whose country is user-supplied, and one of fifteen postal rules that
 * disagreed with each other. `addressFormSchema` resolves the rule from the
 * country on the record.
 */
export const userAddressCreateSchema = addressFormSchema;
export const userAddressUpdateSchema = addressUpdateSchema;

// ============================================
// SITE SETTINGS SCHEMAS
// ============================================

// `siteSettingsUpdateSchema` was deleted 2026-08-24 along with its only
// caller, `PATCH /api/site-settings`. It declared a stale subset of the real
// document (no `integrations`, `platformLimits`, `auctionConfig`,
// `notificationChannels`, `emi`, `gst`, `laborRate`, `theme`, `watermark`;
// wrong `legalPages` key names; a `featureFlags` shape missing `listingTypes`)
// — and because Zod strips unknown keys while Firestore `.update()` replaces
// nested maps wholesale, validating a real admin save through it would have
// silently wiped every per-listing-type feature flag. The single admin write
// path is now `PUT /api/admin/site`, which allow-lists top-level groups
// instead. Do not resurrect this without regenerating it from the schema.
