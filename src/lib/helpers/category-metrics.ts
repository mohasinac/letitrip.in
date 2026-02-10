/**
 * Category Metrics Helper
 *
 * Utilities for batch updating category metrics across hierarchy
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { CATEGORIES_COLLECTION } from "@/db/schema/categories";
import type { CategoryDocument } from "@/db/schema/categories";
import { FieldValue } from "firebase-admin/firestore";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

const db = getAdminDb();

/**
 * Batch update ancestor metrics
 * Updates totalProductCount and totalAuctionCount for all ancestors
 *
 * @param categoryId - Category that had metric change
 * @param productDelta - Change in product count (+1, -1, 0)
 * @param auctionDelta - Change in auction count (+1, -1, 0)
 * @returns Promise<void>
 */
export async function batchUpdateAncestorMetrics(
  categoryId: string,
  productDelta: number,
  auctionDelta: number,
): Promise<void> {
  try {
    // Get category to find ancestors
    const categoryDoc = await db
      .collection(CATEGORIES_COLLECTION)
      .doc(categoryId)
      .get();
    if (!categoryDoc.exists) {
      throw new NotFoundError(`Category ${categoryId} not found`);
    }

    const category = categoryDoc.data() as CategoryDocument;
    if (!category.parentIds || category.parentIds.length === 0) {
      // No ancestors to update (root category)
      return;
    }

    // Batch update all ancestors
    const batch = db.batch();
    const now = new Date();

    for (const ancestorId of category.parentIds) {
      const ancestorRef = db.collection(CATEGORIES_COLLECTION).doc(ancestorId);
      batch.update(ancestorRef, {
        "metrics.totalProductCount": FieldValue.increment(productDelta),
        "metrics.totalAuctionCount": FieldValue.increment(auctionDelta),
        "metrics.totalItemCount": FieldValue.increment(
          productDelta + auctionDelta,
        ),
        "metrics.lastUpdated": now,
        updatedAt: now,
      });
    }

    await batch.commit();
  } catch (error) {
    serverLogger.error("Failed to batch update ancestor metrics", { error });
    throw error;
  }
}

/**
 * Recalculate category metrics from scratch
 * Useful for fixing inconsistencies or after bulk operations
 *
 * @param categoryId - Category to recalculate
 * @returns Promise<{productCount, auctionCount, totalProductCount, totalAuctionCount}>
 */
export async function recalculateCategoryMetrics(categoryId: string): Promise<{
  productCount: number;
  auctionCount: number;
  totalProductCount: number;
  totalAuctionCount: number;
}> {
  try {
    // Get category
    const categoryDoc = await db
      .collection(CATEGORIES_COLLECTION)
      .doc(categoryId)
      .get();
    if (!categoryDoc.exists) {
      throw new NotFoundError(`Category ${categoryId} not found`);
    }

    const category = categoryDoc.data() as CategoryDocument;

    // Direct counts (from productIds/auctionIds arrays)
    const productCount = category.metrics?.productIds?.length || 0;
    const auctionCount = category.metrics?.auctionIds?.length || 0;

    // Get all descendant categories
    const descendantsSnapshot = await db
      .collection(CATEGORIES_COLLECTION)
      .where("parentIds", "array-contains", categoryId)
      .get();

    // Calculate total counts (direct + all descendants)
    let totalProductCount = productCount;
    let totalAuctionCount = auctionCount;

    for (const descendantDoc of descendantsSnapshot.docs) {
      const descendant = descendantDoc.data() as CategoryDocument;
      totalProductCount += descendant.metrics?.productIds?.length || 0;
      totalAuctionCount += descendant.metrics?.auctionIds?.length || 0;
    }

    // Update category with recalculated metrics
    await db
      .collection(CATEGORIES_COLLECTION)
      .doc(categoryId)
      .update({
        "metrics.productCount": productCount,
        "metrics.auctionCount": auctionCount,
        "metrics.totalProductCount": totalProductCount,
        "metrics.totalAuctionCount": totalAuctionCount,
        "metrics.totalItemCount": totalProductCount + totalAuctionCount,
        "metrics.lastUpdated": new Date(),
        updatedAt: new Date(),
      });

    return {
      productCount,
      auctionCount,
      totalProductCount,
      totalAuctionCount,
    };
  } catch (error) {
    serverLogger.error("Failed to recalculate category metrics", { error });
    throw error;
  }
}

/**
 * Recalculate metrics for entire category tree
 * Starts from leaf categories and bubbles up to root
 *
 * @param rootId - Root category ID to recalculate tree
 * @returns Promise<number> - Number of categories updated
 */
export async function recalculateTreeMetrics(rootId: string): Promise<number> {
  try {
    // Get all categories in tree
    const snapshot = await db
      .collection(CATEGORIES_COLLECTION)
      .where("rootId", "==", rootId)
      .orderBy("tier", "desc") // Start from deepest tier
      .get();

    const categories = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as CategoryDocument,
    );

    let updatedCount = 0;

    // Process categories from leaf to root
    for (const category of categories) {
      await recalculateCategoryMetrics(category.id);
      updatedCount++;
    }

    return updatedCount;
  } catch (error) {
    serverLogger.error("Failed to recalculate tree metrics", { error });
    throw error;
  }
}

