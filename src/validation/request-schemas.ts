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

const APPROVED_MEDIA_DOMAINS = [
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
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
      } catch {
        return false;
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
  stockQuantity: z.number().int().nonnegative(),
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
  isAuction: z.boolean().optional(),
  auctionEndDate: dateStringSchema.optional(),
  startingBid: z.number().positive().optional(),
  reservePrice: z.number().positive().optional(),
  buyNowPrice: z.number().positive().optional(),
  minBidIncrement: z.number().positive().optional(),
  autoExtendable: z.boolean().optional(),
  auctionExtensionMinutes: z.number().int().positive().optional(),
  auctionShippingPaidBy: z.enum(["seller", "winner"]).optional(),
  isPreOrder: z.boolean().optional(),
  preOrderDeliveryDate: dateStringSchema.optional(),
  preOrderDepositPercent: z.number().min(0).max(100).optional(),
  preOrderDepositAmount: z.number().nonnegative().optional(),
  preOrderMaxQuantity: z.number().int().nonnegative().optional(),
  preOrderProductionStatus: z
    .enum(["upcoming", "in_production", "ready_to_ship"])
    .optional(),
  preOrderCancellable: z.boolean().optional(),
});

export const productCreateSchema = productBaseSchema
  .refine(
    (data) => !data.isAuction || (data.auctionEndDate && data.startingBid),
    { message: "Auction items must have end date and starting bid" },
  )
  .refine(
    (data) =>
      !data.auctionEndDate || new Date(data.auctionEndDate as string) > new Date(),
    { message: "Auction end date must be in the future" },
  );

export const productUpdateSchema = productBaseSchema.partial().extend({
  status: z
    .enum(["draft", "published", "out_of_stock", "discontinued", "sold"])
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

export const siteSettingsUpdateSchema = z
  .object({
    siteName: z.string().min(1).max(100).optional(),
    siteDescription: z.string().min(1).max(500).optional(),
    contactEmail: z.string().email().optional(),
    supportEmail: z.string().email().optional(),
    maintenanceMode: z.boolean().optional(),
    maintenanceMessage: z.string().max(500).optional(),
    announcementBar: z
      .object({
        enabled: z.boolean(),
        message: z.string().min(1).max(500),
      })
      .optional(),
    emailSettings: z
      .object({
        fromName: z.string().min(1).max(100),
        fromEmail: z.string().email(),
        replyTo: z.string().email(),
      })
      .optional(),
    socialLinks: z
      .object({
        facebook: z.string().url().optional().or(z.literal("")),
        twitter: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
      })
      .optional(),
    features: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          name: z.string().min(1).max(100),
          description: z.string().max(500).default(""),
          icon: z.string().max(100).default(""),
          enabled: z.boolean(),
        }),
      )
      .max(50)
      .optional(),
    payment: z
      .object({
        razorpayEnabled: z.boolean(),
        upiManualEnabled: z.boolean(),
        codEnabled: z.boolean(),
      })
      .optional(),
    featureFlags: z
      .object({
        chats: z.boolean(),
        smsVerification: z.boolean(),
        translations: z.boolean(),
        wishlists: z.boolean(),
        auctions: z.boolean(),
        reviews: z.boolean(),
        events: z.boolean(),
        blog: z.boolean(),
        coupons: z.boolean(),
        notifications: z.boolean(),
        sellerRegistration: z.boolean(),
        preOrders: z.boolean(),
      })
      .optional(),
    commissions: z
      .object({
        razorpayFeePercent: z.number().min(0).max(100),
        codDepositPercent: z.number().min(0).max(100),
        sellerShippingFixed: z.number().min(0),
        platformShippingPercent: z.number().min(0).max(100),
        platformShippingFixedMin: z.number().min(0),
      })
      .optional(),
    credentials: z
      .object({
        razorpayKeyId: z.string().max(512).optional(),
        razorpayKeySecret: z.string().max(512).optional(),
        razorpayWebhookSecret: z.string().max(512).optional(),
        resendApiKey: z.string().max(512).optional(),
        whatsappApiKey: z.string().max(512).optional(),
      })
      .optional(),
  })
  .partial();
