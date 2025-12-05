/**
 * @fileoverview TypeScript Module
 * @module src/lib/category-hierarchy
 * @description This file contains functionality related to category-hierarchy
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * CATEGORY HIERARCHY UTILITIES
 * Helper functions for managing category trees, product counts, and cycle prevention
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import type { CategoryBE } from "@/types/backend/category.types";
import { logError } from "@/lib/firebase-error-logger";

/**
 * Get all descendant category IDs (children, grandchildren, etc.)
 * Used for finding all products under a category
 */
/**
 * Retrieves all descendant ids
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to alldescendantids result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAllDescendantIds("example");
 */

/**
 * Retrieves all descendant ids
 *
 * @param {string} /** Category Id */
  categoryId - /** Category Id */
  category identifier
 *
 * @returns {Promise<any>} Promise resolving to alldescendantids result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAllDescendantIds("example");
 */

export async function getAllDescendantIds(
  /** Category Id */
  categoryId: string,
): Promise<string[]> {
  const db = getFirestoreAdmin();
  const descendants: string[] = [];
  const queue: string[] = [categoryId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Find all children of current category
    const childrenSnapshot = await db
      .collection("categories")
      .where("parent_ids", "array-contains", currentId)
      .get();

    for (const doc of childrenSnapshot.docs) {
      const childId = doc.id;
      if (!visited.has(childId)) {
        descendants.push(childId);
        queue.push(childId);
      }
    }
  }

  return descendants;
}

/**
 * Get all ancestor category IDs (parents, grandparents, etc.)
 * Used for updating product counts up the tree
 */
/**
 * Retrieves all ancestor ids
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to allancestorids result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAllAncestorIds("example");
 */

/**
 * Retrieves all ancestor ids
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to allancestorids result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getAllAncestorIds("example");
 */

export async function getAllAncestorIds(categoryId: string): Promise<string[]> {
  const db = getFirestoreAdmin();
  const ancestors: string[] = [];
  const visited = new Set<string>();

  const category = await db.collection("categories").doc(categoryId).get();
  if (!category.exists) return [];

  const data = category.data() as CategoryBE;
  const parentIds = data.parentIds || [];

  const queue: string[] = [...parentIds];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);
    ancestors.push(currentId);

    // Get parents of current category
    const parentCategory = await db
      .collection("categories")
      .doc(currentId)
      .get();

    if (parentCategory.exists) {
      const parentData = parentCategory.data() as CategoryBE;
      const grandParentIds = parentData.parentIds || [];
      for (const grandParentId of grandParentIds) {
        if (!visited.has(grandParentId)) {
          queue.push(grandParentId);
        }
      }
    }
  }

  return ancestors;
}

/**
 * Check if adding a parent would create a cycle
 * Returns true if it would create a cycle
 */
/**
 * Performs would create cycle operation
 *
 * @param {string} categoryId - category identifier
 * @param {string} newParentId - newParent identifier
 *
 * @returns {Promise<any>} Promise resolving to wouldcreatecycle result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * wouldCreateCycle("example", "example");
 */

/**
 * Performs would create cycle operation
 *
 * @returns {Promise<any>} Promise resolving to wouldcreatecycle result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * wouldCreateCycle();
 */

export async function wouldCreateCycle(
  /** Category Id */
  categoryId: string,
  /** New Parent Id */
  newParentId: string,
): Promise<boolean> {
  // Can't be your own parent
  if (categoryId === newParentId) return true;

  // Check if the new parent is already a descendant
  const descendants = await getAllDescendantIds(categoryId);
  return descendants.includes(newParentId);
}

/**
 * Count products directly in a leaf category (no descendants)
 * For leaf nodes only - counts unique products
 */
/**
 * Performs count leaf category products operation
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to countleafcategoryproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * countLeafCategoryProducts("example");
 */

