/**
 * Category Utilities
 * Helper functions for working with multi-parent categories
 */

import type { Category } from "@/types";

/**
 * Get all parent IDs from a category (supports both old and new structure)
 */
export function getParentIds(category: Category): string[] {
  if (category.parentIds && category.parentIds.length > 0) {
    return category.parentIds;
  }
  if (category.parentId) {
    return [category.parentId];
  }
  return [];
}

/**
 * Get all children IDs from a category
 */
export function getChildrenIds(category: Category): string[] {
  return category.childrenIds || [];
}

/**
 * Check if category has a specific parent
 */
export function hasParent(category: Category, parentId: string): boolean {
  const parentIds = getParentIds(category);
  return parentIds.includes(parentId);
}

/**
 * Check if category has a specific child
 */
export function hasChild(category: Category, childId: string): boolean {
  const childrenIds = getChildrenIds(category);
  return childrenIds.includes(childId);
}

/**
 * Get all ancestor IDs (parents, grandparents, etc.)
 */
export function getAncestorIds(
  category: Category,
  allCategories: Category[]
): string[] {
  const ancestors = new Set<string>();
  const visited = new Set<string>(); // Prevent infinite loops

  function collectAncestors(cat: Category) {
    if (visited.has(cat.id)) return;
    visited.add(cat.id);

    const parentIds = getParentIds(cat);
    parentIds.forEach((parentId) => {
      if (!ancestors.has(parentId)) {
        ancestors.add(parentId);
        const parent = allCategories.find((c) => c.id === parentId);
        if (parent) {
          collectAncestors(parent);
        }
      }
    });
  }

  collectAncestors(category);
  return Array.from(ancestors);
}

/**
 * Get all descendant IDs (children, grandchildren, etc.)
 */
export function getDescendantIds(
  category: Category,
  allCategories: Category[]
): string[] {
  const descendants = new Set<string>();
  const visited = new Set<string>(); // Prevent infinite loops

  function collectDescendants(cat: Category) {
    if (visited.has(cat.id)) return;
    visited.add(cat.id);

    const childrenIds = getChildrenIds(cat);
    childrenIds.forEach((childId) => {
      if (!descendants.has(childId)) {
        descendants.add(childId);
        const child = allCategories.find((c) => c.id === childId);
        if (child) {
          collectDescendants(child);
        }
      }
    });
  }

  collectDescendants(category);
  return Array.from(descendants);
}

/**
 * Build category breadcrumb path (uses first parent)
 */
export function getBreadcrumbPath(
  category: Category,
  allCategories: Category[]
): Category[] {
  const path: Category[] = [];
  const visited = new Set<string>();
  let current: Category | undefined = category;

  while (current) {
    if (visited.has(current.id)) break; // Prevent infinite loops
    visited.add(current.id);
    path.unshift(current);

    const parentIds = getParentIds(current);
    if (parentIds.length === 0) break;

    // Use first parent for breadcrumb
    current = allCategories.find((c) => c.id === parentIds[0]);
  }

  return path;
}

/**
 * Build all possible breadcrumb paths (one for each parent chain)
 */
export function getAllBreadcrumbPaths(
  category: Category,
  allCategories: Category[]
): Category[][] {
  const paths: Category[][] = [];
  const visited = new Set<string>();

  function buildPaths(cat: Category, currentPath: Category[]) {
    if (visited.has(cat.id)) return;

    const newPath = [cat, ...currentPath];
    const parentIds = getParentIds(cat);

    if (parentIds.length === 0) {
      // Root reached, add path
      paths.push(newPath);
    } else {
      // Continue up each parent
      parentIds.forEach((parentId) => {
        const parent = allCategories.find((c) => c.id === parentId);
        if (parent) {
          buildPaths(parent, newPath);
        }
      });
    }
  }

  buildPaths(category, []);
  return paths;
}

/**
 * Get root categories (categories with no parents)
 */
export function getRootCategories(categories: Category[]): Category[] {
  return categories.filter((cat) => {
    const parentIds = getParentIds(cat);
    return parentIds.length === 0;
  });
}

/**
 * Get leaf categories (categories with no children)
 */
export function getLeafCategories(categories: Category[]): Category[] {
  return categories.filter((cat) => {
    return !cat.hasChildren || getChildrenIds(cat).length === 0;
  });
}

