/**
 * Category Model
 * 
 * Database layer for category operations with transaction safety and concurrency control
 * 
 * Features:
 * - Transaction-safe create/update operations
 * - Optimistic locking using version field
 * - Slug uniqueness validation
 * - Many-to-many parent-child relationships
 * - Category tree building
 */

import { getAdminDb } from '../database/admin';
import { Category, CategoryTreeNode } from "@/types/shared";
import { ConflictError, NotFoundError, ValidationError } from '../middleware/error-handler';
import admin from 'firebase-admin';

// Extend Category with version for concurrency control
export interface CategoryWithVersion extends Category {
  version: number;
}

export class CategoryModel {
  private collection: FirebaseFirestore.CollectionReference;

  constructor() {
    const db = getAdminDb();
    this.collection = db.collection('categories');
  }

  /**
   * Generate slug from category name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Create a new category
   */
  async create(data: Partial<CategoryWithVersion>, userId: string): Promise<CategoryWithVersion> {
    const db = getAdminDb();
    
    try {
      const category = await db.runTransaction(async (transaction) => {
        // Generate slug if not provided
        if (!data.slug && data.name) {
          data.slug = this.generateSlug(data.name);
        }
        
        if (!data.slug) {
          throw new ValidationError('Category name or slug is required');
        }
        
        // Check slug uniqueness
        const existingSnapshot = await transaction.get(
          db.collection('categories').where('slug', '==', data.slug).limit(1)
        );
        
        if (!existingSnapshot.empty) {
          throw new ConflictError(`Category with slug '${data.slug}' already exists`);
        }
        
        // Create category document
        const categoryRef = this.collection.doc();
        const now = new Date().toISOString();
        
        const categoryData: CategoryWithVersion = {
          id: categoryRef.id,
          name: data.name || '',
          slug: data.slug,
          description: data.description,
          image: data.image,
          icon: data.icon,
          seo: data.seo,
          parentIds: data.parentIds || [],
          parentSlugs: data.parentSlugs || [],
          childIds: [],
          paths: data.paths || [[categoryRef.id]],
          minLevel: data.minLevel ?? 0,
          maxLevel: data.maxLevel ?? 0,
          isLeaf: true,
          isActive: data.isActive ?? true,
          featured: data.featured ?? false,
          sortOrder: data.sortOrder ?? 0,
          productCount: 0,
          inStockCount: 0,
          outOfStockCount: 0,
          lowStockCount: 0,
          createdAt: now,
          updatedAt: now,
          createdBy: userId,
          updatedBy: userId,
          version: 1,
        };
        
        transaction.set(categoryRef, categoryData);
        
        return categoryData;
      });
      
      return category;
    } catch (error: any) {
      if (error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  /**
   * Find category by ID
   */
  async findById(id: string): Promise<CategoryWithVersion | null> {
    const doc = await this.collection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return doc.data() as CategoryWithVersion;
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string): Promise<CategoryWithVersion | null> {
    const snapshot = await this.collection
      .where('slug', '==', slug)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].data() as CategoryWithVersion;
  }

  /**
   * Find all categories with filters
   */
  async findAll(filters: {
    parentId?: string | null;
    level?: number;
    isActive?: boolean;
    featured?: boolean;
    isLeaf?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'sortOrder' | 'createdAt' | 'productCount';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<CategoryWithVersion[]> {
    let query: FirebaseFirestore.Query = this.collection;
    
    // Apply filters
    if (filters.isActive !== undefined) {
      query = query.where('isActive', '==', filters.isActive);
    }
    
    if (filters.featured !== undefined) {
      query = query.where('featured', '==', filters.featured);
    }
    
    if (filters.isLeaf !== undefined) {
      query = query.where('isLeaf', '==', filters.isLeaf);
    }
    
    // Sorting
    const sortBy = filters.sortBy || 'sortOrder';
    const sortOrder = filters.sortOrder || 'asc';
    query = query.orderBy(sortBy, sortOrder);
    
    // Pagination
    if (filters.limit) {
      const offset = filters.page ? (filters.page - 1) * filters.limit : 0;
      query = query.offset(offset).limit(filters.limit);
    }
    
    const snapshot = await query.get();
    let categories = snapshot.docs.map(doc => doc.data() as CategoryWithVersion);
    
    // Client-side filters
    if (filters.parentId !== undefined) {
      if (filters.parentId === null) {
        categories = categories.filter(cat => !cat.parentIds || cat.parentIds.length === 0);
      } else {
        categories = categories.filter(cat => cat.parentIds?.includes(filters.parentId as string));
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      categories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchLower) ||
        cat.slug.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return categories;
  }

  /**
   * Get category tree structure
   */
  async getCategoryTree(activeOnly: boolean = false): Promise<CategoryTreeNode[]> {
    const filters = activeOnly ? { isActive: true } : {};
    const allCategories = await this.findAll(filters);
    
    // Create a map for quick lookup
    const categoryMap = new Map<string, CategoryTreeNode>();
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
        hasChildren: (cat.childIds?.length || 0) > 0,
      });
    });
    
    // Build tree structure
    const rootNodes: CategoryTreeNode[] = [];
    
    categoryMap.forEach((category) => {
      if (!category.parentIds || category.parentIds.length === 0) {
        rootNodes.push(category);
      } else {
        category.parentIds.forEach((parentId: string) => {
          const parent = categoryMap.get(parentId);
          if (parent) {
            parent.children.push(category);
          }
        });
      }
    });
    
    // Sort children recursively
    const sortChildren = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortChildren(node.children);
        }
      });
    };
    
    sortChildren(rootNodes);
    
    return rootNodes;
  }

  /**
   * Get leaf categories
   */
  async getLeafCategories(activeOnly: boolean = false): Promise<CategoryWithVersion[]> {
    const filters: any = { isLeaf: true };
    if (activeOnly) {
      filters.isActive = true;
    }
    
    return await this.findAll(filters);
  }

  /**
   * Update category
   */
  async update(id: string, data: Partial<CategoryWithVersion>, userId: string): Promise<CategoryWithVersion> {
    const db = getAdminDb();
    
    try {
      const category = await db.runTransaction(async (transaction) => {
        const categoryRef = this.collection.doc(id);
        const categoryDoc = await transaction.get(categoryRef);
        
        if (!categoryDoc.exists) {
          throw new NotFoundError('Category not found');
        }
        
        const existingCategory = categoryDoc.data() as CategoryWithVersion;
        
        // Optimistic locking check
        if (data.version && data.version !== existingCategory.version) {
          throw new ConflictError('Category has been modified by another user');
        }
        
        // Check slug uniqueness if slug is being updated
        if (data.slug && data.slug !== existingCategory.slug) {
          const existingSnapshot = await transaction.get(
            db.collection('categories').where('slug', '==', data.slug).limit(1)
          );
          
          if (!existingSnapshot.empty && existingSnapshot.docs[0].id !== id) {
            throw new ConflictError(`Category with slug '${data.slug}' already exists`);
          }
        }
        
        const updatedData: any = {
          ...existingCategory,
          ...data,
          id,
          updatedAt: new Date().toISOString(),
          updatedBy: userId,
          version: existingCategory.version + 1,
        };
        
        transaction.update(categoryRef, updatedData);
        
        return updatedData as CategoryWithVersion;
      });
      
      return category;
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  /**
   * Delete category (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const db = getAdminDb();
    
    await db.runTransaction(async (transaction) => {
      const categoryRef = this.collection.doc(id);
      const categoryDoc = await transaction.get(categoryRef);
      
      if (!categoryDoc.exists) {
        throw new NotFoundError('Category not found');
      }
      
      const category = categoryDoc.data() as CategoryWithVersion;
      
      // Check if category has children
      if (category.childIds && category.childIds.length > 0) {
        throw new ValidationError('Cannot delete category with children');
      }
      
      // Check if category has products
      if (category.productCount && category.productCount > 0) {
        throw new ValidationError('Cannot delete category with products');
      }
      
      // Soft delete
      transaction.update(categoryRef, {
        isActive: false,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
        version: category.version + 1,
      });
    });
  }

  /**
   * Count categories
   */
  async count(filters: any = {}): Promise<number> {
    const categories = await this.findAll(filters);
    return categories.length;
  }

  /**
   * Batch update categories
   */
  async bulkUpdate(
    updates: { id: string; data: Partial<CategoryWithVersion> }[],
    userId: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const db = getAdminDb();
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;
    
    const BATCH_SIZE = 500;
    
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = updates.slice(i, i + BATCH_SIZE);
      
      for (const update of chunk) {
        try {
          const categoryRef = this.collection.doc(update.id);
          const categoryDoc = await categoryRef.get();
          
          if (!categoryDoc.exists) {
            errors.push(`Category ${update.id} not found`);
            failedCount++;
            continue;
          }
          
          const existingCategory = categoryDoc.data() as CategoryWithVersion;
          
          batch.update(categoryRef, {
            ...update.data,
            updatedAt: new Date().toISOString(),
            updatedBy: userId,
            version: existingCategory.version + 1,
          });
          
          successCount++;
        } catch (error: any) {
          errors.push(`Failed to update ${update.id}: ${error.message}`);
          failedCount++;
        }
      }
      
      try {
        await batch.commit();
      } catch (error: any) {
        errors.push(`Batch commit failed: ${error.message}`);
        failedCount += chunk.length;
      }
    }
    
    return { success: successCount, failed: failedCount, errors };
  }

  /**
   * Update product counts
   */
  async updateProductCounts(
    categoryId: string,
    counts: {
      productCount?: number;
      inStockCount?: number;
      outOfStockCount?: number;
      lowStockCount?: number;
    }
  ): Promise<void> {
    await this.collection.doc(categoryId).update({
      ...counts,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Get all ancestor category IDs
   */
  async getAncestors(categoryId: string): Promise<string[]> {
    const category = await this.findById(categoryId);
    if (!category || !category.paths) {
      return [];
    }
    
    const ancestorSet = new Set<string>();
    category.paths.forEach((path: string[]) => {
      path.forEach((id: string) => {
        if (id !== categoryId) {
          ancestorSet.add(id);
        }
      });
    });
    
    return Array.from(ancestorSet);
  }

  /**
   * Get all descendant category IDs
   */
  async getDescendants(categoryId: string): Promise<string[]> {
    const allCategories = await this.findAll();
    const descendants = new Set<string>();
    
    allCategories.forEach((cat: CategoryWithVersion) => {
      if (cat.paths) {
        for (const path of cat.paths) {
          if (path.includes(categoryId) && cat.id !== categoryId) {
            descendants.add(cat.id);
            break;
          }
        }
      }
    });
    
    return Array.from(descendants);
  }
}

// Export singleton instance
export const categoryModel = new CategoryModel();
