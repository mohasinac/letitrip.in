/**
 * Product Controller
 * 
 * Business logic layer for product operations
 * 
 * Features:
 * - Role-Based Access Control (RBAC)
 * - Business rule validation
 * - Data transformation
 * - Audit logging
 */

import { productModel, ProductWithVersion } from '../models/product.model';
import { Product } from '@/types';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError,
  ConflictError 
} from '../middleware/error-handler';

export interface UserContext {
  uid: string;
  role: 'admin' | 'seller' | 'user';
  sellerId?: string;
  email?: string;
}

export class ProductController {
  /**
   * Create a new product
   * Authorization: Admins can create for any seller, Sellers only for themselves
   */
  async createProduct(
    data: Partial<Product> & { slug: string },
    user: UserContext
  ): Promise<ProductWithVersion> {
    // RBAC: Only admins and sellers can create products
    if (user.role !== 'admin' && user.role !== 'seller') {
      throw new AuthorizationError('Only admins and sellers can create products');
    }

    // Business rule: Sellers can only create products for themselves
    let sellerId: string;
    if (user.role === 'seller') {
      if (!user.sellerId) {
        throw new ValidationError('Seller ID is required');
      }
      sellerId = user.sellerId;
    } else {
      // Admins can create for any seller
      sellerId = data.sellerId || user.uid;
    }

    // Business validation
    this.validateProductData(data);

    // Create product
    const product = await productModel.create({
      ...data,
      sellerId,
    });

    console.log(`[ProductController] Product created: ${product.id} by user: ${user.uid}`);
    return product;
  }