/**
 * Build category tree structure
 */
export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export function buildCategoryTree(categories: Category[]): CategoryTree[] {
  const categoryMap = new Map<string, CategoryTree>();
  const rootCategories: CategoryTree[] = [];

  // Create tree nodes
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
    });
  });

  // Build parent-child relationships
  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id);
    if (!node) return;

    const parentIds = getParentIds(cat);
    if (parentIds.length === 0) {
      // Root category
      rootCategories.push(node);
    } else {
      // Add to each parent
      parentIds.forEach((parentId) => {
        const parent = categoryMap.get(parentId);
        if (parent) {
          parent.children.push(node);
        }
      });
    }
  });

  return rootCategories;
}

/**
 * Flatten category tree to list
 */
export function flattenCategoryTree(trees: CategoryTree[]): Category[] {
  const result: Category[] = [];
  const visited = new Set<string>();

  function flatten(tree: CategoryTree) {
    if (visited.has(tree.id)) return;
    visited.add(tree.id);

    const { children, ...category } = tree;
    result.push(category as Category);

    children.forEach((child) => flatten(child));
  }

  trees.forEach((tree) => flatten(tree));
  return result;
}

/**
 * Check if category would create a circular reference
 */
export function wouldCreateCircularReference(
  categoryId: string,
  newParentId: string,
  allCategories: Category[]
): boolean {
  // Check if newParent is a descendant of category
  const category = allCategories.find((c) => c.id === categoryId);
  if (!category) return false;

  const descendants = getDescendantIds(category, allCategories);
  return descendants.includes(newParentId);
}

/**
 * Get category depth (minimum level in hierarchy)
 */
export function getCategoryDepth(
  category: Category,
  allCategories: Category[]
): number {
  let minDepth = 0;
  const visited = new Set<string>();

  function getDepth(cat: Category, currentDepth: number): number {
    if (visited.has(cat.id)) return currentDepth;
    visited.add(cat.id);

    const parentIds = getParentIds(cat);
    if (parentIds.length === 0) {
      return currentDepth;
    }

    let min = Infinity;
    parentIds.forEach((parentId) => {
      const parent = allCategories.find((c) => c.id === parentId);
      if (parent) {
        const depth = getDepth(parent, currentDepth + 1);
        min = Math.min(min, depth);
      }
    });

    return min === Infinity ? currentDepth : min;
  }

  minDepth = getDepth(category, 0);
  return minDepth;
}

/**
 * Get category path string (for display)
 */
export function getCategoryPathString(
  category: Category,
  allCategories: Category[],
  separator: string = " > "
): string {
  const path = getBreadcrumbPath(category, allCategories);
  return path.map((cat) => cat.name).join(separator);
}

/**
 * Search categories by name or slug
 */
export function searchCategories(
  categories: Category[],
  query: string
): Category[] {
  const lowerQuery = query.toLowerCase();
  return categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.slug.toLowerCase().includes(lowerQuery) ||
      cat.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get categories by parent
 */
export function getCategoriesByParent(
  parentId: string,
  categories: Category[]
): Category[] {
  return categories.filter((cat) => hasParent(cat, parentId));
}

/**
 * Validate category structure
 */
export interface CategoryValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateCategory(
  category: Category,
  allCategories: Category[]
): CategoryValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!category.id) errors.push("Category ID is required");
  if (!category.name) errors.push("Category name is required");
  if (!category.slug) errors.push("Category slug is required");

  // Check parent references
  const parentIds = getParentIds(category);
  parentIds.forEach((parentId) => {
    const parent = allCategories.find((c) => c.id === parentId);
    if (!parent) {
      errors.push(`Parent category ${parentId} not found`);
    }
  });

  // Check children references
  const childrenIds = getChildrenIds(category);
  childrenIds.forEach((childId) => {
    const child = allCategories.find((c) => c.id === childId);
    if (!child) {
      errors.push(`Child category ${childId} not found`);
    }
  });

  // Check for circular references
  parentIds.forEach((parentId) => {
    if (wouldCreateCircularReference(category.id, parentId, allCategories)) {
      errors.push(`Circular reference detected with parent ${parentId}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
