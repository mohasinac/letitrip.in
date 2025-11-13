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
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .trim(),

  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      slugRegex,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .trim(),

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
  icon: z
    .string()
    .max(50, "Icon name must not exceed 50 characters")
    .optional(), // Lucide icon name

  image: z.string().url("Image must be a valid URL").optional().nullable(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional(), // For UI theming

  // Ordering
  sortOrder: z.number().int().min(0).default(0).optional(),

  // Flags
  isFeatured: z.boolean().default(false).optional(),

  showOnHomepage: z.boolean().default(false).optional(),

  isActive: z.boolean().default(true).optional(),

  // SEO
  metaTitle: z
    .string()
    .max(60, "Meta title must not exceed 60 characters")
    .optional(),

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
      message:
        "Either newParentIds, newParentId, or sortOrder must be provided",
    }
  );

/**
 * Reorder Categories Schema (batch update sort orders)
 */
export const reorderCategoriesSchema = z.object({
  parentId: z.string().optional().nullable(),
  categoryOrders: z
    .array(
      z.object({
        categoryId: z.string(),
        sortOrder: z.number().int().min(0),
      })
    )
    .min(1),
});

/**
 * Category Query Filter Schema
 */
export const categoryQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100).optional(), // Higher default for tree

  // Sorting
  sortBy: z
    .enum(["name", "createdAt", "sortOrder", "productCount"])
    .default("sortOrder")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),

  // Filters
  parentId: z.string().optional().nullable(), // null = root categories only

  isFeatured: z.coerce.boolean().optional(),
  showOnHomepage: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),

  // Hierarchy filters
  rootOnly: z.coerce.boolean().optional(), // Only root categories
  leafOnly: z.coerce.boolean().optional(), // Only leaf categories (no children)
  level: z.coerce.number().int().min(0).optional(), // Specific level in tree

  // Search
  search: z.string().optional(),

  // Include options
  includeProductCount: z.coerce.boolean().default(false).optional(),
  includeChildren: z.coerce.boolean().default(false).optional(),
  includeAncestors: z.coerce.boolean().default(false).optional(),
});

/**
 * Get Category Tree Schema
 */
export const getCategoryTreeSchema = z.object({
  parentId: z.string().optional().nullable(),
  maxDepth: z.coerce.number().int().min(1).max(10).default(5).optional(),
  includeProductCount: z.coerce.boolean().default(false).optional(),
  includeInactive: z.coerce.boolean().default(false).optional(),
  onlyFeatured: z.coerce.boolean().default(false).optional(),
});

/**
 * Validate Leaf Category Schema (for product assignment)
 */
export const validateLeafCategorySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
});

/**
 * Bulk Update Categories Schema
 */
export const bulkUpdateCategoriesSchema = z.object({
  categoryIds: z.array(z.string()).min(1),
  updates: z.object({
    isFeatured: z.boolean().optional(),
    showOnHomepage: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Category Path Schema (for breadcrumbs)
 */
export const getCategoryPathSchema = z.object({
  categoryId: z.string().min(1),
  includeRoot: z.coerce.boolean().default(false).optional(),
});

/**
 * Similar Categories Schema (for product recommendations)
 */
export const getSimilarCategoriesSchema = z.object({
  categoryId: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(20).default(5).optional(),
});

/**
 * Type exports
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type MoveCategoryInput = z.infer<typeof moveCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
export type GetCategoryTreeInput = z.infer<typeof getCategoryTreeSchema>;
export type ValidateLeafCategoryInput = z.infer<
  typeof validateLeafCategorySchema
>;
export type BulkUpdateCategoriesInput = z.infer<
  typeof bulkUpdateCategoriesSchema
>;
export type GetCategoryPathInput = z.infer<typeof getCategoryPathSchema>;
export type GetSimilarCategoriesInput = z.infer<
  typeof getSimilarCategoriesSchema
>;

/**
 * Utility: Check if category is leaf (has no children)
 * Note: This would typically be checked against the database
 */
export function isLeafCategory(category: {
  hasChildren?: boolean;
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
export function getCategoryLevel(path: string): number {
  if (!path) return 0;
  return path.split("/").length - 1;
}

/**
 * Utility: Build category path string
 */
export function buildCategoryPath(
  parentPath: string | null,
  categoryId: string
): string {
  return parentPath ? `${parentPath}/${categoryId}` : categoryId;
}

/**
 * Utility: Parse category path to array of IDs
 */
export function parseCategoryPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}
