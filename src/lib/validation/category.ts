/**
 * @fileoverview TypeScript Module
 * @module src/lib/validation/category
 * @description This file contains functionality related to category
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Category Validation Schemas
 *
 * Zod schemas for validating category data
 * Used in category creation, update, and tree management
 */

import { z } from "zod";

/**
 * Slug validation regex
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Create Category Schema
 * Updated to support multi-parent hierarchy
 */
export const createCategorySchema = z.object({
  // Basic Information
  /** Name */
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .trim(),

  /** Slug */
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      slugRegex,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .trim(),

  /** Description */
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .trim()
    .optional(),

  // Multi-parent Hierarchy
  parentIds: z.array(z.string()).default([]).optional(), // Multiple parents support

  // Backward compatibility (deprecated)
  parentId: z.string().optional().nullable(), // null = root category

  // Display
  /** Icon */
  icon: z
    .string()
    .max(50, "Icon name must not exceed 50 characters")
    .optional(), // Lucide icon name

  /** Image */
  image: z.string().url("Image must be a valid URL").optional().nullable(),

  /** Color */
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional(), // For UI theming

  // Ordering
  /** Sort Order */
  sortOrder: z.number().int().min(0).default(0).optional(),

  // Flags
  /** Featured */
  featured: z.boolean().default(false).optional(),

  /** Is Active */
  isActive: z.boolean().default(true).optional(),

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

  // Commission (optional - for marketplace fee calculation)
  commissionRate: z.number().min(0).max(100).default(0).optional(), // Percentage
});

/**
 * Update Category Schema
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Move Category Schema (change parent)
 * Updated to support multi-parent hierarchy
 */
export const moveCategorySchema = z
  .object({
    newParentIds: z.array(z.string()).optional(), // Multiple parents support
    newParentId: z.string().optional().nullable(), // Backward compatibility
    /** Sort Order */
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return (
        data.newParentIds !== undefined ||
        data.newParentId !== undefined ||
        data.sortOrder !== undefined
      );
    },
    {
      /** Message */
      message:
        "Either newParentIds, newParentId, or sortOrder must be provided",
    },
  );

/**
 * Reorder Categories Schema (batch update sort orders)
 */
export const reorderCategoriesSchema = z.object({
  /** Parent Id */
  parentId: z.string().optional().nullable(),
  /** Category Orders */
  categoryOrders: z
    .array(
      z.object({
        /** Category Id */
        categoryId: z.string(),
        /** Sort Order */
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1),
});

/**
 * Category Query Filter Schema
 */
export const categoryQuerySchema = z.object({
  // Pagination
  /** Page */
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100).optional(), // Higher default for tree

  // Sorting
  /** Sort By */
  sortBy: z
    .enum(["name", "createdAt", "sortOrder", "productCount"])
    .default("sortOrder")
    .optional(),
  /** Sort Order */
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),

  // Filters
  parentId: z.string().optional().nullable(), // null = root categories only

  /** Featured */
  featured: z.coerce.boolean().optional(),
  /** Is Active */
  isActive: z.coerce.boolean().optional(),

  // Hierarchy filters
  rootOnly: z.coerce.boolean().optional(), // Only root categories
  leafOnly: z.coerce.boolean().optional(), // Only leaf categories (no children)
  level: z.coerce.number().int().min(0).optional(), // Specific level in tree

  // Search
  /** Search */
  search: z.string().optional(),

  // Include options
  /** Include Product Count */
  includeProductCount: z.coerce.boolean().default(false).optional(),
  /** Include Children */
  includeChildren: z.coerce.boolean().default(false).optional(),
  /** Include Ancestors */
  includeAncestors: z.coerce.boolean().default(false).optional(),
});

/**
 * Get Category Tree Schema
 */
export const getCategoryTreeSchema = z.object({
  /** Parent Id */
  parentId: z.string().optional().nullable(),
  /** Max Depth */
  maxDepth: z.coerce.number().int().min(1).max(10).default(5).optional(),
  /** Include Product Count */
  includeProductCount: z.coerce.boolean().default(false).optional(),
  /** Include Inactive */
  includeInactive: z.coerce.boolean().default(false).optional(),
  /** Only Featured */
  onlyFeatured: z.coerce.boolean().default(false).optional(),
});

/**
 * Validate Leaf Category Schema (for product assignment)
 */
export const validateLeafCategorySchema = z.object({
  /** Category Id */
  categoryId: z.string().min(1, "Category ID is required"),
});

/**
 * Bulk Update Categories Schema
 */
export const bulkUpdateCategoriesSchema = z.object({
  /** Category Ids */
  categoryIds: z.array(z.string()).min(1),
  /** Updates */
  updates: z.object({
    /** Featured */
    featured: z.boolean().optional(),
    /** Is Active */
    isActive: z.boolean().optional(),
  }),
});

/**
 * Category Path Schema (for breadcrumbs)
 */
