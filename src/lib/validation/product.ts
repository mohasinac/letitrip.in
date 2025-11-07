/**
 * Product Validation Schemas
 * 
 * Zod schemas for validating product data
 * Used in product creation, update, and API routes
 */

import { z } from 'zod';

/**
 * Slug validation regex
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Product Condition enum
 */
export const ProductCondition = z.enum(['new', 'used', 'refurbished']);

/**
 * Product Status enum
 */
export const ProductStatus = z.enum(['draft', 'published', 'archived', 'out-of-stock']);

/**
 * Product Specification Schema
 */
export const productSpecificationSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  value: z.string().min(1).max(500).trim(),
});

/**
 * Product Variant Schema
 */
export const productVariantSchema = z.object({
  name: z.string().min(1).max(100).trim(), // e.g., "Size", "Color"
  value: z.string().min(1).max(100).trim(), // e.g., "Large", "Red"
  priceAdjustment: z.number().default(0).optional(), // Additional price for this variant
  stockCount: z.number().int().min(0).optional(),
  sku: z.string().optional(),
});

/**
 * Product Dimensions Schema
 */
export const productDimensionsSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['cm', 'inch']).default('cm'),
  weight: z.number().positive(),
  weightUnit: z.enum(['kg', 'g', 'lb']).default('kg'),
});

/**
 * Create Product Schema
 */
export const createProductSchema = z.object({
  // Basic Information
  name: z.string()
    .min(10, 'Product name must be at least 10 characters')
    .max(200, 'Product name must not exceed 200 characters')
    .trim(),
  
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must not exceed 200 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must not exceed 5000 characters')
    .trim(),
  
  shortDescription: z.string()
    .max(200, 'Short description must not exceed 200 characters')
    .trim()
    .optional(),
  
  // Shop Reference
  shopId: z.string().min(1, 'Shop ID is required'),
  
  // Category (must be leaf category)
  categoryId: z.string().min(1, 'Category is required'),
  
  // Pricing
  price: z.number()
    .positive('Price must be positive')
    .min(1, 'Price must be at least ₹1')
    .max(10000000, 'Price must not exceed ₹1 Crore'),
  
  originalPrice: z.number()
    .positive('Original price must be positive')
    .optional()
    .nullable(),
  
  costPrice: z.number()
    .positive('Cost price must be positive')
    .optional(), // For profit calculation
  
  // Inventory
  stockCount: z.number()
    .int('Stock count must be an integer')
    .min(0, 'Stock count cannot be negative')
    .default(0),
  
  lowStockThreshold: z.number()
    .int()
    .min(0)
    .default(5)
    .optional(),
  
  sku: z.string()
    .max(50, 'SKU must not exceed 50 characters')
    .optional(),
  
  // Product Details
  condition: ProductCondition.default('new'),
  
  brand: z.string()
    .max(100, 'Brand must not exceed 100 characters')
    .trim()
    .optional(),
  
  manufacturer: z.string()
    .max(100, 'Manufacturer must not exceed 100 characters')
    .trim()
    .optional(),
  
  countryOfOrigin: z.string()
    .default('Japan')
    .optional(),
  
  // Media
  images: z.array(z.string().url())
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  
  videos: z.array(z.string().url())
    .max(3, 'Maximum 3 videos allowed')
    .optional(),
  
  // Specifications
  specifications: z.array(productSpecificationSchema)
    .optional(),
  
  // Variants
  variants: z.array(productVariantSchema)
    .optional(),
  
  // Dimensions & Shipping
  dimensions: productDimensionsSchema.optional(),
  
  shippingClass: z.enum(['standard', 'express', 'heavy', 'fragile'])
    .default('standard')
    .optional(),
  
  // Tags
  tags: z.array(z.string().max(50))
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  
  // Policies
  isReturnable: z.boolean().default(true),
  
  returnWindowDays: z.number()
    .int()
    .min(0)
    .max(30)
    .default(7)
    .optional(),
  
  warranty: z.string()
    .max(500)
    .optional(),
  
  // SEO
  metaTitle: z.string()
    .max(60, 'Meta title must not exceed 60 characters')
    .optional(),
  
  metaDescription: z.string()
    .max(160, 'Meta description must not exceed 160 characters')
    .optional(),
  
  // Scheduling
  publishDate: z.coerce.date().optional(),
  
  // Status
  status: ProductStatus.default('draft'),
  
  // Flags (admin only)
  isFeatured: z.boolean().default(false).optional(),
  showOnHomepage: z.boolean().default(false).optional(),
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
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  
  // Sorting
  sortBy: z.enum(['name', 'price', 'createdAt', 'rating', 'sales']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  
  // Filters
  shopId: z.string().optional(),
  categoryId: z.string().optional(),
  condition: ProductCondition.optional(),
  status: ProductStatus.optional(),
  
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  showOnHomepage: z.coerce.boolean().optional(),
  
  // Price range
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  
  // Brand/Manufacturer
  brand: z.string().optional(),
  manufacturer: z.string().optional(),
  
  // Tags
  tags: z.array(z.string()).optional(),
  
  // Search
  search: z.string().optional(),
});

/**
 * Bulk Update Status Schema
 */
export const bulkUpdateStatusSchema = z.object({
  productIds: z.array(z.string()).min(1, 'At least one product ID is required'),
  status: ProductStatus,
});

/**
 * Bulk Update Price Schema
 */
export const bulkUpdatePriceSchema = z.object({
  productIds: z.array(z.string()).min(1),
  priceAdjustment: z.number(), // Can be positive or negative
  adjustmentType: z.enum(['fixed', 'percentage']),
});

/**
 * Product Feature Schema (admin only)
 */
export const featureProductSchema = z.object({
  isFeatured: z.boolean(),
  showOnHomepage: z.boolean().optional(),
  featuredPriority: z.number().int().min(0).max(100).optional(),
});

/**
 * Stock Update Schema
 */
export const updateStockSchema = z.object({
  stockCount: z.number().int().min(0),
  reason: z.string().max(200).optional(),
});

/**
 * Type exports
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;
export type BulkUpdatePriceInput = z.infer<typeof bulkUpdatePriceSchema>;
export type FeatureProductInput = z.infer<typeof featureProductSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type ProductSpecification = z.infer<typeof productSpecificationSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductDimensions = z.infer<typeof productDimensionsSchema>;