/**
 * Performs count leaf category products operation
 *
 * @param {string} /** Category Id */
  categoryId - /** Category Id */
  category identifier
 *
 * @returns {Promise<any>} Promise resolving to countleafcategoryproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * countLeafCategoryProducts("example");
 */

export async function countLeafCategoryProducts(
  /** Category Id */
  categoryId: string,
): Promise<number> {
  const db = getFirestoreAdmin();

  // Get products and filter manually (Firestore can't query for "is_deleted !== true or missing")
  const productsSnapshot = await db
    .collection("products")
    .where("category_id", "==", categoryId)
    .where("status", "==", "published")
    .get();

  // Filter out deleted products (handles both is_deleted: true and missing field)
  const validProducts = productsSnapshot.docs.filter(
    (doc) => doc.data().is_deleted !== true,
  );

  return validProducts.length;
}

/**
 * Count products for parent category by summing children counts
 * For non-leaf nodes - sums all direct children counts
 */
/**
 * Performs count parent category products operation
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to countparentcategoryproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * countParentCategoryProducts("example");
 */

/**
 * Performs count parent category products operation
 *
 * @param {string} /** Category Id */
  categoryId - /** Category Id */
  category identifier
 *
 * @returns {Promise<any>} Promise resolving to countparentcategoryproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * countParentCategoryProducts("example");
 */

export async function countParentCategoryProducts(
  /** Category Id */
  categoryId: string,
): Promise<number> {
  const db = getFirestoreAdmin();

  // Get direct children
  const childrenSnapshot = await db
    .collection("categories")
    .where("parent_ids", "array-contains", categoryId)
    .get();

  if (childrenSnapshot.empty) {
    // This is actually a leaf node, count its products
    return countLeafCategoryProducts(categoryId);
  }

  // Sum up children counts
  let totalCount = 0;
  for (const childDoc of childrenSnapshot.docs) {
    const childData = childDoc.data() as any;
    totalCount += childData.product_count || 0;
  }

  return totalCount;
}

/**
 * Count products in a category
 * - Leaf nodes: count actual products
 * - Parent nodes: sum children counts
 */
/**
 * Performs count category products operation
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to countcategoryproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * countCategoryProducts("example");
 */

/**
 * Performs count category products operation
 *
 * @param {string} /** Category Id */
  categoryId - /** Category Id */
  category identifier
 *
 * @returns {Promise<any>} Promise resolving to countcategoryproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * countCategoryProducts("example");
 */

export async function countCategoryProducts(
  /** Category Id */
  categoryId: string,
): Promise<number> {
  const isLeaf = await isCategoryLeaf(categoryId);

  if (isLeaf) {
    // Leaf node: count actual products
    return countLeafCategoryProducts(categoryId);
  } else {
    // Parent node: sum children counts
    return countParentCategoryProducts(categoryId);
  }
}

/**
 * Update product count for a category and all its ancestors
 * Updates bottom-up: leaf first, then parents
 */
/**
 * Updates existing category product counts
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to updatecategoryproductcounts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateCategoryProductCounts("example");
 */

/**
 * Updates existing category product counts
 *
 * @param {string} /** Category Id */
  categoryId - /** Category Id */
  category identifier
 *
 * @returns {Promise<any>} Promise resolving to updatecategoryproductcounts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateCategoryProductCounts("example");
 */