/**
 * Validate featured status based on total item count
 * Unfeatured categories that no longer meet minimum requirement
 *
 * @param categoryId - Category to validate
 * @param minItems - Minimum items required for featured status (default: 8)
 * @returns Promise<boolean> - True if featured status changed
 */
export async function validateFeaturedStatus(
  categoryId: string,
  minItems: number = 8,
): Promise<boolean> {
  try {
    const categoryDoc = await db
      .collection(CATEGORIES_COLLECTION)
      .doc(categoryId)
      .get();
    if (!categoryDoc.exists) {
      throw new NotFoundError(`Category ${categoryId} not found`);
    }

    const category = categoryDoc.data() as CategoryDocument;

    // Check if featured but doesn't meet minimum
    if (category.isFeatured && category.metrics.totalItemCount < minItems) {
      // Unfeature the category
      await db.collection(CATEGORIES_COLLECTION).doc(categoryId).update({
        isFeatured: false,
        featuredPriority: null,
        updatedAt: new Date(),
      });

      return true; // Status changed
    }

    return false; // No change
  } catch (error) {
    serverLogger.error("Failed to validate featured status", { error });
    throw error;
  }
}

/**
 * Bulk validate featured status for all categories
 * Useful after metric recalculation or product deletions
 *
 * @param minItems - Minimum items required (default: 8)
 * @returns Promise<string[]> - Array of category IDs that were unfeatured
 */
export async function bulkValidateFeaturedStatus(
  minItems: number = 8,
): Promise<string[]> {
  try {
    const snapshot = await db
      .collection(CATEGORIES_COLLECTION)
      .where("isFeatured", "==", true)
      .get();

    const unfeaturedIds: string[] = [];
    const batch = db.batch();

    for (const doc of snapshot.docs) {
      const category = doc.data() as CategoryDocument;

      if (category.metrics.totalItemCount < minItems) {
        const categoryRef = db.collection(CATEGORIES_COLLECTION).doc(doc.id);
        batch.update(categoryRef, {
          isFeatured: false,
          featuredPriority: null,
          updatedAt: new Date(),
        });
        unfeaturedIds.push(doc.id);
      }
    }

    if (unfeaturedIds.length > 0) {
      await batch.commit();
    }

    return unfeaturedIds;
  } catch (error) {
    serverLogger.error("Failed to bulk validate featured status", { error });
    throw error;
  }
}

/**
 * Update category metrics when product is added
 *
 * @param categoryId - Category ID
 * @param productId - Product ID
 * @param isAuction - Is this an auction item
 * @returns Promise<void>
 */
export async function addProductToCategory(
  categoryId: string,
  productId: string,
  isAuction: boolean = false,
): Promise<void> {
  try {
    const categoryRef = db.collection(CATEGORIES_COLLECTION).doc(categoryId);
    const now = new Date();

    const updates: Record<string, unknown> = {
      "metrics.lastUpdated": now,
      updatedAt: now,
    };

    if (isAuction) {
      updates["metrics.auctionCount"] = FieldValue.increment(1);
      updates["metrics.auctionIds"] = FieldValue.arrayUnion(productId);
      updates["metrics.totalAuctionCount"] = FieldValue.increment(1);
    } else {
      updates["metrics.productCount"] = FieldValue.increment(1);
      updates["metrics.productIds"] = FieldValue.arrayUnion(productId);
      updates["metrics.totalProductCount"] = FieldValue.increment(1);
    }

    updates["metrics.totalItemCount"] = FieldValue.increment(1);

    await categoryRef.update(updates);

    // Update ancestors
    await batchUpdateAncestorMetrics(
      categoryId,
      isAuction ? 0 : 1,
      isAuction ? 1 : 0,
    );
  } catch (error) {
    serverLogger.error("Failed to add product to category", { error });
    throw error;
  }
}

/**
 * Update category metrics when product is removed
 *
 * @param categoryId - Category ID
 * @param productId - Product ID
 * @param isAuction - Is this an auction item
 * @returns Promise<void>
 */
export async function removeProductFromCategory(
  categoryId: string,
  productId: string,
  isAuction: boolean = false,
): Promise<void> {
  try {
    const categoryRef = db.collection(CATEGORIES_COLLECTION).doc(categoryId);
    const now = new Date();

    const updates: Record<string, unknown> = {
      "metrics.lastUpdated": now,
      updatedAt: now,
    };

    if (isAuction) {
      updates["metrics.auctionCount"] = FieldValue.increment(-1);
      updates["metrics.auctionIds"] = FieldValue.arrayRemove(productId);
      updates["metrics.totalAuctionCount"] = FieldValue.increment(-1);
    } else {
      updates["metrics.productCount"] = FieldValue.increment(-1);
      updates["metrics.productIds"] = FieldValue.arrayRemove(productId);
      updates["metrics.totalProductCount"] = FieldValue.increment(-1);
    }

    updates["metrics.totalItemCount"] = FieldValue.increment(-1);

    await categoryRef.update(updates);

    // Update ancestors
    await batchUpdateAncestorMetrics(
      categoryId,
      isAuction ? 0 : -1,
      isAuction ? -1 : 0,
    );

    // Validate featured status after removal
    await validateFeaturedStatus(categoryId);
  } catch (error) {
    serverLogger.error("Failed to remove product from category", { error });
    throw error;
  }
}
