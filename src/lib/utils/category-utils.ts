/**
 * @fileoverview Utility Functions
 * @module src/lib/utils/category-utils
 * @description This file contains utility functions for category
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Category Utilities
 * Helper functions for working with multi-parent categories
 */

import type { CategoryFE } from "@/types/frontend/category.types";

// Alias for backwards compatibility
/**
 * Category type
 * 
 * @typedef {Object} Category
 * @description Type definition for Category
 */
type Category = CategoryFE;

/**
 * Get all parent IDs from a category (supports both old and new structure)
 */
/**
 * Retrieves parent ids
 *
 * @param {Category} category - The category
 *
 * @returns {string} The parentids result
 *
 * @example
 * getParentIds(category);
 */

/**
 * Retrieves parent ids
 *
 * @param {Category} category - The category
 *
 * @returns {string} The parentids result
 *
 * @example
 * getParentIds(category);
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
/**
 * Retrieves children ids
 *
 * @param {Category} category - The category
 *
 * @returns {string} The childrenids result
 *
 * @example
 * getChildrenIds(category);
 */

/**
 * Retrieves children ids
 *
 * @param {Category} category - The category
 *
 * @returns {string} The childrenids result
 *
 * @example
 * getChildrenIds(category);
 */

export function getChildrenIds(category: Category): string[] {
  return (category as any).childrenIds || [];
}

/**
 * Check if category has a specific parent
 */
/**
 * Checks if parent
 *
 * @param {Category} category - The category
 * @param {string} parentId - parent identifier
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasParent(category, "example");
 */

/**
 * Checks if parent
 *
 * @param {Category} category - The category
 * @param {string} parentId - parent identifier
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasParent(category, "example");
 */

export function hasParent(category: Category, parentId: string): boolean {
  const parentIds = getParentIds(category);
  return parentIds.includes(parentId);
}

/**
 * Check if category has a specific child
 */
/**
 * Checks if child
 *
 * @param {Category} category - The category
 * @param {string} childId - child identifier
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasChild(category, "example");
 */

/**
 * Checks if child
 *
 * @param {Category} category - The category
 * @param {string} childId - child identifier
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasChild(category, "example");
 */

export function hasChild(category: Category, childId: string): boolean {
  const childrenIds = getChildrenIds(category);
  return childrenIds.includes(childId);
}

/**
 * Get all ancestor IDs (parents, grandparents, etc.)
 */
/**
 * Retrieves ancestor ids
 *
 * @param {Category} category - The category
 * @param {Category[]} allCategories - The all categories
 *
 * @returns {string} The ancestorids result
 *
 * @example
 * getAncestorIds(category, allCategories);
 */

/**
 * Retrieves ancestor ids
 *
 * @returns {any} The ancestorids result
 *
 * @example
 * getAncestorIds();
 */

