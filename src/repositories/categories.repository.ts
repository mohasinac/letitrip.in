/**
 * Categories Repository
 *
 * Manages hierarchical category structure with metric updates
 */

import { BaseRepository } from "./base.repository";
import {
  CATEGORIES_COLLECTION,
  CategoryDocument,
  CategoryCreateInput,
  CategoryUpdateInput,
  CategoryMoveInput,
  calculateCategoryFields,
  canBeFeatured,
  isValidCategoryMove,
  getAllDescendantIds,
  buildCategoryTree,
  CategoryTreeNode,
  MIN_ITEMS_FOR_FEATURED,
  createCategoryId,
} from "@/db/schema/categories";
import { CATEGORY_FIELDS } from "@/db/schema";
import { DatabaseError } from "@/lib/errors";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Repository for category management with hierarchy logic
 */
class CategoriesRepository extends BaseRepository<CategoryDocument> {
  constructor() {
    super(CATEGORIES_COLLECTION);
  }

  /**
   * Create new category with hierarchy calculation
   *
   * @param input - Category creation input
   * @returns Promise<CategoryDocument>
   */
  async createWithHierarchy(
    input: CategoryCreateInput,
  ): Promise<CategoryDocument> {
    try {
      // Get parent category if specified
      let parentCategory: CategoryDocument | null = null;
      let rootCategory: CategoryDocument | null = null;
      if (input.parentIds && input.parentIds.length > 0) {
        const parentId = input.parentIds[input.parentIds.length - 1];
        parentCategory = await this.findById(parentId);

        // Get root category if not parent
        if (input.parentIds[0] !== parentId) {
          rootCategory = await this.findById(input.parentIds[0]);
        }
      }

      // Generate SEO-friendly category ID
      const newCategoryId = createCategoryId(
        input.name,
        parentCategory?.name,
        rootCategory?.name,
      );

      // Calculate hierarchy fields
      const hierarchyFields = calculateCategoryFields(
        parentCategory,
        input.name,
        newCategoryId,
      );

      // Create category document
      const categoryData: Omit<CategoryDocument, "id"> = {
        ...input,
        ...hierarchyFields,
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
        childrenIds: [],
        isLeaf: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create category
      await this.db
        .collection(this.collection)
        .doc(newCategoryId)
        .set(prepareForFirestore(categoryData));

      // Update parent's childrenIds if exists
      if (parentCategory) {
        await this.db
          .collection(this.collection)
          .doc(parentCategory.id)
          .update({
            childrenIds: [...parentCategory.childrenIds, newCategoryId],
            isLeaf: false,
            updatedAt: new Date(),
          });
      }

      return await this.findByIdOrFail(newCategoryId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to create category: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get category by slug
   *
   * @param slug - Category slug
   * @returns Promise<CategoryDocument | null>
   */
  async getCategoryBySlug(slug: string): Promise<CategoryDocument | null> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CategoryDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve category by slug: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get all root categories (tier 0)
   *
   * @returns Promise<CategoryDocument[]>
   */
  async getRootCategories(): Promise<CategoryDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("tier", "==", 0)
        .where("isActive", "==", true)
        .orderBy("order", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CategoryDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve root categories: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get leaf categories (no children)
   *
   * @returns Promise<CategoryDocument[]>
   */
  async getLeafCategories(): Promise<CategoryDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("isLeaf", "==", true)
        .where("isActive", "==", true)
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CategoryDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve leaf categories: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get categories by tier (depth level)
   *
   * @param tier - Tier level (0 = root)
   * @returns Promise<CategoryDocument[]>
   */
  async getCategoriesByTier(tier: number): Promise<CategoryDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("tier", "==", tier)
        .where("isActive", "==", true)
        .orderBy("order", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CategoryDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve categories by tier: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get categories by root ID (same tree)
   *
   * @param rootId - Root category ID
   * @returns Promise<CategoryDocument[]>
   */
  async getCategoriesByRootId(rootId: string): Promise<CategoryDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("rootId", "==", rootId)
        .orderBy("tier", "asc")
        .orderBy("order", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CategoryDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve categories by rootId: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get direct children of a category
   *
   * @param parentId - Parent category ID
   * @returns Promise<CategoryDocument[]>
   */
  async getChildren(parentId: string): Promise<CategoryDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("parentIds", "array-contains", parentId)
        .orderBy("order", "asc")
        .get();

      const parent = await this.findById(parentId);
      if (!parent) return [];

      // Filter to get only direct children (parentIds ends with parentId)
      const children = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as CategoryDocument)
        .filter((cat) => cat.parentIds[cat.parentIds.length - 1] === parentId);

      return children;
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve children categories: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get all featured categories (sorted by priority)
   *
   * @returns Promise<CategoryDocument[]>
   */
  async getFeaturedCategories(): Promise<CategoryDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("isFeatured", "==", true)
        .where("isActive", "==", true)
        .orderBy("featuredPriority", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CategoryDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve featured categories: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update category metrics (product/auction counts)
   *
   * @param categoryId - Category ID
   * @param productDelta - Change in product count (+1, -1)
   * @param auctionDelta - Change in auction count (+1, -1)
   * @param productId - Product ID to add/remove (optional)
   * @returns Promise<void>
   */
  async updateMetrics(
    categoryId: string,
    productDelta: number,
    auctionDelta: number,
    productId?: string,
  ): Promise<void> {
    try {
      const category = await this.findByIdOrFail(categoryId);
      const batch = this.db.batch();
      const now = new Date();

      // Update current category metrics
      const categoryRef = this.db.collection(this.collection).doc(categoryId);
      const updates: Record<string, unknown> = {
        "metrics.productCount": FieldValue.increment(productDelta),
        "metrics.auctionCount": FieldValue.increment(auctionDelta),
        "metrics.totalProductCount": FieldValue.increment(productDelta),
        "metrics.totalAuctionCount": FieldValue.increment(auctionDelta),
        "metrics.totalItemCount": FieldValue.increment(
          productDelta + auctionDelta,
        ),
        "metrics.lastUpdated": now,
        updatedAt: now,
      };

      // Update productIds array if productId provided
      if (productId && productDelta !== 0) {
        updates["metrics.productIds"] =
          productDelta > 0
            ? FieldValue.arrayUnion(productId)
            : FieldValue.arrayRemove(productId);
      }

      batch.update(categoryRef, updates);

      // Update all ancestor categories (aggregate counts only)
      for (const ancestorId of category.parentIds) {
        const ancestorRef = this.db.collection(this.collection).doc(ancestorId);
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
      throw new DatabaseError(
        `Failed to update category metrics: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Move category to new parent (updates hierarchy)
   *
   * @param input - Category move input
   * @returns Promise<CategoryDocument>
   */
  async moveCategory(input: CategoryMoveInput): Promise<CategoryDocument> {
    try {
      const { categoryId, newParentId } = input;

      // Get current category
      const category = await this.findByIdOrFail(categoryId);

      // Validate move
      if (!isValidCategoryMove(categoryId, newParentId, category)) {
        throw new DatabaseError(
          "Invalid category move: circular reference detected",
        );
      }

      // Get new parent if specified
      let newParent: CategoryDocument | null = null;
      if (newParentId) {
        newParent = await this.findByIdOrFail(newParentId);
      }

      // Calculate new hierarchy fields
      const hierarchyFields = calculateCategoryFields(
        newParent,
        category.name,
        categoryId,
      );

      // Get old parent
      const oldParentId =
        category.parentIds.length > 0
          ? category.parentIds[category.parentIds.length - 1]
          : null;

      const batch = this.db.batch();
      const now = new Date();

      // Update category with new hierarchy
      const categoryRef = this.db.collection(this.collection).doc(categoryId);
      batch.update(categoryRef, {
        ...hierarchyFields,
        updatedAt: now,
      });

      // Remove from old parent's childrenIds
      if (oldParentId) {
        const oldParentRef = this.db
          .collection(this.collection)
          .doc(oldParentId);
        batch.update(oldParentRef, {
          childrenIds: FieldValue.arrayRemove(categoryId),
          updatedAt: now,
        });

        // Check if old parent is now a leaf
        const oldParent = await this.findById(oldParentId);
        if (oldParent && oldParent.childrenIds.length === 1) {
          batch.update(oldParentRef, { isLeaf: true });
        }
      }

      // Add to new parent's childrenIds
      if (newParentId) {
        const newParentRef = this.db
          .collection(this.collection)
          .doc(newParentId);
        batch.update(newParentRef, {
          childrenIds: FieldValue.arrayUnion(categoryId),
          isLeaf: false,
          updatedAt: now,
        });
      }

      await batch.commit();

      return await this.findByIdOrFail(categoryId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to move category: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Build category tree structure
   *
   * @param rootId - Optional root ID to filter by tree
   * @returns Promise<CategoryTreeNode[]>
   */
  async buildTree(rootId?: string): Promise<CategoryTreeNode[]> {
    try {
      let categories: CategoryDocument[];

      if (rootId) {
        categories = await this.getCategoriesByRootId(rootId);
      } else {
        categories = await this.findAll();
      }

      return buildCategoryTree(categories, rootId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to build category tree: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Toggle featured status (with validation)
   *
   * @param categoryId - Category ID
   * @param featured - True to feature, false to unfeature
   * @returns Promise<CategoryDocument>
   */
  async toggleFeatured(
    categoryId: string,
    featured: boolean,
  ): Promise<CategoryDocument> {
    try {
      const category = await this.findByIdOrFail(categoryId);

      // Validate if trying to feature
      if (featured && !canBeFeatured(category)) {
        throw new DatabaseError(
          `Category must have at least ${MIN_ITEMS_FOR_FEATURED} items to be featured`,
        );
      }

      await this.db.collection(this.collection).doc(categoryId).update({
        isFeatured: featured,
        updatedAt: new Date(),
      });

      return await this.findByIdOrFail(categoryId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to toggle featured status: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

// Export singleton instance
export const categoriesRepository = new CategoriesRepository();
