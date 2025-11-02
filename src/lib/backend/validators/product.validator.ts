/**
 * Product Validation Schemas
 * Zod schemas for validating product data
 */

import { z } from 'zod';

/**
 * Product image schema
 */
export const productImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().optional().default(''),
  order: z.number().int().min(0).default(0),
});

/**
 * Product video schema
 */
export const productVideoSchema = z.object({
  url: z.string().url('Invalid video URL'),
  title: z.string().optional(),
  thumbnail: z.string().url().optional(),
  duration: z.number().positive().optional(),
  order: z.number().int().min(0).default(0),
});

/**
 * Product dimensions schema
 */
export const productDimensionsSchema = z.object({
  length: z.number().positive('Length must be positive'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  unit: z.enum(['cm', 'in']).default('cm'),
});

/**
 * Product SEO schema
 */
export const productSEOSchema = z.object({
  title: z.string().max(60, 'SEO title too long').optional(),
  description: z.string().max(160, 'SEO description too long').optional(),
  keywords: z.array(z.string()).optional(),
});

/**
 * Create product schema (full validation)
 */
export const createProductSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must not exceed 200 characters'),
  
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must not exceed 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long'),
  
  shortDescription: z.string()
    .max(500, 'Short description too long')
    .optional(),
  
  price: z.number()
    .positive('Price must be positive')
    .finite('Price must be a finite number'),
  
  compareAtPrice: z.number()
    .positive()
    .finite()
    .optional(),
  
  cost: z.number()
    .positive()
    .finite()
    .optional(),
  
  sku: z.string()
    .min(1, 'SKU is required')
    .max(100, 'SKU too long'),
  
  barcode: z.string()
    .max(100)
    .optional(),
  
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
  
  lowStockThreshold: z.number()
    .int()
    .min(0)
    .default(10),
  
  weight: z.number()
    .positive('Weight must be positive'),
  
  weightUnit: z.enum(['kg', 'g', 'lb', 'oz']).default('kg'),
  
  dimensions: productDimensionsSchema.optional(),
  
  images: z.array(productImageSchema)
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  
  videos: z.array(productVideoSchema)
    .max(5, 'Maximum 5 videos allowed')
    .optional(),
  
  category: z.string()
    .min(1, 'Category is required'),
  
  categorySlug: z.string().optional(),
  
  tags: z.array(z.string())
    .max(20, 'Maximum 20 tags allowed')
    .default([]),
  
  status: z.enum(['active', 'draft', 'archived'])
    .default('draft'),
  
  isFeatured: z.boolean().default(false),
  
  condition: z.enum(['new', 'used-mint', 'used-good', 'used-fair', 'damaged'])
    .default('new'),
  
  returnable: z.boolean().default(true),
  
  returnPeriod: z.number()
    .int()
    .positive()
    .optional(),
  
  features: z.array(z.string())
    .optional(),
  
  specifications: z.record(z.string())
    .optional(),
  
  seo: productSEOSchema.optional(),
  
  sellerId: z.string()
    .min(1, 'Seller ID is required'),
});

/**
 * Update product schema (all fields optional)
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Product filters schema
 */
export const productFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  sellerId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sort: z.enum([
    'price-asc',
    'price-desc',
    'newest',
    'oldest',
    'popular',
    'name-asc',
    'name-desc',
  ]).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Product ID schema
 */
export const productIdSchema = z.string().min(1, 'Product ID is required');

/**
 * Product slug schema
 */
export const productSlugSchema = z.string()
  .regex(/^[a-z0-9-]+$/, 'Invalid product slug')
  .min(1, 'Product slug is required');

/**
 * Bulk delete schema
 */
export const bulkDeleteProductsSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one product ID required'),
});

/**
 * Bulk update status schema
 */
export const bulkUpdateProductStatusSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one product ID required'),
  status: z.enum(['active', 'draft', 'archived']),
});

/**
 * Validate product data
 */
export function validateProduct(data: unknown) {
  return createProductSchema.parse(data);
}

/**
 * Validate product update
 */
export function validateProductUpdate(data: unknown) {
  return updateProductSchema.parse(data);
}

/**
 * Validate product filters
 */
export function validateProductFilters(data: unknown) {
  return productFiltersSchema.parse(data);
}
