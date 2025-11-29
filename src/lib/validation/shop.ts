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
  name: z
    .string()
    .min(3, "Shop name must be at least 3 characters")
    .max(100, "Shop name must not exceed 100 characters")
    .trim(),

  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      slugRegex,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .trim(),

  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .trim()
    .optional(),

  logo: z.string().url("Logo must be a valid URL").optional().nullable(),

  banner: z.string().url("Banner must be a valid URL").optional().nullable(),

  // Contact Information
  email: z.string().email("Invalid email address").optional(),

  phone: z
    .string()
    .regex(
      phoneRegex,
      "Invalid phone number. Must be a valid Indian mobile number",
    )
    .optional(),

  // Address
  address: z
    .object({
      line1: z.string().min(5, "Address line 1 is required").trim(),
      line2: z.string().optional(),
      city: z.string().min(2, "City is required").trim(),
      state: z.string().min(2, "State is required").trim(),
      pincode: z
        .string()
        .length(6, "Pincode must be 6 digits")
        .regex(/^\d{6}$/, "Pincode must contain only digits"),
      country: z.string().default("India"),
    })
    .optional(),

  // Location (for map display)
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must not exceed 100 characters")
    .trim()
    .optional(),

  // Categories the shop deals in
  categories: z
    .array(z.string())
    .min(1, "At least one category is required")
    .optional(),

  // Social Links
  website: z
    .string()
    .regex(urlRegex, "Invalid website URL")
    .optional()
    .nullable(),

  facebook: z
    .string()
    .regex(urlRegex, "Invalid Facebook URL")
    .optional()
    .nullable(),

  instagram: z
    .string()
    .regex(urlRegex, "Invalid Instagram URL")
    .optional()
    .nullable(),

  twitter: z
    .string()
    .regex(urlRegex, "Invalid Twitter URL")
    .optional()
    .nullable(),

  // Business Information
  gst: z
    .string()
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
      "Invalid GST number",
    )
    .optional()
    .nullable(),

  pan: z
    .string()
    .regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, "Invalid PAN number")
    .optional()
    .nullable(),

  // Bank Details (for payouts)
  bankDetails: z
    .object({
      accountHolderName: z.string().min(2).trim(),
      accountNumber: z.string().min(8).max(20).trim(),
      ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
      bankName: z.string().min(2).trim(),
      branchName: z.string().min(2).trim().optional(),
    })
    .optional(),

  // UPI ID (alternative payout method)
  upiId: z
    .string()
    .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID")
    .optional()
    .nullable(),

  // Policies
  returnPolicy: z
    .string()
    .max(1000, "Return policy must not exceed 1000 characters")
    .optional(),

  shippingPolicy: z
    .string()
    .max(1000, "Shipping policy must not exceed 1000 characters")
    .optional(),

  // Flags (admin only)
  isVerified: z.boolean().default(false).optional(),
  featured: z.boolean().default(false).optional(),
  isBanned: z.boolean().default(false).optional(),
});

/**
 * Update Shop Schema (all fields optional except slug)
 */
export const updateShopSchema = createShopSchema.partial().extend({
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
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),

  // Sorting
  sortBy: z
    .enum(["name", "createdAt", "rating", "productCount"])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Filters
  isVerified: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  isBanned: z.coerce.boolean().optional(),

  category: z.string().optional(),
  location: z.string().optional(),

  // Search
  search: z.string().optional(),

  // Owner filter (for sellers viewing their shops)
  ownerId: z.string().optional(),
});

/**
 * Shop Verification Schema (admin only)
 */
export const verifyShopSchema = z.object({
  isVerified: z.boolean(),
  verificationNotes: z.string().max(500).optional(),
});

/**
 * Shop Ban Schema (admin only)
 */
export const banShopSchema = z.object({
  isBanned: z.boolean(),
  banReason: z
    .string()
    .min(10, "Ban reason must be at least 10 characters")
    .optional(),
});

/**
 * Shop Feature Schema (admin only)
 */
export const featureShopSchema = z.object({
  featured: z.boolean(),
  featuredPriority: z.number().int().min(0).max(100).optional(),
});

/**
 * Type exports
 */
export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type ShopQuery = z.infer<typeof shopQuerySchema>;
export type VerifyShopInput = z.infer<typeof verifyShopSchema>;
export type BanShopInput = z.infer<typeof banShopSchema>;
export type FeatureShopInput = z.infer<typeof featureShopSchema>;
