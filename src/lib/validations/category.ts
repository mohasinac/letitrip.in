import { z } from 'zod';
import type { Category } from '@/types';

/**
 * Category validation schemas
 */

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name cannot exceed 100 characters')
    .trim(),
  
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(/^buy-[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must start with "buy-" followed by lowercase letters, numbers, and hyphens')
    .trim(),
  
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  
  parentIds: z
    .array(z.string())
    .optional()
    .default([]),
  
  isActive: z.boolean().default(true),
  
  featured: z.boolean().default(false),
  
  sortOrder: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().int().nonnegative('Sort order must be non-negative'))
    .default(0),
  
  image: z
    .string()
    .url('Image must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  icon: z
    .string()
    .optional()
    .or(z.literal('')),
  
  seo: z.object({
    metaTitle: z
      .string()
      .max(60, 'Meta title cannot exceed 60 characters')
      .optional()
      .or(z.literal('')),
    
    metaDescription: z
      .string()
      .max(160, 'Meta description cannot exceed 160 characters')
      .optional()
      .or(z.literal('')),
    
    keywords: z
      .array(z.string())
      .optional()
      .default([]),
    
    altText: z
      .string()
      .max(125, 'Alt text cannot exceed 125 characters')
      .optional()
      .or(z.literal('')),
  }).optional(),
});

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>;

/**
 * Validation helpers
 */

export function generateSlugFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
  
  // Auto-prepend 'buy-' prefix if not already present
  return slug.startsWith('buy-') ? slug : `buy-${slug}`;
}

export function validateCategoryHierarchy(
  categoryId: string,
  newParentIds: string[] | undefined,
  existingCategories: Map<string, Category>
): { valid: boolean; error?: string } {
  if (!newParentIds || newParentIds.length === 0) {
    return { valid: true };
  }

  // Check if the category is trying to be its own parent
  if (newParentIds.includes(categoryId)) {
    return { valid: false, error: 'A category cannot be its own parent' };
  }

  // Check for circular references by traversing all parent paths
  const visited = new Set<string>();
  const queue: string[] = [...newParentIds];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    
    if (currentId === categoryId) {
      return { valid: false, error: 'This would create a circular reference in the category hierarchy' };
    }

    if (visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);
    const currentCategory = existingCategories.get(currentId);
    
    if (currentCategory?.parentIds) {
      queue.push(...currentCategory.parentIds);
    }
  }

  return { valid: true };
}

/**
 * Category depth validation
 * Prevents creating very deep hierarchies
 */
export function validateCategoryDepth(
  parentIds: string[] | undefined,
  existingCategories: Map<string, Category>,
  maxDepth: number = 5
): { valid: boolean; error?: string } {
  if (!parentIds || parentIds.length === 0) {
    return { valid: true };
  }

  // Calculate the maximum depth from any parent
  let maxParentDepth = 0;
  
  for (const parentId of parentIds) {
    const parent = existingCategories.get(parentId);
    if (parent) {
      const parentDepth = parent.maxLevel || 0;
      maxParentDepth = Math.max(maxParentDepth, parentDepth);
    }
  }

  const newDepth = maxParentDepth + 1;

  if (newDepth >= maxDepth) {
    return { valid: false, error: `Category hierarchy cannot exceed ${maxDepth} levels` };
  }

  return { valid: true };
}
