/**
 * Product Model
 * 
 * Database layer for product operations with transaction safety and concurrency control
 * 
 * Features:
 * - Transaction-safe create/update operations
 * - Optimistic locking using version field
 * - Atomic inventory updates
 * - Batch operations for performance
 * - Slug uniqueness validation
 */

import { getAdminDb } from '../database/admin';
import { Product } from '@/types';
import { ConflictError, NotFoundError, InternalServerError } from '../middleware/error-handler';

// Extend Product with version for concurrency control
export interface ProductWithVersion extends Product {
  version: number;
}

export class ProductModel {
  private collection: FirebaseFirestore.CollectionReference;

  constructor() {
    const db = getAdminDb();
    this.collection = db.collection('products');
  }

  /**
   * Create a new product with transaction safety
   * Validates slug uniqueness within a transaction
   */
  async create(data: Partial<Product> & { slug: string; sellerId: string }): Promise<ProductWithVersion> {
    const db = getAdminDb();
    
    try {
      // Run in transaction to ensure slug uniqueness
      const product = await db.runTransaction(async (transaction) => {
        // Check if slug already exists
        const existingQuery = await transaction.get(
          this.collection.where('slug', '==', data.slug).limit(1)
        );

        if (!existingQuery.empty) {
          throw new ConflictError(`Product with slug "${data.slug}" already exists`);
        }

        // Create product data
        const now = new Date().toISOString();
        const productData: Omit<ProductWithVersion, 'id'> = {
          // Required fields
          slug: data.slug,
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          sku: data.sku || '',
          quantity: data.quantity || 0,
          lowStockThreshold: data.lowStockThreshold || 10,
          weight: data.weight || 0,
          weightUnit: data.weightUnit || 'kg',
          sellerId: data.sellerId,
          
          // Optional fields
          shortDescription: data.shortDescription,
          compareAtPrice: data.compareAtPrice,
          cost: data.cost,
          barcode: data.barcode,
          dimensions: data.dimensions,
          category: data.category || '',
          categorySlug: data.categorySlug,
          tags: data.tags || [],
          status: data.status || 'draft',
          isFeatured: data.isFeatured ?? false,
          condition: data.condition,
          returnable: data.returnable,
          returnPeriod: data.returnPeriod,
          features: data.features,
          specifications: data.specifications,
          seo: data.seo,
          
          // Media
          images: data.images || [],
          videos: data.videos,
          
          // Timestamps
          createdAt: now,
          updatedAt: now,
          
          // Concurrency control
          version: 1,
        };

        // Create document with auto-generated ID
        const docRef = this.collection.doc();
        transaction.create(docRef, productData);

        return { id: docRef.id, ...productData };
      });

      return product;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error('[ProductModel] Create error:', error);
      throw new InternalServerError('Failed to create product');
    }
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<ProductWithVersion | null> {
    try {
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as ProductWithVersion;
    } catch (error) {
      console.error('[ProductModel] FindById error:', error);
      throw new InternalServerError('Failed to fetch product');
    }
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string): Promise<ProductWithVersion | null> {
    try {
      const snapshot = await this.collection
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as ProductWithVersion;
    } catch (error) {
      console.error('[ProductModel] FindBySlug error:', error);
      throw new InternalServerError('Failed to fetch product');
    }
  }

  /**
   * Find all products with filtering and pagination
   */
  async findAll(
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
    }
  ): Promise<ProductWithVersion[]> {
    try {
      let query: FirebaseFirestore.Query = this.collection;

      // Apply filters
      if (filters?.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters?.sellerId) {
        query = query.where('sellerId', '==', filters.sellerId);
      }
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.isFeatured !== undefined) {
        query = query.where('isFeatured', '==', filters.isFeatured);
      }
      
      // Note: Price and tags filtering done in-memory since Firestore
      // doesn't support range queries with other filters efficiently

      // Pagination
      const limit = pagination?.limit ?? 50;
      const offset = pagination?.offset ?? 0;
      query = query.limit(limit).offset(offset);

      const snapshot = await query.get();
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ProductWithVersion));

      // In-memory filters for price range
      if (filters?.minPrice !== undefined) {
        products = products.filter(p => p.price >= filters.minPrice!);
      }
      if (filters?.maxPrice !== undefined) {
        products = products.filter(p => p.price <= filters.maxPrice!);
      }

      // In-memory filter for tags
      if (filters?.tags && filters.tags.length > 0) {
        products = products.filter(p => 
          filters.tags!.some(tag => p.tags?.includes(tag))
        );
      }

      return products;
    } catch (error) {
      console.error('[ProductModel] FindAll error:', error);
      throw new InternalServerError('Failed to fetch products');
    }
  }

  /**
   * Search products by text
   * Note: This is a simple implementation. For production, use Algolia or ElasticSearch
   */
  async search(
    query: string,
    filters?: {
      category?: string;
      sellerId?: string;
      status?: 'active' | 'draft' | 'archived';
    }
  ): Promise<ProductWithVersion[]> {
    try {
      // Get all products (with filters)
      let firestoreQuery: FirebaseFirestore.Query = this.collection;

      if (filters?.category) {
        firestoreQuery = firestoreQuery.where('category', '==', filters.category);
      }
      if (filters?.sellerId) {
        firestoreQuery = firestoreQuery.where('sellerId', '==', filters.sellerId);
      }
      if (filters?.status) {
        firestoreQuery = firestoreQuery.where('status', '==', filters.status);
      }

      const snapshot = await firestoreQuery.limit(100).get();
      
      // Filter in-memory by search query
      const searchLower = query.toLowerCase();
      const products = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as ProductWithVersion))
        .filter(product => {
          return (
            product.name?.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower) ||
            product.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
            product.sku?.toLowerCase().includes(searchLower)
          );
        });

      return products;
    } catch (error) {
      console.error('[ProductModel] Search error:', error);
      throw new InternalServerError('Failed to search products');
    }
  }

  /**
   * Update product with optimistic locking
   * 
   * @param id - Product ID
   * @param data - Partial product data to update
   * @param expectedVersion - Expected version for concurrency control (optional)
   * @returns Updated product with new version
   * @throws ConflictError if version mismatch (concurrent modification detected)
   */
  async update(
    id: string,
    data: Partial<Product>,
    expectedVersion?: number
  ): Promise<ProductWithVersion> {
    const db = getAdminDb();

    try {
      const docRef = this.collection.doc(id);

      const product = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new NotFoundError('Product not found');
        }

        const currentData = doc.data() as ProductWithVersion;

        // Optimistic locking: check version if provided
        if (expectedVersion !== undefined && currentData.version !== expectedVersion) {
          throw new ConflictError(
            `Product was modified by another process. Expected version ${expectedVersion}, got ${currentData.version}`
          );
        }

        const now = new Date().toISOString();
        const updateData = {
          ...data,
          updatedAt: now,
          version: currentData.version + 1, // Increment version
        };

        transaction.update(docRef, updateData);

        return {
          ...currentData,
          ...updateData,
          id: doc.id,
        } as ProductWithVersion;
      });

      return product;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error('[ProductModel] Update error:', error);
      throw new InternalServerError('Failed to update product');
    }
  }

  /**
   * Update product inventory atomically
   * Prevents race conditions during concurrent inventory updates
   * 
   * @param id - Product ID
   * @param quantityChange - Amount to change (positive for increase, negative for decrease)
   * @returns Updated product
   */
  async updateInventory(
    id: string,
    quantityChange: number
  ): Promise<ProductWithVersion> {
    const db = getAdminDb();

    try {
      const docRef = this.collection.doc(id);

      const product = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new NotFoundError('Product not found');
        }

        const currentData = doc.data() as ProductWithVersion;
        const newQuantity = currentData.quantity + quantityChange;

        // Prevent negative inventory (unless backorders allowed)
        if (newQuantity < 0) {
          throw new ConflictError('Insufficient inventory');
        }

        const now = new Date().toISOString();
        const updateData = {
          quantity: newQuantity,
          updatedAt: now,
          version: currentData.version + 1,
        };

        transaction.update(docRef, updateData);

        return {
          ...currentData,
          ...updateData,
          id: doc.id,
        } as ProductWithVersion;
      });

      return product;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error('[ProductModel] UpdateInventory error:', error);
      throw new InternalServerError('Failed to update inventory');
    }
  }

  /**
   * Soft delete product (set status to archived)
   */
  async softDelete(id: string): Promise<void> {
    try {
      await this.update(id, { status: 'archived' });
    } catch (error) {
      console.error('[ProductModel] SoftDelete error:', error);
      throw new InternalServerError('Failed to archive product');
    }
  }

  /**
   * Permanently delete product
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError('Product not found');
      }

      await docRef.delete();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('[ProductModel] Delete error:', error);
      throw new InternalServerError('Failed to delete product');
    }
  }

  /**
   * Bulk delete products (batch operation)
   */
  async bulkDelete(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }

    const db = getAdminDb();
    const batch = db.batch();

    try {
      // Add all deletes to batch
      ids.forEach((id) => {
        const docRef = this.collection.doc(id);
        batch.delete(docRef);
      });

      // Commit batch
      await batch.commit();
    } catch (error) {
      console.error('[ProductModel] Bulk delete error:', error);
      throw new InternalServerError('Failed to bulk delete products');
    }
  }

  /**
   * Bulk update products (batch operation for performance)
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<Product> }>
  ): Promise<void> {
    const db = getAdminDb();
    const batch = db.batch();

    try {
      const now = new Date().toISOString();

      for (const { id, data } of updates) {
        const docRef = this.collection.doc(id);
        batch.update(docRef, {
          ...data,
          updatedAt: now,
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('[ProductModel] BulkUpdate error:', error);
      throw new InternalServerError('Failed to bulk update products');
    }
  }

  /**
   * Find products by IDs (batch read operation)
   */
  async findByIds(ids: string[]): Promise<ProductWithVersion[]> {
    try {
      // Firestore 'in' query supports max 10 items
      const chunks = [];
      for (let i = 0; i < ids.length; i += 10) {
        chunks.push(ids.slice(i, i + 10));
      }

      const products: ProductWithVersion[] = [];

      for (const chunk of chunks) {
        const snapshot = await this.collection
          .where(FirebaseFirestore.FieldPath.documentId(), 'in', chunk)
          .get();

        snapshot.docs.forEach(doc => {
          products.push({
            id: doc.id,
            ...doc.data(),
          } as ProductWithVersion);
        });
      }

      return products;
    } catch (error) {
      console.error('[ProductModel] FindByIds error:', error);
      throw new InternalServerError('Failed to fetch products');
    }
  }

  /**
   * Count products with filters
   */
  async count(filters?: {
    category?: string;
    sellerId?: string;
    status?: 'active' | 'draft' | 'archived';
  }): Promise<number> {
    try {
      let query: FirebaseFirestore.Query = this.collection;

      if (filters?.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters?.sellerId) {
        query = query.where('sellerId', '==', filters.sellerId);
      }
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error('[ProductModel] Count error:', error);
      throw new InternalServerError('Failed to count products');
    }
  }
}

// Export singleton instance
export const productModel = new ProductModel();