  /**
   * Get product by ID
   * Authorization: Public for active products, sellers can view their own drafts, admins see all
   */
  async getProductById(id: string, user?: UserContext): Promise<ProductWithVersion> {
    const product = await productModel.findById(id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Authorization check
    this.checkProductAccess(product, user, 'view');

    return product;
  }

  /**
   * Get product by slug
   * Authorization: Same as getProductById
   */
  async getProductBySlug(slug: string, user?: UserContext): Promise<ProductWithVersion> {
    const product = await productModel.findBySlug(slug);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Authorization check
    this.checkProductAccess(product, user, 'view');

    return product;
  }

  /**
   * List products with filters
   * Authorization: Users see active products, sellers see their own, admins see all
   */
  async listProducts(
    filters?: {
      category?: string;
      sellerId?: string;
      tags?: string[];
      status?: 'active' | 'draft' | 'archived';
      isFeatured?: boolean;
      minPrice?: number;
      maxPrice?: number;
    },
    pagination?: {
      limit?: number;
      offset?: number;
    },
    user?: UserContext
  ): Promise<ProductWithVersion[]> {
    // Apply RBAC filters
    const effectiveFilters = { ...filters };

    if (!user || user.role === 'user') {
      // Public users only see active products
      effectiveFilters.status = 'active';
    } else if (user.role === 'seller') {
      // Sellers only see their own products
      effectiveFilters.sellerId = user.sellerId;
    }
    // Admins see all (no additional filters)

    const products = await productModel.findAll(effectiveFilters, pagination);
    return products;
  }

  /**
   * Search products
   * Authorization: Users search active only, sellers search their own, admins search all
   */
  async searchProducts(
    query: string,
    filters?: {
      category?: string;
      sellerId?: string;
      status?: 'active' | 'draft' | 'archived';
    },
    user?: UserContext
  ): Promise<ProductWithVersion[]> {
    // Apply RBAC filters
    const effectiveFilters = { ...filters };

    if (!user || user.role === 'user') {
      effectiveFilters.status = 'active';
    } else if (user.role === 'seller') {
      effectiveFilters.sellerId = user.sellerId;
    }

    const products = await productModel.search(query, effectiveFilters);
    return products;
  }

  /**
   * Update product
   * Authorization: Sellers can update their own, admins can update any
   */
  async updateProduct(
    id: string,
    data: Partial<Product>,
    user: UserContext,
    expectedVersion?: number
  ): Promise<ProductWithVersion> {
    // Get existing product
    const existing = await productModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    // Authorization check
    this.checkProductAccess(existing, user, 'edit');

    // Business rule: Sellers cannot change sellerId
    if (user.role === 'seller' && data.sellerId && data.sellerId !== existing.sellerId) {
      throw new AuthorizationError('Sellers cannot change product ownership');
    }

    // Business validation
    this.validateProductData(data, true);

    // Update product
    const product = await productModel.update(id, data, expectedVersion);

    console.log(`[ProductController] Product updated: ${id} by user: ${user.uid}`);
    return product;
  }

  /**
   * Update product inventory
   * Authorization: Sellers can update their own, admins can update any
   */
  async updateInventory(
    id: string,
    quantityChange: number,
    user: UserContext
  ): Promise<ProductWithVersion> {
    // Get existing product
    const existing = await productModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    // Authorization check
    this.checkProductAccess(existing, user, 'edit');

    // Update inventory
    const product = await productModel.updateInventory(id, quantityChange);

    console.log(
      `[ProductController] Inventory updated: ${id} by user: ${user.uid}, change: ${quantityChange}`
    );
    return product;
  }

  /**
   * Archive product (soft delete)
   * Authorization: Sellers can archive their own, admins can archive any
   */
  async archiveProduct(id: string, user: UserContext): Promise<void> {
    // Get existing product
    const existing = await productModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    // Authorization check
    this.checkProductAccess(existing, user, 'delete');

    await productModel.softDelete(id);

    console.log(`[ProductController] Product archived: ${id} by user: ${user.uid}`);
  }

  /**
   * Delete product permanently
   * Authorization: Only admins can permanently delete
   */
  async deleteProduct(id: string, user: UserContext): Promise<void> {
    if (user.role !== 'admin') {
      throw new AuthorizationError('Only admins can permanently delete products');
    }

    await productModel.delete(id);

    console.log(`[ProductController] Product deleted: ${id} by user: ${user.uid}`);
  }

  /**
   * Bulk update products
   * Authorization: Only admins can bulk update
   */
  async bulkUpdateProducts(
    updates: Array<{ id: string; data: Partial<Product> }>,
    user: UserContext
  ): Promise<void> {
    if (user.role !== 'admin') {
      throw new AuthorizationError('Only admins can bulk update products');
    }

    await productModel.bulkUpdate(updates);

    console.log(`[ProductController] Bulk update: ${updates.length} products by user: ${user.uid}`);
  }

  /**
   * Get products by IDs
   * Authorization: Apply same rules as listProducts
   */
  async getProductsByIds(
    ids: string[],
    user?: UserContext
  ): Promise<ProductWithVersion[]> {
    const products = await productModel.findByIds(ids);

    // Filter based on user permissions
    return products.filter(product => {
      try {
        this.checkProductAccess(product, user, 'view');
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Count products
   * Authorization: Apply same filters as listProducts
   */
  async countProducts(
    filters?: {
      category?: string;
      sellerId?: string;
      status?: 'active' | 'draft' | 'archived';
    },
    user?: UserContext
  ): Promise<number> {
    // Apply RBAC filters
    const effectiveFilters = { ...filters };

    if (!user || user.role === 'user') {
      effectiveFilters.status = 'active';
    } else if (user.role === 'seller') {
      effectiveFilters.sellerId = user.sellerId;
    }

    return await productModel.count(effectiveFilters);
  }

  /**
   * Private: Check if user has access to a product
   */
  private checkProductAccess(
    product: ProductWithVersion,
    user: UserContext | undefined,
    action: 'view' | 'edit' | 'delete'
  ): void {
    // View access
    if (action === 'view') {
      // Active products are public
      if (product.status === 'active') {
        return;
      }

      // Draft/archived products require authentication
      if (!user) {
        throw new AuthorizationError('Authentication required to view this product');
      }

      // Admins can view all
      if (user.role === 'admin') {
        return;
      }

      // Sellers can view their own
      if (user.role === 'seller' && user.sellerId === product.sellerId) {
        return;
      }

      throw new AuthorizationError('You do not have permission to view this product');
    }

    // Edit/Delete access requires authentication
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    // Admins can edit/delete all
    if (user.role === 'admin') {
      return;
    }

    // Sellers can edit/delete their own
    if (user.role === 'seller' && user.sellerId === product.sellerId) {
      return;
    }

    throw new AuthorizationError(
      `You do not have permission to ${action} this product`
    );
  }

  /**
   * Private: Validate product data
   */
  private validateProductData(data: Partial<Product>, isUpdate: boolean = false): void {
    // Required fields for create
    if (!isUpdate) {
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('Product name is required');
      }
      if (!data.slug || data.slug.trim().length === 0) {
        throw new ValidationError('Product slug is required');
      }
    }

    // Price validation
    if (data.price !== undefined && data.price < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    // Compare at price validation
    if (data.compareAtPrice !== undefined && data.compareAtPrice < 0) {
      throw new ValidationError('Compare at price cannot be negative');
    }

    if (
      data.price !== undefined &&
      data.compareAtPrice !== undefined &&
      data.compareAtPrice < data.price
    ) {
      throw new ValidationError('Compare at price must be greater than price');
    }

    // Quantity validation
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new ValidationError('Quantity cannot be negative');
    }

    // Weight validation
    if (data.weight !== undefined && data.weight < 0) {
      throw new ValidationError('Weight cannot be negative');
    }

    // Slug validation (alphanumeric and hyphens only)
    if (data.slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(data.slug)) {
        throw new ValidationError(
          'Slug must be lowercase alphanumeric with hyphens only'
        );
      }
    }

    // Image validation
    if (data.images) {
      if (!Array.isArray(data.images)) {
        throw new ValidationError('Images must be an array');
      }
      if (data.images.length > 10) {
        throw new ValidationError('Maximum 10 images allowed');
      }
    }

    // Tags validation
    if (data.tags) {
      if (!Array.isArray(data.tags)) {
        throw new ValidationError('Tags must be an array');
      }
      if (data.tags.length > 20) {
        throw new ValidationError('Maximum 20 tags allowed');
      }
    }

    // Status validation
    if (data.status && !['active', 'draft', 'archived'].includes(data.status)) {
      throw new ValidationError('Invalid status value');
    }
  }
}

// Export singleton instance
export const productController = new ProductController();