export async function updateCategoryProductCounts(
  /** Category Id */
  categoryId: string,
): Promise<void> {
  const db = getFirestoreAdmin();

  // Update the category itself first
  const count = await countCategoryProducts(categoryId);

  // Count in-stock and out-of-stock products
  const productsSnapshot = await db
    .collection("products")
    .where("category_id", "==", categoryId)
    .where("status", "==", "published")
    .get();

  let inStockCount = 0;
  let outOfStockCount = 0;

  for (const doc of productsSnapshot.docs) {
    const data = doc.data();
    if (data.is_deleted !== true) {
      const stockCount = data.stock_count || 0;
      if (stockCount > 0) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }
    }
  }

  await db.collection("categories").doc(categoryId).update({
    product_count: count,
    in_stock_count: inStockCount,
    out_of_stock_count: outOfStockCount,
  });

  // Update all ancestors (from bottom to top)
  const ancestorIds = await getAllAncestorIds(categoryId);

  // Sort ancestors by level (if available) or update one by one
  for (const ancestorId of ancestorIds) {
    const ancestorCount = await countCategoryProducts(ancestorId);

    // Sum up in_stock and out_of_stock from children
    const childrenSnapshot = await db
      .collection("categories")
      .where("parent_ids", "array-contains", ancestorId)
      .get();

    let ancestorInStock = 0;
    let ancestorOutOfStock = 0;

    for (const childDoc of childrenSnapshot.docs) {
      const childData = childDoc.data();
      ancestorInStock += childData.in_stock_count || 0;
      ancestorOutOfStock += childData.out_of_stock_count || 0;
    }

    await db.collection("categories").doc(ancestorId).update({
      product_count: ancestorCount,
      in_stock_count: ancestorInStock,
      out_of_stock_count: ancestorOutOfStock,
    });
  }
}

/**
 * Get all category IDs for product queries (category + all descendants)
 */
/**
 * Retrieves category ids for query
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to categoryidsforquery result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getCategoryIdsForQuery("example");
 */

/**
 * Retrieves category ids for query
 *
 * @param {string} /** Category Id */
  categoryId - /** Category Id */
  category identifier
 *
 * @returns {Promise<any>} Promise resolving to categoryidsforquery result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getCategoryIdsForQuery("example");
 */

export async function getCategoryIdsForQuery(
  /** Category Id */
  categoryId: string,
): Promise<string[]> {
  const descendants = await getAllDescendantIds(categoryId);
  return [categoryId, ...descendants];
}

/**
 * Validate parent assignments before saving
 */
/**
 * Validates parent assignments
 *
 * @param {string} categoryId - category identifier
 * @param {string[]} parentIds - The parent ids
 *
 * @returns {Promise<any>} Promise resolving to validateparentassignments result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateParentAssignments("example", parentIds);
 */

/**
 * Validates parent assignments
 *
 * @returns {Promise<any>} Promise resolving to validateparentassignments result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateParentAssignments();
 */

