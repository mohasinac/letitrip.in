/**
 * @fileoverview TypeScript Module
 * @module src/lib/validation/shop
 * @description This file contains functionality related to shop
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Shop Validation Schemas
 *
 * Zod schemas for validating shop data
 * Used in shop creation, update, and API routes
 */

import { z } from "zod";

/**
 * Slug validation regex
 * Lowercase letters, numbers, and hyphens only
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * URL validation regex (optional http/https)
 */
const urlRegex =
  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Phone number validation regex (Indian format)
 */
const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

/**
 * Create Shop Schema
 */
export const createShopSchema = z.object({
  /** Name */
  name: z
    .string()
    .min(3, "Shop name must be at least 3 characters")
    .max(100, "Shop name must not exceed 100 characters")
    .trim(),

  /** Slug */
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      slugRegex,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .trim(),

  /** Description */
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .trim()
    .optional(),

  /** Logo */
  logo: z.string().url("Logo must be a valid URL").optional().nullable(),

  /** Banner */
  banner: z.string().url("Banner must be a valid URL").optional().nullable(),

  // Contact Information
  /** Email */
  email: z.string().email("Invalid email address").optional(),

  /** Phone */
  phone: z
    .string()
    .regex(
      phoneRegex,
      "Invalid phone number. Must be a valid Indian mobile number",
    )
    .optional(),

  // Address
  /** Address */
  address: z
    .object({
      /** Line1 */
      line1: z.string().min(5, "Address line 1 is required").trim(),
      /** Line2 */
      line2: z.string().optional(),
      /** City */
      city: z.string().min(2, "City is required").trim(),
      /** State */
      state: z.string().min(2, "State is required").trim(),
      /** Pincode */
      pincode: z
        .string()
        .length(6, "Pincode must be 6 digits")
        .regex(/^\d{6}$/, "Pincode must contain only digits"),
      /** Country */
      country: z.string().default("India"),
    })
    .optional(),

  // Location (for map display)
  /** Location */
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must not exceed 100 characters")
    .trim()
    .optional(),

  // Categories the shop deals in
  /** Categories */
  categories: z
    .array(z.string())
    .min(1, "At least one category is required")
    .optional(),

  // Social Links
  /** Website */
  website: z
    .string()
    .regex(urlRegex, "Invalid website URL")
    .optional()
    .nullable(),

  /** Facebook */
  facebook: z
    .string()
    .regex(urlRegex, "Invalid Facebook URL")
    .optional()
    .nullable(),

  /** Instagram */
  instagram: z
    .string()
    .regex(urlRegex, "Invalid Instagram URL")
    .optional()
    .nullable(),

  /** Twitter */
  twitter: z
    .string()
    .regex(urlRegex, "Invalid Twitter URL")
    .optional()
    .nullable(),

  // Business Information
  /** Gst */
  gst: z
    .string()
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
      "Invalid GST number",
    )
    .optional()
    .nullable(),

  /** Pan */
  pan: z
    .string()
    .regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, "Invalid PAN number")
    .optional()
    .nullable(),

  // Bank Details (for payouts)
  /** Bank Details */
  bankDetails: z
    .object({
      /** Account Holder Name */
      accountHolderName: z.string().min(2).trim(),
      /** Account Number */
      accountNumber: z.string().min(8).max(20).trim(),
      /** Ifsc Code */
      ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
      /** Bank Name */
      bankName: z.string().min(2).trim(),
      /** Branch Name */
      branchName: z.string().min(2).trim().optional(),
    })
    .optional(),

  // UPI ID (alternative payout method)
  /** Upi Id */
  upiId: z
    .string()
    .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID")
    .optional()
    .nullable(),

  // Policies
  /** Return Policy */
  returnPolicy: z
    .string()
    .max(1000, "Return policy must not exceed 1000 characters")
    .optional(),

  /** Shipping Policy */
  shippingPolicy: z
    .string()
    .max(1000, "Shipping policy must not exceed 1000 characters")
    .optional(),

  // Flags (admin only)
  /** Is Verified */
  isVerified: z.boolean().default(false).optional(),
  /** Featured */
  featured: z.boolean().default(false).optional(),
  /** Is Banned */
  isBanned: z.boolean().default(false).optional(),
});

