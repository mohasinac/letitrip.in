/**
 * @fileoverview TypeScript Module
 * @module src/lib/validation/product
 * @description This file contains functionality related to product
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Product Validation Schemas
 *
 * Zod schemas for validating product data
 * Used in product creation, update, and API routes
 */

import { z } from "zod";

/**
 * Slug validation regex
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Product Condition enum
 */
export const ProductCondition = z.enum(["new", "used", "refurbished"]);

/**
 * Product Status enum
 */
export const ProductStatus = z.enum([
  "draft",
  "published",
  "archived",
  "out-of-stock",
]);

/**
 * Product Specification Schema
 */
export const productSpecificationSchema = z.object({
  /** Name */
  name: z.string().min(1).max(100).trim(),
  /** Value */
  value: z.string().min(1).max(500).trim(),
});

/**
 * Product Variant Schema
 */
export const productVariantSchema = z.object({
  name: z.string().min(1).max(100).trim(), // e.g., "Size", "Color"
  value: z.string().min(1).max(100).trim(), // e.g., "Large", "Red"
  priceAdjustment: z.number().default(0).optional(), // Additional price for this variant
  /** Stock Count */
  stockCount: z.number().int().min(0).optional(),
  /** Sku */
  sku: z.string().optional(),
});

/**
 * Product Dimensions Schema
 */
export const productDimensionsSchema = z.object({
  /** Length */
  length: z.number().positive(),
  /** Width */
  width: z.number().positive(),
  /** Height */
  height: z.number().positive(),
  /** Unit */
  unit: z.enum(["cm", "inch"]).default("cm"),
  /** Weight */
  weight: z.number().positive(),
  /** Weight Unit */
  weightUnit: z.enum(["kg", "g", "lb"]).default("kg"),
});

/**
 * Create Product Schema
 */
export const createProductSchema = z.object({
  // Basic Information
  /** Name */
  name: z
    .string()
    .min(10, "Product name must be at least 10 characters")
    .max(200, "Product name must not exceed 200 characters")
    .trim(),

  /** Slug */
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(200, "Slug must not exceed 200 characters")
    .regex(
      slugRegex,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .trim(),

  /** Description */
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must not exceed 5000 characters")
    .trim(),

  /** Short Description */
  shortDescription: z
    .string()
    .max(200, "Short description must not exceed 200 characters")
    .trim()
    .optional(),

  // Shop Reference
  /** Shop Id */
  shopId: z.string().min(1, "Shop ID is required"),

  // Category (must be leaf category)
  /** Category Id */
  categoryId: z.string().min(1, "Category is required"),

  // Pricing
  /** Price */
  price: z
    .number()
    .positive("Price must be positive")
    .min(1, "Price must be at least ₹1")
    .max(10000000, "Price must not exceed ₹1 Crore"),

  /** Original Price */
  originalPrice: z
    .number()
    .positive("Original price must be positive")
    .optional()
    .nullable(),

  costPrice: z.number().positive("Cost price must be positive").optional(), // For profit calculation

  // Inventory
  /** Stock Count */
  stockCount: z
    .number()
    .int("Stock count must be an integer")
    .min(0, "Stock count cannot be negative")
    .default(0),

  /** Low Stock Threshold */
  lowStockThreshold: z.number().int().min(0).default(5).optional(),

  /** Sku */
  sku: z.string().max(50, "SKU must not exceed 50 characters").optional(),

  // Product Details
  /** Condition */
  condition: ProductCondition.default("new"),

  /** Brand */
  brand: z
    .string()
    .max(100, "Brand must not exceed 100 characters")
    .trim()
    .optional(),

  /** Manufacturer */
  manufacturer: z
    .string()
    .max(100, "Manufacturer must not exceed 100 characters")
    .trim()
    .optional(),

  /** Country Of Origin */
  countryOfOrigin: z.string().default("Japan").optional(),

  // Media
  /** Images */
  images: z
    .array(z.string().url())
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),

  /** Videos */
  videos: z
    .array(z.string().url())
    .max(3, "Maximum 3 videos allowed")
    .optional(),

  // Specifications
  /** Specifications */
  specifications: z.array(productSpecificationSchema).optional(),

  // Variants
  /** Variants */
  variants: z.array(productVariantSchema).optional(),

  // Dimensions & Shipping
  /** Dimensions */
  dimensions: productDimensionsSchema.optional(),

  /** Shipping Class */
  shippingClass: z
    .enum(["standard", "express", "heavy", "fragile"])
    .default("standard")
    .optional(),

  // Tags
  /** Tags */
  tags: z
    .array(z.string().max(50))
    .max(20, "Maximum 20 tags allowed")
    .optional(),

  // Policies
  /** Is Returnable */
  isReturnable: z.boolean().default(true),

  /** Return Window Days */
  returnWindowDays: z.number().int().min(0).max(30).default(7).optional(),

  /** Warranty */
  warranty: z.string().max(500).optional(),

  // SEO
  /** Meta Title */
  metaTitle: z
    .string()
    .max(60, "Meta title must not exceed 60 characters")
    .optional(),

  /** Meta Description */
  metaDescription: z
    .string()
    .max(160, "Meta description must not exceed 160 characters")
    .optional(),

  // Scheduling
  /** Publish Date */
  publishDate: z.coerce.date().optional(),

  // Status
  /** Status */
  status: ProductStatus.default("draft"),

  // Flags (admin only)
  /** Featured */
  featured: z.boolean().default(false).optional(),
});

/**
 * Update Product Schema (all fields optional)
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Product Query Filter Schema
 */
