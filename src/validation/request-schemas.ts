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
import { normalizeError } from "@mohasinac/appkit";
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

import { FIREBASE_STORAGE_HOST, GCS_HOST } from "@mohasinac/appkit";

const APPROVED_MEDIA_DOMAINS = [
  FIREBASE_STORAGE_HOST,
  GCS_HOST,
  "res.cloudinary.com",
  "images.unsplash.com",
];

export const mediaUrlSchema = z
  .string()
  .url()
  .max(2048)
  .refine(
    (url) => {
      try {
        const { hostname } = new URL(url);
        return APPROVED_MEDIA_DOMAINS.some(
          (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
        );
      } catch (_err) {
        void normalizeError(_err);
        return false; // URL constructor throws for invalid URL strings
      }
    },
    { message: "Image or video URL must be hosted on an approved CDN domain" },
  );

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

export const productCreateSchema = productBaseSchema
  .extend({
    status: z.enum(["draft", "published"]).optional(),
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

const userAddressBaseSchema = z.object({
  label: z.string().min(1, "Label is required").max(50, "Label too long"),
  fullName: z
    .string()
    .min(2, "Full name too short")
    .max(100, "Full name too long"),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
  addressLine1: z
    .string()
    .min(5, "Address line 1 too short")
    .max(150, "Address line 1 too long"),
  addressLine2: z.string().max(150, "Address line 2 too long").optional(),
  landmark: z.string().max(100, "Landmark too long").optional(),
  city: z.string().min(2, "City too short").max(60, "City too long"),
  state: z.string().min(2, "State too short").max(60, "State too long"),
  postalCode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  country: z.string().min(2, "Country required").max(60).default("India"),
  isDefault: z.boolean().optional().default(false),
});

export const userAddressCreateSchema = userAddressBaseSchema;
export const userAddressUpdateSchema = userAddressBaseSchema.partial();

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