/**
 * Update Shop Schema (all fields optional except slug)
 */
export const updateShopSchema = createShopSchema.partial().extend({
  /** Slug */
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      slugRegex,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .trim()
    .optional(),
});

/**
 * Shop Query Filter Schema
 */
export const shopQuerySchema = z.object({
  // Pagination
  /** Page */
  page: z.coerce.number().int().min(1).default(1).optional(),
  /** Limit */
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),

  // Sorting
  /** Sort By */
  sortBy: z
    .enum(["name", "createdAt", "rating", "productCount"])
    .default("createdAt")
    .optional(),
  /** Sort Order */
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Filters
  /** Is Verified */
  isVerified: z.coerce.boolean().optional(),
  /** Featured */
  featured: z.coerce.boolean().optional(),
  /** Is Banned */
  isBanned: z.coerce.boolean().optional(),

  /** Category */
  category: z.string().optional(),
  /** Location */
  location: z.string().optional(),

  // Search
  /** Search */
  search: z.string().optional(),

  // Owner filter (for sellers viewing their shops)
  /** Owner Id */
  ownerId: z.string().optional(),
});

/**
 * Shop Verification Schema (admin only)
 */
export const verifyShopSchema = z.object({
  /** Is Verified */
  isVerified: z.boolean(),
  /** Verification Notes */
  verificationNotes: z.string().max(500).optional(),
});

/**
 * Shop Ban Schema (admin only)
 */
export const banShopSchema = z.object({
  /** Is Banned */
  isBanned: z.boolean(),
  /** Ban Reason */
  banReason: z
    .string()
    .min(10, "Ban reason must be at least 10 characters")
    .optional(),
});

/**
 * Shop Feature Schema (admin only)
 */
export const featureShopSchema = z.object({
  /** Featured */
  featured: z.boolean(),
  /** Featured Priority */
  featuredPriority: z.number().int().min(0).max(100).optional(),
});

/**
 * Type exports
 */
/**
 * CreateShopInput type definition
 *
 * @typedef {z.infer<typeof createShopSchema>} CreateShopInput
 * @description Type definition for CreateShopInput
 */
export type CreateShopInput = z.infer<typeof createShopSchema>;
/**
 * UpdateShopInput type
 * 
 * @typedef {Object} UpdateShopInput
 * @description Type definition for UpdateShopInput
 */
/**
 * UpdateShopInput type definition
 *
 * @typedef {z.infer<typeof updateShopSchema>} UpdateShopInput
 * @description Type definition for UpdateShopInput
 */
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
/**
 * ShopQuery type
 * 
 * @typedef {Object} ShopQuery
 * @description Type definition for ShopQuery
 */
/**
 * ShopQuery type definition
 *
 * @typedef {z.infer<typeof shopQuerySchema>} ShopQuery
 * @description Type definition for ShopQuery
 */
export type ShopQuery = z.infer<typeof shopQuerySchema>;
/**
 * VerifyShopInput type
 * 
 * @typedef {Object} VerifyShopInput
 * @description Type definition for VerifyShopInput
 */
/**
 * VerifyShopInput type definition
 *
 * @typedef {z.infer<typeof verifyShopSchema>} VerifyShopInput
 * @description Type definition for VerifyShopInput
 */
export type VerifyShopInput = z.infer<typeof verifyShopSchema>;
/**
 * BanShopInput type
 * 
 * @typedef {Object} BanShopInput
 * @description Type definition for BanShopInput
 */
/**
 * BanShopInput type definition
 *
 * @typedef {z.infer<typeof banShopSchema>} BanShopInput
 * @description Type definition for BanShopInput
 */
export type BanShopInput = z.infer<typeof banShopSchema>;
/**
 * FeatureShopInput type
 * 
 * @typedef {Object} FeatureShopInput
 * @description Type definition for FeatureShopInput
 */
/**
 * FeatureShopInput type definition
 *
 * @typedef {z.infer<typeof featureShopSchema>} FeatureShopInput
 * @description Type definition for FeatureShopInput
 */
export type FeatureShopInput = z.infer<typeof featureShopSchema>;
