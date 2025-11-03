/**
 * Category Controller
 * 
 * Business logic layer for category operations with RBAC
 * 
 * Role-Based Access Control:
 * - Public: View active categories, get category tree
 * - User: Same as public
 * - Seller: Same as public
 * - Admin: Full CRUD operations
 * 
 * Features:
 * - Public category browsing
 * - Category tree navigation
 * - Admin-only management
 * - Batch operations for efficiency
 * - Product count tracking
 */

import { categoryModel, CategoryWithVersion } from '../models/category.model';
import { CategoryTreeNode } from '@/types';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../middleware/error-handler';

// ============================================================================
// Types
// ============================================================================

/**
 * User context for RBAC
 */
export interface UserContext {
  userId: string;
  role: 'admin' | 'seller' | 'user';
  email?: string;
}

/**
 * Category filters for queries
 */
export interface CategoryFilters {
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
}

/**
 * Create category input
 */
export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  parentIds?: string[];
  isActive?: boolean;
  featured?: boolean;
  sortOrder?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    altText?: string;
    keywords?: string[];
  };
}

/**
 * Update category input
 */
export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  parentIds?: string[];
  isActive?: boolean;
  featured?: boolean;
  sortOrder?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    altText?: string;
    keywords?: string[];
  };
}

// ============================================================================
// Controller Functions
// ============================================================================

/**
 * Get all categories with filters
 * Public access (returns only active categories for non-admins)
 */
export async function getAllCategories(
  filters: CategoryFilters = {},
  userContext?: UserContext
): Promise<CategoryWithVersion[]> {
  // Non-admins can only see active categories
  if (!userContext || userContext.role !== 'admin') {
    filters.isActive = true;
  }
  
  return await categoryModel.findAll(filters);
}

/**
 * Get category by slug
 * Public access (must be active for non-admins)
 */
export async function getCategoryBySlug(
  slug: string,
  userContext?: UserContext
): Promise<CategoryWithVersion> {
  const category = await categoryModel.findBySlug(slug);
  
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  
  // Non-admins can only see active categories
  if (!userContext || userContext.role !== 'admin') {
    if (!category.isActive) {
      throw new NotFoundError('Category not found');
    }
  }
  
  return category;
}

/**
 * Get category by ID
 * Public access (must be active for non-admins)
 */
export async function getCategoryById(
  id: string,
  userContext?: UserContext
): Promise<CategoryWithVersion> {
  const category = await categoryModel.findById(id);
  
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  
  // Non-admins can only see active categories
  if (!userContext || userContext.role !== 'admin') {
    if (!category.isActive) {
      throw new NotFoundError('Category not found');
    }
  }
  
  return category;
}

/**
 * Get category tree structure
 * Public access
 */
export async function getCategoryTree(
  activeOnly: boolean = true
): Promise<CategoryTreeNode[]> {
  return await categoryModel.getCategoryTree(activeOnly);
}

/**
 * Get leaf categories (categories with no children)
 * Public access
 */
export async function getLeafCategories(
  activeOnly: boolean = true
): Promise<CategoryWithVersion[]> {
  return await categoryModel.getLeafCategories(activeOnly);
}

/**
 * Create a new category
 * Admin only
 */
export async function createCategory(
  data: CreateCategoryInput,
  userContext: UserContext
): Promise<CategoryWithVersion> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can create categories');
  }
  
  // Validation
  if (!data.name || data.name.trim().length < 2) {
    throw new ValidationError('Category name must be at least 2 characters');
  }
  
  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    throw new ValidationError('Slug can only contain lowercase letters, numbers, and hyphens');
  }
  
  if (data.parentIds && data.parentIds.length > 0) {
    // Verify all parent categories exist
    for (const parentId of data.parentIds) {
      const parent = await categoryModel.findById(parentId);
      if (!parent) {
        throw new ValidationError(`Parent category with ID ${parentId} not found`);
      }
    }
  }
  
  return await categoryModel.create(data, userContext.userId);
}

/**
 * Update category
 * Admin only
 */
export async function updateCategory(
  slug: string,
  data: UpdateCategoryInput,
  userContext: UserContext
): Promise<CategoryWithVersion> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can update categories');
  }
  
  // Get existing category
  const category = await categoryModel.findBySlug(slug);
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  
  // Validation
  if (data.name && data.name.trim().length < 2) {
    throw new ValidationError('Category name must be at least 2 characters');
  }
  
  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    throw new ValidationError('Slug can only contain lowercase letters, numbers, and hyphens');
  }
  
  if (data.parentIds) {
    // Verify all parent categories exist
    for (const parentId of data.parentIds) {
      const parent = await categoryModel.findById(parentId);
      if (!parent) {
        throw new ValidationError(`Parent category with ID ${parentId} not found`);
      }
      
      // Prevent circular reference (category cannot be its own parent)
      if (parentId === category.id) {
        throw new ValidationError('Category cannot be its own parent');
      }
    }
  }
  
  return await categoryModel.update(category.id, data, userContext.userId);
}

/**
 * Delete category (soft delete)
 * Admin only
 */
export async function deleteCategory(
  slug: string,
  userContext: UserContext
): Promise<void> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can delete categories');
  }
  
  // Get category
  const category = await categoryModel.findBySlug(slug);
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  
  // Check if category has children
  if (category.childIds && category.childIds.length > 0) {
    throw new ValidationError(
      'Cannot delete category with children. Delete or move child categories first.'
    );
  }
  
  // Check if category has products
  if (category.productCount && category.productCount > 0) {
    throw new ValidationError(
      `Cannot delete category with ${category.productCount} products. Move or delete products first.`
    );
  }
  
  await categoryModel.delete(category.id, userContext.userId);
}

