/**
 * Category Validation Schemas
 * 
 * Zod schemas for validating category-related data
 */

import { z } from 'zod';

// ============================================================================
// Sub-schemas
// ============================================================================

const categoryFlagsSchema = z.object({
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  showInMenu: z.boolean().optional(),
  allowProducts: z.boolean().optional(),
});

const categorySEOSchema = z.object({
  metaTitle: z.string().max(60, 'Meta title must be less than 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description must be less than 160 characters').optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional(),
});

// ============================================================================
// Main Schemas
// ============================================================================

/**
 * Schema for creating a new category
 */
export const createCategorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be less than 100 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  // Hierarchy
  parentId: z.string().nullable().optional(),
  level: z.number().int().min(0).max(5).optional(),
  
  // Media
  image: z.string().url().optional(),
  icon: z.string().optional(),
  banner: z.string().url().optional(),
  
  // Display
  displayOrder: z.number().int().min(0).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  
  // Flags
  flags: categoryFlagsSchema.optional(),
  
  // SEO
  seo: categorySEOSchema.optional(),
  
  // Additional metadata
  attributes: z.record(z.any()).optional(),
});

/**
 * Schema for updating a category
 */
export const updateCategorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be less than 100 characters')
    .optional(),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  // Hierarchy
  parentId: z.string().nullable().optional(),
  
  // Media
  image: z.string().url().optional(),
  icon: z.string().optional(),
  banner: z.string().url().optional(),
  
  // Display
  displayOrder: z.number().int().min(0).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  
  // Flags
  flags: categoryFlagsSchema.optional(),
  
  // SEO
  seo: categorySEOSchema.optional(),
  
  // Additional metadata
  attributes: z.record(z.any()).optional(),
});

/**
 * Schema for category filters
 */
export const categoryFiltersSchema = z.object({
  parentId: z.string().nullable().optional(),
  level: z.number().int().min(0).max(5).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  showInMenu: z.boolean().optional(),
  search: z.string().optional(),
  
  // Pagination
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.enum(['name', 'displayOrder', 'createdAt', 'productCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  
  // Special formats
  format: z.enum(['list', 'tree']).optional(),
});

/**
 * Schema for batch update categories
 */
export const batchUpdateCategoriesSchema = z.object({
  categoryIds: z.array(z.string()).min(1, 'At least one category ID is required'),
  updates: z.object({
    flags: categoryFlagsSchema.optional(),
    displayOrder: z.number().int().min(0).optional(),
    parentId: z.string().nullable().optional(),
  }),
});

/**
 * Schema for reordering categories
 */
export const reorderCategoriesSchema = z.object({
  orders: z.array(z.object({
    id: z.string(),
    displayOrder: z.number().int().min(0),
  })).min(1, 'At least one category order is required'),
});

/**
 * Schema for moving category to different parent
 */
export const moveCategorySchema = z.object({
  newParentId: z.string().nullable(),
  position: z.number().int().min(0).optional(), // Display order in new parent
});

// ============================================================================
// Type Exports
// ============================================================================

export type CategoryFlags = z.infer<typeof categoryFlagsSchema>;
export type CategorySEO = z.infer<typeof categorySEOSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryFilters = z.infer<typeof categoryFiltersSchema>;
export type BatchUpdateCategoriesInput = z.infer<typeof batchUpdateCategoriesSchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type MoveCategoryInput = z.infer<typeof moveCategorySchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate category creation data
 */
export function validateCreateCategory(data: unknown) {
  return createCategorySchema.parse(data);
}

/**
 * Validate category update data
 */
export function validateUpdateCategory(data: unknown) {
  return updateCategorySchema.parse(data);
}

/**
 * Validate category filters
 */
export function validateCategoryFilters(data: unknown) {
  return categoryFiltersSchema.parse(data);
}

/**
 * Validate batch category update
 */
export function validateBatchUpdateCategories(data: unknown) {
  return batchUpdateCategoriesSchema.parse(data);
}

/**
 * Validate category reorder
 */
export function validateReorderCategories(data: unknown) {
  return reorderCategoriesSchema.parse(data);
}

/**
 * Validate category move
 */
export function validateMoveCategory(data: unknown) {
  return moveCategorySchema.parse(data);
}