export const getCategoryPathSchema = z.object({
  /** Category Id */
  categoryId: z.string().min(1),
  /** Include Root */
  includeRoot: z.coerce.boolean().default(false).optional(),
});

/**
 * Similar Categories Schema (for product recommendations)
 */
export const getSimilarCategoriesSchema = z.object({
  /** Category Id */
  categoryId: z.string().min(1),
  /** Limit */
  limit: z.coerce.number().int().min(1).max(20).default(5).optional(),
});

/**
 * Type exports
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
/**
 * UpdateCategoryInput type
 * 
 * @typedef {Object} UpdateCategoryInput
 * @description Type definition for UpdateCategoryInput
 */
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
/**
 * MoveCategoryInput type
 * 
 * @typedef {Object} MoveCategoryInput
 * @description Type definition for MoveCategoryInput
 */
export type MoveCategoryInput = z.infer<typeof moveCategorySchema>;
/**
 * ReorderCategoriesInput type
 * 
 * @typedef {Object} ReorderCategoriesInput
 * @description Type definition for ReorderCategoriesInput
 */
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
/**
 * CategoryQuery type
 * 
 * @typedef {Object} CategoryQuery
 * @description Type definition for CategoryQuery
 */
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
/**
 * GetCategoryTreeInput type
 * 
 * @typedef {Object} GetCategoryTreeInput
 * @description Type definition for GetCategoryTreeInput
 */
export type GetCategoryTreeInput = z.infer<typeof getCategoryTreeSchema>;
/**
 * ValidateLeafCategoryInput type
 * 
 * @typedef {Object} ValidateLeafCategoryInput
 * @description Type definition for ValidateLeafCategoryInput
 */
export type ValidateLeafCategoryInput = z.infer<
  typeof validateLeafCategorySchema
>;
/**
 * BulkUpdateCategoriesInput type
 * 
 * @typedef {Object} BulkUpdateCategoriesInput
 * @description Type definition for BulkUpdateCategoriesInput
 */
export type BulkUpdateCategoriesInput = z.infer<
  typeof bulkUpdateCategoriesSchema
>;
/**
 * GetCategoryPathInput type
 * 
 * @typedef {Object} GetCategoryPathInput
 * @description Type definition for GetCategoryPathInput
 */
export type GetCategoryPathInput = z.infer<typeof getCategoryPathSchema>;
/**
 * GetSimilarCategoriesInput type
 * 
 * @typedef {Object} GetSimilarCategoriesInput
 * @description Type definition for GetSimilarCategoriesInput
 */
export type GetSimilarCategoriesInput = z.infer<
  typeof getSimilarCategoriesSchema
>;

/**
 * Utility: Check if category is leaf (has no children)
 * Note: This would typically be checked against the database
 */
/**
 * Checks if leaf category
 *
 * @param {{
  hasChildren?} [category] - The category
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isLeafCategory({});
 */

/**
 * Checks if leaf category
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isLeafCategory();
 */

export function isLeafCategory(category: {
  /** Has Children */
  hasChildren?: boolean;
  /** Child Count */
  childCount?: number;
}): boolean {
  return (
    !category.hasChildren &&
    (category.childCount === undefined || category.childCount === 0)
  );
}

/**
 * Utility: Get category level from path
 */
/**
 * Retrieves category level
 *
 * @param {string} path - The path
 *
 * @returns {string} The categorylevel result
 *
 * @example
 * getCategoryLevel("example");
 */

/**
 * Retrieves category level
 *
 * @param {string} path - The path
 *
 * @returns {string} The categorylevel result
 *
 * @example
 * getCategoryLevel("example");
 */

export function getCategoryLevel(path: string): number {
  if (!path) return 0;
  return path.split("/").length - 1;
}

/**
 * Utility: Build category path string
 */
/**
 * Performs build category path operation
 *
 * @param {string | null} parentPath - The parent path
 * @param {string} categoryId - category identifier
 *
 * @returns {string} The buildcategorypath result
 *
 * @example
 * buildCategoryPath(parentPath, "example");
 */

/**
 * Performs build category path operation
 *
 * @returns {string} The buildcategorypath result
 *
 * @example
 * buildCategoryPath();
 */

export function buildCategoryPath(
  /** Parent Path */
  parentPath: string | null,
  /** Category Id */
  categoryId: string,
): string {
  return parentPath ? `${parentPath}/${categoryId}` : categoryId;
}

/**
 * Utility: Parse category path to array of IDs
 */
/**
 * Parses category path
 *
 * @param {string} path - The path
 *
 * @returns {string} The parsecategorypath result
 *
 * @example
 * parseCategoryPath("example");
 */

/**
 * Parses category path
 *
 * @param {string} path - The path
 *
 * @returns {string} The parsecategorypath result
 *
 * @example
 * parseCategoryPath("example");
 */

export function parseCategoryPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}
