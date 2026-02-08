/**
 * Categories Collection Schema
 *
 * Firestore schema definition for hierarchical category management
 * Supports multiple independent category trees with fast queries
 */

import {
  generateCategoryId,
  type GenerateCategoryIdInput,
} from "@/utils/id-generators";

// ============================================
// CATEGORY TYPE INTERFACES
// ============================================
export interface CategoryMetrics {
  // Direct counts (items directly in this category)
  productCount: number;
  productIds: string[]; // List of product IDs in this category
  auctionCount: number;
  auctionIds: string[]; // List of auction IDs in this category

  // Aggregate counts (includes all descendant categories)
  totalProductCount: number; // This category + all children
  totalAuctionCount: number; // This category + all children
  totalItemCount: number; // totalProductCount + totalAuctionCount

  // Last updated timestamp for cache invalidation
  lastUpdated: Date;
}

export interface CategorySEO {
  title: string; // SEO title
  description: string; // Meta description
  keywords: string[]; // SEO keywords
  ogImage?: string; // Open Graph image
  canonicalUrl?: string;
}

export interface CategoryDisplay {
  icon?: string; // Category icon/emoji
  coverImage?: string; // Optional category image (any aspect ratio, max 1)
  color?: string; // Brand color for category
  showInMenu: boolean; // Show in navigation menu
  showInFooter: boolean; // Show in footer
}

export interface CategoryAncestor {
  id: string;
  name: string;
  tier: number;
}

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface CategoryDocument {
  id: string; // Unique category ID
  name: string;
  slug: string; // URL-friendly name
  description?: string;

  // Hierarchical Structure (Multiple Independent Trees)
  rootId: string; // ID of root category (identifies which tree it belongs to)
  parentIds: string[]; // Array of parent IDs from root to immediate parent (materialized path)
  childrenIds: string[]; // Array of direct children IDs
  tier: number; // Depth level in tree (0 = root, 1 = first level, etc.)
  path: string; // Materialized path (e.g., "electronics/laptops/gaming")
  order: number; // Sort order among siblings
  isLeaf: boolean; // True if has no children (auto-calculated)

  // Product & Auction Counts (Denormalized for Performance)
  metrics: CategoryMetrics;

  // Featured Flag (Homepage Display)
  isFeatured: boolean; // Requires totalItemCount >= 8
  featuredPriority?: number; // Order in featured categories (lower = higher priority)

  // SEO & Metadata
  seo: CategorySEO;

  // Display Settings
  display: CategoryDisplay;

  // Status
  isActive: boolean;
  isSearchable: boolean; // Include in search results

  // Metadata
  createdBy: string; // Admin user ID
  createdAt: Date;
  updatedAt: Date;

  // Tree Navigation Helper (for fast queries)
  ancestors: CategoryAncestor[]; // All ancestors from root to parent
}

export const CATEGORIES_COLLECTION = "categories" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * Purpose:
 * - rootId + tier: Get all categories in a tree at specific depth
 * - parentIds array-contains: Get all descendants of a category
 * - tier: Get all root categories (tier = 0) or leaf categories
 * - isFeatured + featuredPriority: Get featured categories in order
 * - isActive + isSearchable: Get searchable categories
 * - slug: Unique lookup by slug
 */
