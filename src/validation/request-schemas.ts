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
import { getDefaultCurrency } from "@mohasinac/appkit";

// ============================================
// SHARED PRIMITIVE SCHEMAS (Zod v4)
// These mirror appkit/validation equivalents but use the local Zod v4 instance
// so they remain type-compatible with letitrip's local z.* combinators.
// Remove when appkit is upgraded to Zod v4.
// ============================================

export const objectIdSchema = z.string().regex(/^[a-z0-9-]+$/);

export const urlSchema = z.string().url().max(2048);

export const dateStringSchema = z.string().datetime({ offset: true });

import {
  isStoredMediaRef,
  MEDIA_URL_MAX_LENGTH,
  MEDIA_URL_MESSAGE,
} from "@mohasinac/appkit";
import { addressFormSchema, addressUpdateSchema } from "@mohasinac/appkit/server";

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

const videoSchema = z
  .object({
    url: urlSchema.refine(
      (u) =>
        ALLOWED_VIDEO_EXTENSIONS.some((ext) =>
          u.toLowerCase().split("?")[0].endsWith(ext),
        ),
      { message: "Video must be mp4, webm, ogg, mov, or m4v format" },
    ),
    thumbnailUrl: urlSchema,
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
  mainImage: urlSchema,
  images: z.array(urlSchema).max(5).optional(),
  video: videoSchema.optional(),
  specifications: z.array(productSpecificationSchema).max(50).optional(),
  features: z.array(z.string().min(1).max(200)).max(20).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  shippingInfo: z.string().max(1000).optional(),
  returnPolicy: z.string().max(1000).optional(),
  isDraft: z.boolean().default(false),
  condition: z.enum(["new", "used", "refurbished", "broken"]).optional(),
  insurance: z.boolean().optional(),
  insuranceCost: z.number().nonnegative().optional(),
  shippingPaidBy: z.enum(["seller", "buyer"]).optional(),
  pickupAddressId: objectIdSchema.optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string().min(1).max(50)).max(10).optional(),
  // SB1-G Phase 4 — canonical discriminator (booleans removed).
  listingType: z
    .enum(["standard", "auction", "pre-order", "prize-draw", "bundle", "classified", "digital-code", "live", "art", "stickers"])
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
      coverImage: urlSchema.optional(),
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
