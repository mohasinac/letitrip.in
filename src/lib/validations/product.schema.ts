/**
 * @fileoverview TypeScript Module
 * @module src/lib/validations/product.schema
 * @description This file contains functionality related to product.schema
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Product creation/edit validation schema
export const productSchema = z.object({
  // Step 1: Basic Info
  /** Name */
  name: z
    .string()
    .min(
      VALIDATION_RULES.PRODUCT.NAME.MIN_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.NAME_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.PRODUCT.NAME.MAX_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.NAME_TOO_LONG,
    ),
  /** Slug */
  slug: z
    .string()
    .min(VALIDATION_RULES.SLUG.MIN_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_SHORT)
    .max(VALIDATION_RULES.SLUG.MAX_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_LONG)
    .regex(VALIDATION_RULES.SLUG.PATTERN, VALIDATION_MESSAGES.SLUG.INVALID),
  /** Category Id */
  categoryId: z.string().min(1, VALIDATION_MESSAGES.PRODUCT.NO_CATEGORY),
  /** Brand */
  brand: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Brand")),
  /** Sku */
  sku: z
    .string()
    .min(
      VALIDATION_RULES.PRODUCT.SKU.MIN_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.SKU_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.PRODUCT.SKU.MAX_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.SKU_TOO_LONG,
    )
    .optional(),

  // Step 2: Pricing & Stock
  /** Price */
  price: z
    .number()
    .min(
      VALIDATION_RULES.PRODUCT.PRICE.MIN,
      VALIDATION_MESSAGES.PRODUCT.PRICE_TOO_LOW,
    )
    .max(
      VALIDATION_RULES.PRODUCT.PRICE.MAX,
      VALIDATION_MESSAGES.PRODUCT.PRICE_TOO_HIGH,
    ),
  /** Compare At Price */
  compareAtPrice: z
    .number()
    .min(
      VALIDATION_RULES.PRODUCT.PRICE.MIN,
      VALIDATION_MESSAGES.PRODUCT.PRICE_TOO_LOW,
    )
    .optional(),
  /** Stock Count */
  stockCount: z
    .number()
    .int(VALIDATION_MESSAGES.NUMBER.NOT_INTEGER)
    .min(
      VALIDATION_RULES.PRODUCT.STOCK.MIN,
      VALIDATION_MESSAGES.PRODUCT.STOCK_NEGATIVE,
    ),
  /** Low Stock Threshold */
  lowStockThreshold: z
    .number()
    .int(VALIDATION_MESSAGES.NUMBER.NOT_INTEGER)
    .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
    .default(10),
  /** Weight */
  weight: z
    .number()
    .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
    .max(10000, "Weight is too high (max 10000kg)"),

  // Step 3: Product Details
  /** Description */
  description: z
    .string()
    .min(
      VALIDATION_RULES.PRODUCT.DESCRIPTION.MIN_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.DESC_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.PRODUCT.DESCRIPTION.MAX_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.DESC_TOO_LONG,
    ),
  /** Condition */
  condition: z.enum(["new", "like-new", "good", "fair"], {
    /** Message */
    message: "Please select a valid condition",
  }),
  /** Features */
  features: z.array(z.string()).optional(),
  /** Specifications */
  specifications: z.record(z.string(), z.string()).optional(),

  // Step 4: Media
  /** Images */
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(
      VALIDATION_RULES.PRODUCT.IMAGES.MIN,
      VALIDATION_MESSAGES.PRODUCT.NO_IMAGES,
    )
    .max(
      VALIDATION_RULES.PRODUCT.IMAGES.MAX,
      VALIDATION_MESSAGES.PRODUCT.TOO_MANY_IMAGES,
    ),
  /** Videos */
  videos: z
    .array(z.string().url("Invalid video URL"))
    .max(
      VALIDATION_RULES.PRODUCT.VIDEOS.MAX,
      VALIDATION_MESSAGES.PRODUCT.TOO_MANY_VIDEOS,
    )
    .optional(),

  // Step 5: Shipping & Policies
  /** Shipping Class */
  shippingClass: z.enum(["standard", "express", "overnight", "free"], {
    /** Message */
    message: "Please select a valid shipping class",
  }),
  /** Return Policy */
  returnPolicy: z.string().optional(),
  /** Warranty Info */
  warrantyInfo: z.string().optional(),

  // Step 6: SEO & Publish
  /** Meta Title */
  metaTitle: z
    .string()
    .max(60, "Meta title should be less than 60 characters")
    .optional(),
  /** Meta Description */
  metaDescription: z
    .string()
    .max(160, "Meta description should be less than 160 characters")
    .optional(),
  /** Featured */
  featured: z.boolean().default(false),
  /** Status */
  status: z.enum(["draft", "published", "archived"], {
    /** Message */
    message: "Please select a valid status",
  }),

  // System fields
  /** Shop Id */
  shopId: z.string().min(1, VALIDATION_MESSAGES.PRODUCT.NO_SHOP),
});

// Type inference from schema
/**
 * ProductFormData type
 * 
 * @typedef {Object} ProductFormData
 * @description Type definition for ProductFormData
 */
/**
 * ProductFormData type definition
 *
 * @typedef {z.infer<typeof productSchema>} ProductFormData
 * @description Type definition for ProductFormData
 */
export type ProductFormData = z.infer<typeof productSchema>;

// Partial schema for updates
export const productUpdateSchema = productSchema.partial();

// Step-specific schemas for wizard validation
export const productStep1Schema = productSchema.pick({
  /** Name */
  name: true,
  /** Slug */
  slug: true,
  /** Category Id */
  categoryId: true,
  /** Brand */
  brand: true,
  /** Sku */
  sku: true,
});

export const productStep2Schema = productSchema.pick({
  /** Price */
  price: true,
  /** Compare At Price */
  compareAtPrice: true,
  /** Stock Count */
  stockCount: true,
  /** Low Stock Threshold */
  lowStockThreshold: true,
  /** Weight */
  weight: true,
});

export const productStep3Schema = productSchema.pick({
  /** Description */
  description: true,
  /** Condition */
  condition: true,
  /** Features */
  features: true,
  /** Specifications */
  specifications: true,
});

export const productStep4Schema = productSchema.pick({
  /** Images */
  images: true,
  /** Videos */
  videos: true,
});

export const productStep5Schema = productSchema.pick({
  /** Shipping Class */
  shippingClass: true,
  /** Return Policy */
  returnPolicy: true,
  /** Warranty Info */
  warrantyInfo: true,
});

export const productStep6Schema = productSchema.pick({
  /** Meta Title */
  metaTitle: true,
  /** Meta Description */
  metaDescription: true,
  /** Featured */
  featured: true,
  /** Status */
  status: true,
});