export const productQuerySchema = z.object({
  // Pagination
  /** Page */
  page: z.coerce.number().int().min(1).default(1).optional(),
  /** Limit */
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),

  // Sorting
  /** Sort By */
  sortBy: z
    .enum(["name", "price", "createdAt", "rating", "sales"])
    .default("createdAt")
    .optional(),
  /** Sort Order */
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Filters
  /** Shop Id */
  shopId: z.string().optional(),
  /** Category Id */
  categoryId: z.string().optional(),
  /** Condition */
  condition: ProductCondition.optional(),
  /** Status */
  status: ProductStatus.optional(),

  /** In Stock */
  inStock: z.coerce.boolean().optional(),
  /** Featured */
  featured: z.coerce.boolean().optional(),

  // Price range
  /** Min Price */
  minPrice: z.coerce.number().positive().optional(),
  /** Max Price */
  maxPrice: z.coerce.number().positive().optional(),

  // Brand/Manufacturer
  /** Brand */
  brand: z.string().optional(),
  /** Manufacturer */
  manufacturer: z.string().optional(),

  // Tags
  /** Tags */
  tags: z.array(z.string()).optional(),

  // Search
  /** Search */
  search: z.string().optional(),
});

/**
 * Bulk Update Status Schema
 */
export const bulkUpdateStatusSchema = z.object({
  /** Product Ids */
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),
  /** Status */
  status: ProductStatus,
});

/**
 * Bulk Update Price Schema
 */
export const bulkUpdatePriceSchema = z.object({
  /** Product Ids */
  productIds: z.array(z.string()).min(1),
  priceAdjustment: z.number(), // Can be positive or negative
  /** Adjustment Type */
  adjustmentType: z.enum(["fixed", "percentage"]),
});

/**
 * Product Feature Schema (admin only)
 */
export const featureProductSchema = z.object({
  /** Featured */
  featured: z.boolean(),
  /** Featured Priority */
  featuredPriority: z.number().int().min(0).max(100).optional(),
});

/**
 * Stock Update Schema
 */
export const updateStockSchema = z.object({
  /** Stock Count */
  stockCount: z.number().int().min(0),
  /** Reason */
  reason: z.string().max(200).optional(),
});

/**
 * Type exports
 */
/**
 * CreateProductInput type definition
 *
 * @typedef {z.infer<typeof createProductSchema>} CreateProductInput
 * @description Type definition for CreateProductInput
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
/**
 * UpdateProductInput type
 * 
 * @typedef {Object} UpdateProductInput
 * @description Type definition for UpdateProductInput
 */
/**
 * UpdateProductInput type definition
 *
 * @typedef {z.infer<typeof updateProductSchema>} UpdateProductInput
 * @description Type definition for UpdateProductInput
 */
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
/**
 * ProductQuery type
 * 
 * @typedef {Object} ProductQuery
 * @description Type definition for ProductQuery
 */
/**
 * ProductQuery type definition
 *
 * @typedef {z.infer<typeof productQuerySchema>} ProductQuery
 * @description Type definition for ProductQuery
 */
export type ProductQuery = z.infer<typeof productQuerySchema>;
/**
 * BulkUpdateStatusInput type
 * 
 * @typedef {Object} BulkUpdateStatusInput
 * @description Type definition for BulkUpdateStatusInput
 */
/**
 * BulkUpdateStatusInput type definition
 *
 * @typedef {z.infer<typeof bulkUpdateStatusSchema>} BulkUpdateStatusInput
 * @description Type definition for BulkUpdateStatusInput
 */
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;
/**
 * BulkUpdatePriceInput type
 * 
 * @typedef {Object} BulkUpdatePriceInput
 * @description Type definition for BulkUpdatePriceInput
 */
/**
 * BulkUpdatePriceInput type definition
 *
 * @typedef {z.infer<typeof bulkUpdatePriceSchema>} BulkUpdatePriceInput
 * @description Type definition for BulkUpdatePriceInput
 */
export type BulkUpdatePriceInput = z.infer<typeof bulkUpdatePriceSchema>;
/**
 * FeatureProductInput type
 * 
 * @typedef {Object} FeatureProductInput
 * @description Type definition for FeatureProductInput
 */
/**
 * FeatureProductInput type definition
 *
 * @typedef {z.infer<typeof featureProductSchema>} FeatureProductInput
 * @description Type definition for FeatureProductInput
 */
export type FeatureProductInput = z.infer<typeof featureProductSchema>;
/**
 * UpdateStockInput type
 * 
 * @typedef {Object} UpdateStockInput
 * @description Type definition for UpdateStockInput
 */
/**
 * UpdateStockInput type definition
 *
 * @typedef {z.infer<typeof updateStockSchema>} UpdateStockInput
 * @description Type definition for UpdateStockInput
 */
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
/**
 * ProductSpecification type
 * 
 * @typedef {Object} ProductSpecification
 * @description Type definition for ProductSpecification
 */
/**
 * ProductSpecification type definition
 *
 * @typedef {z.infer<typeof productSpecificationSchema>} ProductSpecification
 * @description Type definition for ProductSpecification
 */
export type ProductSpecification = z.infer<typeof productSpecificationSchema>;
/**
 * ProductVariant type
 * 
 * @typedef {Object} ProductVariant
 * @description Type definition for ProductVariant
 */
/**
 * ProductVariant type definition
 *
 * @typedef {z.infer<typeof productVariantSchema>} ProductVariant
 * @description Type definition for ProductVariant
 */
export type ProductVariant = z.infer<typeof productVariantSchema>;
/**
 * ProductDimensions type
 * 
 * @typedef {Object} ProductDimensions
 * @description Type definition for ProductDimensions
 */
/**
 * ProductDimensions type definition
 *
 * @typedef {z.infer<typeof productDimensionsSchema>} ProductDimensions
 * @description Type definition for ProductDimensions
 */
export type ProductDimensions = z.infer<typeof productDimensionsSchema>;
