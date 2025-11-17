/**
 * CATEGORY HIERARCHY UTILITIES
 * Helper functions for managing category trees, product counts, and cycle prevention
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import type { CategoryBE } from "@/types/backend/category.types";

/**
 * Get all descendant category IDs (children, grandchildren, etc.)
 * Used for finding all products under a category
 */
export async function getAllDescendantIds(
  categoryId: string
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
export async function wouldCreateCycle(
  categoryId: string,
  newParentId: string
): Promise<boolean> {
  // Can't be your own parent
  if (categoryId === newParentId) return true;

  // Check if the new parent is already a descendant
  const descendants = await getAllDescendantIds(categoryId);
  return descendants.includes(newParentId);
}

/**
 * Count products in a category (including all descendants)
 */
export async function countCategoryProducts(
  categoryId: string
): Promise<number> {
  const db = getFirestoreAdmin();

  // Get all descendant category IDs
  const descendantIds = await getAllDescendantIds(categoryId);
  const allCategoryIds = [categoryId, ...descendantIds];

  // Count products in all these categories
  let totalCount = 0;

  // Firestore doesn't support "in" queries with more than 10 items
  // So we batch them
  const batchSize = 10;
  for (let i = 0; i < allCategoryIds.length; i += batchSize) {
    const batch = allCategoryIds.slice(i, i + batchSize);

    const productsSnapshot = await db
      .collection("products")
      .where("category_id", "in", batch)
      .where("status", "==", "published")
      .where("is_deleted", "==", false)
      .count()
      .get();

    totalCount += productsSnapshot.data().count;
  }

  return totalCount;
}

/**
 * Update product count for a category and all its ancestors
 */
export async function updateCategoryProductCounts(
  categoryId: string
): Promise<void> {
  const db = getFirestoreAdmin();
  const batch = db.batch();

  // Update the category itself
  const count = await countCategoryProducts(categoryId);
  const categoryRef = db.collection("categories").doc(categoryId);
  batch.update(categoryRef, { product_count: count });

  // Update all ancestors
  const ancestorIds = await getAllAncestorIds(categoryId);
  for (const ancestorId of ancestorIds) {
    const ancestorCount = await countCategoryProducts(ancestorId);
    const ancestorRef = db.collection("categories").doc(ancestorId);
    batch.update(ancestorRef, { product_count: ancestorCount });
  }

  await batch.commit();
}

/**
 * Get all category IDs for product queries (category + all descendants)
 */
export async function getCategoryIdsForQuery(
  categoryId: string
): Promise<string[]> {
  const descendants = await getAllDescendantIds(categoryId);
  return [categoryId, ...descendants];
}

/**
 * Validate parent assignments before saving
 */
export async function validateParentAssignments(
  categoryId: string,
  parentIds: string[]
): Promise<{
  valid: boolean;
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
        `Adding parent ${parentId} would create a circular reference`
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
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate category level based on deepest path from root
 */
export async function calculateCategoryLevel(
  categoryId: string
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
export async function getCategoryProducts(
  categoryId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
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
 * Rebuild all category product counts (useful for maintenance)
 */
export async function rebuildAllCategoryCounts(): Promise<{
  updated: number;
  errors: string[];
}> {
  const db = getFirestoreAdmin();
  const categoriesSnapshot = await db.collection("categories").get();

  let updated = 0;
  const errors: string[] = [];

  for (const doc of categoriesSnapshot.docs) {
    try {
      await updateCategoryProductCounts(doc.id);
      updated++;
    } catch (error: any) {
      errors.push(`Failed to update ${doc.id}: ${error.message}`);
    }
  }

  return { updated, errors };
}