export async function validateParentAssignments(
  /** Category Id */
  categoryId: string,
  /** Parent Ids */
  parentIds: string[],
): Promise<{
  /** Valid */
  valid: boolean;
  /** Errors */
  errors: string[];
}> {
  const errors: string[] = [];

  // Check for self-reference
  if (parentIds.includes(categoryId)) {
    errors.push("A category cannot be its own parent");
  }

  // Check for cycles
  for (const parentId of parentIds) {
    const wouldCycle = await wouldCreateCycle(categoryId, parentId);
    if (wouldCycle) {
      errors.push(
        `Adding parent ${parentId} would create a circular reference`,
      );
    }
  }

  // Check if all parents exist
  const db = getFirestoreAdmin();
  for (const parentId of parentIds) {
    const parentDoc = await db.collection("categories").doc(parentId).get();
    if (!parentDoc.exists) {
      errors.push(`Parent category ${parentId} does not exist`);
    }
  }

  return {
    /** Valid */
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate category level based on deepest path from root
 */
/**
 * Calculates category level
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to calculatecategorylevel result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * calculateCategoryLevel("example");
 */

/**
 * Calculates category level
 *
 * @param {string} /** Category Id */
  categoryId - /** Category Id */
  category identifier
 *
 * @returns {Promise<any>} Promise resolving to calculatecategorylevel result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * calculateCategoryLevel("example");
 */

export async function calculateCategoryLevel(
  /** Category Id */
  categoryId: string,
): Promise<number> {
  const db = getFirestoreAdmin();
  const category = await db.collection("categories").doc(categoryId).get();

  if (!category.exists) return 0;

  const data = category.data() as CategoryBE;
  const parentIds = data.parentIds || [];

  if (parentIds.length === 0) {
    return 0; // Root level
  }

  // Get max level of all parents and add 1
  let maxParentLevel = 0;
  for (const parentId of parentIds) {
    const parent = await db.collection("categories").doc(parentId).get();
    if (parent.exists) {
      const parentData = parent.data() as CategoryBE;
      maxParentLevel = Math.max(maxParentLevel, parentData.level || 0);
    }
  }

  return maxParentLevel + 1;
}

/**
 * Check if category is a leaf (has no children)
 */
/**
 * Checks if category leaf
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to iscategoryleaf result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isCategoryLeaf("example");
 */

/**
 * Checks if category leaf
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to iscategoryleaf result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isCategoryLeaf("example");
 */

export async function isCategoryLeaf(categoryId: string): Promise<boolean> {
  const db = getFirestoreAdmin();
  const childrenSnapshot = await db
    .collection("categories")
    .where("parent_ids", "array-contains", categoryId)
    .limit(1)
    .get();

  return childrenSnapshot.empty;
}

/**
 * Get all products in category and descendants
 * Returns product IDs
 */
/**
 * Retrieves category products
 *
 * @returns {Promise<any>} Promise resolving to categoryproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getCategoryProducts();
 */

/**
 * Retrieves category products
 *
 * @returns {Promise<any>} Promise resolving to categoryproducts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getCategoryProducts();
 */

export async function getCategoryProducts(
  /** Category Id */
  categoryId: string,
  /** Options */
  options?: {
    /** Limit */
    limit?: number;
    /** Offset */
    offset?: number;
    /** Status */
    status?: string;
  },
): Promise<string[]> {
  const db = getFirestoreAdmin();
  const categoryIds = await getCategoryIdsForQuery(categoryId);

  const productIds: string[] = [];
  const batchSize = 10;

  for (let i = 0; i < categoryIds.length; i += batchSize) {
    const batch = categoryIds.slice(i, i + batchSize);

    let query = db
      .collection("products")
      .where("category_id", "in", batch)
      .where("is_deleted", "==", false);

    if (options?.status) {
      query = query.where("status", "==", options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    productIds.push(...snapshot.docs.map((doc) => doc.id));

    if (options?.limit && productIds.length >= options.limit) {
      break;
    }
  }

  return productIds.slice(0, options?.limit);
}

/**
 * Update auction counts for a category and all its ancestors
 */
/**
 * Updates existing category auction counts
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {Promise<any>} Promise resolving to updatecategoryauctioncounts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateCategoryAuctionCounts("example");
 */

/**
 * Updates existing category auction counts
 *
 * @param {string} /** Category Id */
  categoryId - /** Category Id */
  category identifier
 *
 * @returns {Promise<any>} Promise resolving to updatecategoryauctioncounts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateCategoryAuctionCounts("example");
 */

export async function updateCategoryAuctionCounts(
  /** Category Id */
  categoryId: string,
): Promise<void> {
  const db = getFirestoreAdmin();

  // Count live and ended auctions for this category
  const liveAuctionsSnapshot = await db
    .collection("auctions")
    .where("category_id", "==", categoryId)
    .where("status", "==", "active")
    .get();

  const endedAuctionsSnapshot = await db
    .collection("auctions")
    .where("category_id", "==", categoryId)
    .where("status", "in", ["ended", "completed"])
    .get();

  await db.collection("categories").doc(categoryId).update({
    live_auction_count: liveAuctionsSnapshot.size,
    ended_auction_count: endedAuctionsSnapshot.size,
  });

  // Update all ancestors
  const ancestorIds = await getAllAncestorIds(categoryId);

  for (const ancestorId of ancestorIds) {
    // Sum up auction counts from children
    const childrenSnapshot = await db
      .collection("categories")
      .where("parent_ids", "array-contains", ancestorId)
      .get();

    let liveCount = 0;
    let endedCount = 0;

    for (const childDoc of childrenSnapshot.docs) {
      const childData = childDoc.data();
      liveCount += childData.live_auction_count || 0;
      endedCount += childData.ended_auction_count || 0;
    }

    await db.collection("categories").doc(ancestorId).update({
      live_auction_count: liveCount,
      ended_auction_count: endedCount,
    });
  }
}

/**
 * Rebuild all category product counts (useful for maintenance)
 */
/**
 * Performs rebuild all category counts operation
 *
 * @returns {Promise<any>} Promise resolving to rebuildallcategorycounts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * rebuildAllCategoryCounts();
 */

/**
 * Performs rebuild all category counts operation
 *
 * @returns {Promise<any>} Promise resolving to rebuildallcategorycounts result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * rebuildAllCategoryCounts();
 */

export async function rebuildAllCategoryCounts(): Promise<{
  /** Updated */
  updated: number;
  /** Errors */
  errors: string[];
  /** Details */
  details?: any;
}> {
  const db = getFirestoreAdmin();
  const categoriesSnapshot = await db.collection("categories").get();

  let updated = 0;
  const errors: string[] = [];
  const details: any = {
    /** Total Categories */
    totalCategories: categoriesSnapshot.size,
    /** Category Counts */
    categoryCounts: {},
  };

  console.log(`Found ${categoriesSnapshot.size} categories to rebuild`);

  for (const doc of categoriesSnapshot.docs) {
    try {
      const categoryData = doc.data();
      const categoryId = doc.id;

      // Count products
      const count = await countCategoryProducts(categoryId);

      // Count in-stock and out-of-stock products
      const productsSnapshot = await db
        .collection("products")
        .where("category_id", "==", categoryId)
        .where("status", "==", "published")
        .get();

      let inStockCount = 0;
      let outOfStockCount = 0;

      for (const prodDoc of productsSnapshot.docs) {
        const data = prodDoc.data();
        if (data.is_deleted !== true) {
          const stockCount = data.stock_count || 0;
          if (stockCount > 0) {
            inStockCount++;
          } else {
            outOfStockCount++;
          }
        }
      }

      // Count auctions
      const liveAuctionsSnapshot = await db
        .collection("auctions")
        .where("category_id", "==", categoryId)
        .where("status", "==", "active")
        .get();

      const endedAuctionsSnapshot = await db
        .collection("auctions")
        .where("category_id", "==", categoryId)
        .where("status", "in", ["ended", "completed"])
        .get();

      await db.collection("categories").doc(categoryId).update({
        product_count: count,
        in_stock_count: inStockCount,
        out_of_stock_count: outOfStockCount,
        live_auction_count: liveAuctionsSnapshot.size,
        ended_auction_count: endedAuctionsSnapshot.size,
      });

      details.categoryCounts[categoryId] = {
        /** Name */
        name: categoryData.name,
        /** Product Count */
        productCount: count,
        inStockCount,
        outOfStockCount,
        /** Live Auction Count */
        liveAuctionCount: liveAuctionsSnapshot.size,
        /** Ended Auction Count */
        endedAuctionCount: endedAuctionsSnapshot.size,
        /** Is Leaf */
        isLeaf: await isCategoryLeaf(categoryId),
      };

      console.log(
        `Updated ${categoryData.name} (${categoryId}): ${count} products (${inStockCount} in stock, ${outOfStockCount} out of stock), ${liveAuctionsSnapshot.size} live auctions, ${endedAuctionsSnapshot.size} ended auctions`,
      );
      updated++;
    } catch (error: any) {
      logError(error as Error, {
        /** Component */
        component: "rebuildCategoryCounts",
        /** Metadata */
        metadata: { categoryId: doc.id },
      });
      errors.push(`Failed to update ${doc.id}: ${error.message}`);
    }
  }

  console.log(
    `Rebuild complete: ${updated} categories updated, ${errors.length} errors`,
  );
  return { updated, errors, details };
}