export function getAncestorIds(
  /** Category */
  category: Category,
  /** All Categories */
  allCategories: Category[],
): string[] {
  const ancestors = new Set<string>();
  const visited = new Set<string>(); // Prevent infinite loops

  /**
   * Performs collect ancestors operation
   *
   * @param {Category} cat - The cat
   *
   * @returns {any} The collectancestors result
   */

  /**
   * Performs collect ancestors operation
   *
   * @param {Category} cat - The cat
   *
   * @returns {any} The collectancestors result
   */

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
/**
 * Retrieves descendant ids
 *
 * @param {Category} category - The category
 * @param {Category[]} allCategories - The all categories
 *
 * @returns {string} The descendantids result
 *
 * @example
 * getDescendantIds(category, allCategories);
 */

/**
 * Retrieves descendant ids
 *
 * @returns {any} The descendantids result
 *
 * @example
 * getDescendantIds();
 */

export function getDescendantIds(
  /** Category */
  category: Category,
  /** All Categories */
  allCategories: Category[],
): string[] {
  const descendants = new Set<string>();
  const visited = new Set<string>(); // Prevent infinite loops

  /**
   * Performs collect descendants operation
   *
   * @param {Category} cat - The cat
   *
   * @returns {any} The collectdescendants result
   */

  /**
   * Performs collect descendants operation
   *
   * @param {Category} cat - The cat
   *
   * @returns {any} The collectdescendants result
   */

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
/**
 * Retrieves breadcrumb path
 *
 * @param {Category} category - The category
 * @param {Category[]} allCategories - The all categories
 *
 * @returns {any} The breadcrumbpath result
 *
 * @example
 * getBreadcrumbPath(category, allCategories);
 */

/**
 * Retrieves breadcrumb path
 *
 * @returns {any} The breadcrumbpath result
 *
 * @example
 * getBreadcrumbPath();
 */

export function getBreadcrumbPath(
  /** Category */
  category: Category,
  /** All Categories */
  allCategories: Category[],
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
/**
 * Retrieves all breadcrumb paths
 *
 * @param {Category} category - The category
 * @param {Category[]} allCategories - The all categories
 *
 * @returns {any} The allbreadcrumbpaths result
 *
 * @example
 * getAllBreadcrumbPaths(category, allCategories);
 */

/**
 * Retrieves all breadcrumb paths
 *
 * @returns {any} The allbreadcrumbpaths result
 *
 * @example
 * getAllBreadcrumbPaths();
 */

export function getAllBreadcrumbPaths(
  /** Category */
  category: Category,
  /** All Categories */
  allCategories: Category[],
): Category[][] {
  const paths: Category[][] = [];
  const visited = new Set<string>();

  /**
   * Performs build paths operation
   *
   * @param {Category} cat - The cat
   * @param {Category[]} currentPath - The current path
   *
   * @returns {any} The buildpaths result
   */

  /**
   * Performs build paths operation
   *
   * @param {Category} cat - The cat
   * @param {Category[]} currentPath - The current path
   *
   * @returns {any} The buildpaths result
   */

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
/**
 * Retrieves root categories
 *
 * @param {Category[]} categories - The categories
 *
 * @returns {any} The rootcategories result
 *
 * @example
 * getRootCategories(categories);
 */

/**
 * Retrieves root categories
 *
 * @param {Category[]} categories - The categories
 *
 * @returns {any} The rootcategories result
 *
 * @example
 * getRootCategories(categories);
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
/**
 * Retrieves leaf categories
 *
 * @param {Category[]} categories - The categories
 *
 * @returns {any} The leafcategories result
 *
 * @example
 * getLeafCategories(categories);
 */

/**
 * Retrieves leaf categories
 *
 * @param {Category[]} categories - The categories
 *
 * @returns {any} The leafcategories result
 *
 * @example
 * getLeafCategories(categories);
 */

export function getLeafCategories(categories: Category[]): Category[] {
  return categories.filter((cat) => {
    return !(cat as any).hasChildren || getChildrenIds(cat).length === 0;
  });
}

/**
 * Build category tree structure
 */
export interface CategoryTree extends Category {
  /** Children */
  children: CategoryTree[];
}

/**
 * Function: Build Category Tree
 */
/**
 * Performs build category tree operation
 *
 * @param {Category[]} categories - The categories
 *
 * @returns {any} The buildcategorytree result
 *
 * @example
 * buildCategoryTree(categories);
 */

/**
 * Performs build category tree operation
 *
 * @param {Category[]} categories - The categories
 *
 * @returns {any} The buildcategorytree result
 *
 * @example
 * buildCategoryTree(categories);
 */

export function buildCategoryTree(categories: Category[]): CategoryTree[] {
  const categoryMap = new Map<string, CategoryTree>();
  const rootCategories: CategoryTree[] = [];

  // Create tree nodes
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      /** Children */
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
/**
 * Performs flatten category tree operation
 *
 * @param {CategoryTree[]} trees - The trees
 *
 * @returns {any} The flattencategorytree result
 *
 * @example
 * flattenCategoryTree(trees);
 */

/**
 * Performs flatten category tree operation
 *
 * @param {CategoryTree[]} trees - The trees
 *
 * @returns {any} The flattencategorytree result
 *
 * @example
 * flattenCategoryTree(trees);
 */

export function flattenCategoryTree(trees: CategoryTree[]): Category[] {
  const result: Category[] = [];
  const visited = new Set<string>();

  /**
   * Performs flatten operation
   *
   * @param {CategoryTree} tree - The tree
   *
   * @returns {any} The flatten result
   */

  /**
   * Performs flatten operation
   *
   * @param {CategoryTree} tree - The tree
   *
   * @returns {any} The flatten result
   */

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
/**
 * Performs would create circular reference operation
 *
 * @param {string} categoryId - category identifier
 * @param {string} newParentId - newParent identifier
 * @param {Category[]} allCategories - The all categories
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * wouldCreateCircularReference("example", "example", allCategories);
 */

/**
 * Performs would create circular reference operation
 *
 * @returns {string} The wouldcreatecircularreference result
 *
 * @example
 * wouldCreateCircularReference();
 */

export function wouldCreateCircularReference(
  /** Category Id */
  categoryId: string,
  /** New Parent Id */
  newParentId: string,
  /** All Categories */
  allCategories: Category[],
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
/**
 * Retrieves category depth
 *
 * @param {Category} category - The category
 * @param {Category[]} allCategories - The all categories
 *
 * @returns {number} The categorydepth result
 *
 * @example
 * getCategoryDepth(category, allCategories);
 */

/**
 * Retrieves category depth
 *
 * @returns {any} The categorydepth result
 *
 * @example
 * getCategoryDepth();
 */

export function getCategoryDepth(
  /** Category */
  category: Category,
  /** All Categories */
  allCategories: Category[],
): number {
  let minDepth = 0;
  const visited = new Set<string>();

  /**
   * Retrieves depth
   *
   * @param {Category} cat - The cat
   * @param {number} currentDepth - The current depth
   *
   * @returns {number} The depth result
   */

  /**
   * Retrieves depth
   *
   * @param {Category} cat - The cat
   * @param {number} currentDepth - The current depth
   *
   * @returns {number} The depth result
   */

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
/**
 * Retrieves category path string
 *
 * @param {Category} category - The category
 * @param {Category[]} allCategories - The all categories
 * @param {string} [separator] - The separator
 *
 * @returns {string} The categorypathstring result
 *
 * @example
 * getCategoryPathString(category, allCategories, "example");
 */

/**
 * Retrieves category path string
 *
 * @returns {any} The categorypathstring result
 *
 * @example
 * getCategoryPathString();
 */

export function getCategoryPathString(
  /** Category */
  category: Category,
  /** All Categories */
  allCategories: Category[],
  /** Separator */
  separator: string = " > ",
): string {
  const path = getBreadcrumbPath(category, allCategories);
  return path.map((cat) => cat.name).join(separator);
}

/**
 * Search categories by name or slug
 */
/**
 * Performs search categories operation
 *
 * @param {Category[]} categories - The categories
 * @param {string} query - The query
 *
 * @returns {string} The searchcategories result
 *
 * @example
 * searchCategories(categories, "example");
 */

/**
 * Performs search categories operation
 *
 * @returns {string} The searchcategories result
 *
 * @example
 * searchCategories();
 */

export function searchCategories(
  /** Categories */
  categories: Category[],
  /** Query */
  query: string,
): Category[] {
  const lowerQuery = query.toLowerCase();
  return categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.slug.toLowerCase().includes(lowerQuery) ||
      cat.description?.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Get categories by parent
 */
/**
 * Retrieves categories by parent
 *
 * @param {string} parentId - parent identifier
 * @param {Category[]} categories - The categories
 *
 * @returns {string} The categoriesbyparent result
 *
 * @example
 * getCategoriesByParent("example", categories);
 */

/**
 * Retrieves categories by parent
 *
 * @returns {string} The categoriesbyparent result
 *
 * @example
 * getCategoriesByParent();
 */

export function getCategoriesByParent(
  /** Parent Id */
  parentId: string,
  /** Categories */
  categories: Category[],
): Category[] {
  return categories.filter((cat) => hasParent(cat, parentId));
}

/**
 * Validate category structure
 */
export interface CategoryValidationResult {
  /** Is Valid */
  isValid: boolean;
  /** Errors */
  errors: string[];
}

/**
 * Function: Validate Category
 */
/**
 * Validates category
 *
 * @param {Category} category - The category
 * @param {Category[]} allCategories - The all categories
 *
 * @returns {string} The validatecategory result
 *
 * @example
 * validateCategory(category, allCategories);
 */

/**
 * Validates category
 *
 * @returns {any} The validatecategory result
 *
 * @example
 * validateCategory();
 */

export function validateCategory(
  /** Category */
  category: Category,
  /** All Categories */
  allCategories: Category[],
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
    /** Is Valid */
    isValid: errors.length === 0,
    errors,
  };
}