/**
 * Permanently delete category
 * Admin only (use with caution - same as soft delete for now)
 */
export async function permanentlyDeleteCategory(
  slug: string,
  userContext: UserContext
): Promise<void> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can permanently delete categories');
  }
  
  // Get category
  const category = await categoryModel.findBySlug(slug);
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  
  // For now, use soft delete (can implement hard delete later if needed)
  await categoryModel.delete(category.id, userContext.userId);
}

/**
 * Batch update categories
 * Admin only
 */
export async function batchUpdateCategories(
  updates: { id: string; data: Partial<CategoryWithVersion> }[],
  userContext: UserContext
): Promise<{ success: number; failed: number; errors: string[] }> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can batch update categories');
  }
  
  if (!updates || updates.length === 0) {
    throw new ValidationError('At least one category update is required');
  }
  
  return await categoryModel.bulkUpdate(updates, userContext.userId);
}

/**
 * Reorder categories
 * Admin only
 */
export async function reorderCategories(
  orders: { id: string; sortOrder: number }[],
  userContext: UserContext
): Promise<{ success: number; failed: number; errors: string[] }> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can reorder categories');
  }
  
  if (!orders || orders.length === 0) {
    throw new ValidationError('At least one category order is required');
  }
  
  // Convert to batch update format
  const updates = orders.map(order => ({
    id: order.id,
    data: { sortOrder: order.sortOrder },
  }));
  
  return await categoryModel.bulkUpdate(updates, userContext.userId);
}

/**
 * Move category to different parent
 * Admin only
 */
export async function moveCategory(
  slug: string,
  newParentIds: string[],
  userContext: UserContext
): Promise<CategoryWithVersion> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can move categories');
  }
  
  // Get category
  const category = await categoryModel.findBySlug(slug);
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  
  // Verify all parent categories exist
  for (const parentId of newParentIds) {
    const parent = await categoryModel.findById(parentId);
    if (!parent) {
      throw new ValidationError(`Parent category with ID ${parentId} not found`);
    }
    
    // Prevent circular reference
    if (parentId === category.id) {
      throw new ValidationError('Category cannot be its own parent');
    }
    
    // Check if category is an ancestor of the new parent (would create circular reference)
    const ancestors = await categoryModel.getAncestors(parentId);
    if (ancestors.includes(category.id)) {
      throw new ValidationError('Cannot move category to one of its descendants (circular reference)');
    }
  }
  
  return await categoryModel.update(
    category.id,
    { parentIds: newParentIds },
    userContext.userId
  );
}

/**
 * Get category ancestors
 * Public access
 */
export async function getCategoryAncestors(
  slug: string,
  userContext?: UserContext
): Promise<CategoryWithVersion[]> {
  const category = await getCategoryBySlug(slug, userContext);
  const ancestorIds = await categoryModel.getAncestors(category.id);
  
  const ancestors = await Promise.all(
    ancestorIds.map((id: string) => categoryModel.findById(id))
  );
  
  return ancestors.filter(Boolean) as CategoryWithVersion[];
}

/**
 * Get category descendants
 * Public access (returns only active for non-admins)
 */
export async function getCategoryDescendants(
  slug: string,
  userContext?: UserContext
): Promise<CategoryWithVersion[]> {
  const category = await getCategoryBySlug(slug, userContext);
  const descendantIds = await categoryModel.getDescendants(category.id);
  
  const descendants = await Promise.all(
    descendantIds.map((id: string) => categoryModel.findById(id))
  );
  
  let result = descendants.filter(Boolean) as CategoryWithVersion[];
  
  // Filter by active status for non-admins
  if (!userContext || userContext.role !== 'admin') {
    result = result.filter(cat => cat.isActive);
  }
  
  return result;
}

/**
 * Count categories
 * Admin only
 */
export async function countCategories(
  filters: CategoryFilters = {},
  userContext: UserContext
): Promise<number> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can count categories');
  }
  
  return await categoryModel.count(filters);
}

/**
 * Update product counts for a category
 * System use only (called from product operations)
 */
export async function updateCategoryProductCounts(
  categoryId: string,
  counts: {
    productCount?: number;
    inStockCount?: number;
    outOfStockCount?: number;
    lowStockCount?: number;
  }
): Promise<void> {
  return await categoryModel.updateProductCounts(categoryId, counts);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate category data
 */
function validateCategoryData(data: CreateCategoryInput | UpdateCategoryInput): void {
  // Name validation
  if ('name' in data && data.name) {
    if (data.name.length < 2 || data.name.length > 100) {
      throw new ValidationError('Category name must be between 2 and 100 characters');
    }
  }
  
  // Description validation
  if (data.description && data.description.length > 500) {
    throw new ValidationError('Description must be less than 500 characters');
  }
  
  // Image URL validation
  if (data.image) {
    try {
      new URL(data.image);
    } catch {
      throw new ValidationError('Invalid image URL');
    }
  }
  
  // SEO validation
  if (data.seo) {
    if (data.seo.metaTitle && data.seo.metaTitle.length > 60) {
      throw new ValidationError('Meta title must be less than 60 characters');
    }
    
    if (data.seo.metaDescription && data.seo.metaDescription.length > 160) {
      throw new ValidationError('Meta description must be less than 160 characters');
    }
    
    if (data.seo.keywords && data.seo.keywords.length > 10) {
      throw new ValidationError('Maximum 10 keywords allowed');
    }
  }
}