export const CATEGORIES_INDEXED_FIELDS = [
  "slug", // For unique lookup
  "rootId", // For tree isolation
  "tier", // For depth-based queries
  "parentIds", // For ancestor queries (array-contains)
  "isLeaf", // For leaf category queries
  "isFeatured", // For featured categories
  "featuredPriority", // For sorting featured categories
  "isActive", // For active categories
  "isSearchable", // For search filtering
  "createdBy", // For admin filtering
  "createdAt", // For date sorting
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * categories (hierarchical tree structure)
 *   - Self-referential parent-child relationship
 *   - Multiple independent trees (identified by rootId)
 *
 * users (1) ----< (N) categories
 * products (N) >----< (M) categories
 *
 * Foreign Keys:
 * - categories/{id}.createdBy references users/{uid}
 * - categories/{id}.parentIds[i] references categories/{id}
 * - categories/{id}.childrenIds[i] references categories/{id}
 * - products/{id}.categories[].id references categories/{id}
 *
 * CASCADE BEHAVIOR:
 * - When category deleted:
 *   Option 1 (Delete Subtree): Delete all descendants recursively
 *   Option 2 (Reassign): Move children to parent, update their parentIds/tier/path
 * - When user deleted: Set createdBy to null or "deleted_user"
 * - When product deleted: Remove from metrics.productIds, decrement metrics
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Minimum items required for featured status
 */
export const MIN_ITEMS_FOR_FEATURED = 8 as const;

/**
 * Maximum featured categories on homepage
 */
export const MAX_FEATURED_CATEGORIES = 4 as const;

/**
 * Default data for new categories
 */
export const DEFAULT_CATEGORY_DATA: Partial<CategoryDocument> = {
  childrenIds: [],
  isLeaf: true,
  order: 0,
  isFeatured: false,
  isActive: true,
  isSearchable: true,
  metrics: {
    productCount: 0,
    productIds: [],
    auctionCount: 0,
    auctionIds: [],
    totalProductCount: 0,
    totalAuctionCount: 0,
    totalItemCount: 0,
    lastUpdated: new Date(),
  },
  display: {
    showInMenu: true,
    showInFooter: false,
  },
};

/**
 * Fields that are publicly readable
 */
export const CATEGORIES_PUBLIC_FIELDS = [
  "id",
  "name",
  "slug",
  "description",
  "rootId",
  "parentIds",
  "childrenIds",
  "tier",
  "path",
  "order",
  "isLeaf",
  "metrics.totalProductCount",
  "metrics.totalAuctionCount",
  "metrics.totalItemCount",
  "isFeatured",
  "featuredPriority",
  "seo",
  "display",
  "isActive",
  "ancestors",
] as const;

/**
 * Fields that admins can update
 */
export const CATEGORIES_UPDATABLE_FIELDS = [
  "name",
  "slug",
  "description",
  "order",
  "isFeatured",
  "featuredPriority",
  "seo",
  "display",
  "isActive",
  "isSearchable",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new categories (omit system-generated fields)
 */
export type CategoryCreateInput = Omit<
  CategoryDocument,
  "id" | "createdAt" | "updatedAt" | "metrics" | "isLeaf" | "ancestors"
> & {
  parentId?: string | null; // Specify parent for hierarchy calculation
};

/**
 * Type for updating categories
 */
export type CategoryUpdateInput = Partial<
  Pick<
    CategoryDocument,
    | "name"
    | "slug"
    | "description"
    | "order"
    | "isFeatured"
    | "featuredPriority"
    | "seo"
    | "display"
    | "isActive"
    | "isSearchable"
  >
>;

/**
 * Type for moving category to new parent
 */
export interface CategoryMoveInput {
  categoryId: string;
  newParentId: string | null; // null = make root category
}

/**
 * Type for category tree structure (for UI display)
 */
export interface CategoryTreeNode {
  category: CategoryDocument;
  children: CategoryTreeNode[];
  depth: number;
}

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const categoryQueryHelpers = {
  bySlug: (slug: string) => ["slug", "==", slug] as const,
  roots: () => ["tier", "==", 0] as const,
  leafCategories: () => ["isLeaf", "==", true] as const,
  byTier: (tier: number) => ["tier", "==", tier] as const,
  byRootId: (rootId: string) => ["rootId", "==", rootId] as const,
  children: (parentId: string) =>
    ["parentIds", "array-contains", parentId] as const,
  featured: () => ["isFeatured", "==", true] as const,
  active: () => ["isActive", "==", true] as const,
  searchable: () => ["isSearchable", "==", true] as const,
  byCreator: (userId: string) => ["createdBy", "==", userId] as const,
} as const;

// ============================================
// 7. HIERARCHY HELPERS
// ============================================
/**
 * Calculate category hierarchy fields when creating new category
 */
export function calculateCategoryFields(
  parentCategory: CategoryDocument | null,
  name: string,
  newCategoryId: string,
): {
  tier: number;
  parentIds: string[];
  rootId: string;
  path: string;
  ancestors: CategoryAncestor[];
} {
  if (!parentCategory) {
    // Root category
    return {
      tier: 0,
      parentIds: [],
      rootId: newCategoryId, // Self
      path: slugify(name),
      ancestors: [],
    };
  }

  // Child category
  return {
    tier: parentCategory.tier + 1,
    parentIds: [...parentCategory.parentIds, parentCategory.id],
    rootId: parentCategory.rootId,
    path: `${parentCategory.path}/${slugify(name)}`,
    ancestors: [
      ...parentCategory.ancestors,
      {
        id: parentCategory.id,
        name: parentCategory.name,
        tier: parentCategory.tier,
      },
    ],
  };
}

/**
 * Simple slugify function for category names
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
}

/** * Generate SEO-friendly category ID
 * Pattern: category-{name}-{parent/root-name}
 *
 * @param name - Category name
 * @param parentName - Parent category name (optional)
 * @param rootName - Root category name (optional)
 * @returns SEO-friendly category ID
 *
 * Examples:
 * - Root: createCategoryId("Electronics") → "category-electronics"
 * - Child: createCategoryId("Smartphones", "Electronics") → "category-smartphones-electronics"
 */
export function createCategoryId(
  name: string,
  parentName?: string,
  rootName?: string,
): string {
  return generateCategoryId({ name, parentName, rootName });
}

/** * Check if category can be featured
 */
export function canBeFeatured(category: CategoryDocument): boolean {
  return category.metrics.totalItemCount >= MIN_ITEMS_FOR_FEATURED;
}

/**
 * Validate category move (prevent circular references)
 */
export function isValidCategoryMove(
  categoryId: string,
  newParentId: string | null,
  currentCategory: CategoryDocument,
): boolean {
  // Cannot move to itself
  if (categoryId === newParentId) return false;

  // Cannot move to one of its own descendants
  if (newParentId && currentCategory.childrenIds.includes(newParentId))
    return false;

  return true;
}

/**
 * Get all descendant category IDs (recursive)
 */
export function getAllDescendantIds(
  category: CategoryDocument,
  allCategories: CategoryDocument[],
): string[] {
  const descendants: string[] = [];

  function collectDescendants(parentId: string) {
    const children = allCategories.filter((cat) =>
      cat.parentIds.includes(parentId),
    );
    children.forEach((child) => {
      descendants.push(child.id);
      collectDescendants(child.id);
    });
  }

  collectDescendants(category.id);
  return descendants;
}

/**
 * Build category tree structure for UI display
 */
export function buildCategoryTree(
  categories: CategoryDocument[],
  rootId?: string,
): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryDocument>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  // Get root categories
  const roots = rootId
    ? categories.filter((cat) => cat.rootId === rootId && cat.tier === 0)
    : categories.filter((cat) => cat.tier === 0);

  function buildTree(
    category: CategoryDocument,
    depth: number,
  ): CategoryTreeNode {
    const children = categories
      .filter((cat) => cat.parentIds[cat.parentIds.length - 1] === category.id)
      .sort((a, b) => a.order - b.order)
      .map((child) => buildTree(child, depth + 1));

    return {
      category,
      children,
      depth,
    };
  }

  return roots
    .sort((a, b) => a.order - b.order)
    .map((root) => buildTree(root, 0));
}
