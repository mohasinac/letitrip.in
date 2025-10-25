/**
 * Product Service
 * Server-side product management
 */

import { getAdminDb } from '../../firebase/admin';
import { Product, ProductFilters, PaginatedResponse } from '@/types';
import { FirebaseService } from '../../firebase/services';

// Firebase service integration - no mock data needed

export class ProductService {
  /**
   * Create a new product
   */
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const db = getAdminDb();

    // Check if slug already exists
    const existingProduct = await db.collection('products').where('slug', '==', productData.slug).get();
    if (!existingProduct.empty) {
      throw new Error('Product with this slug already exists');
    }

    const productRef = db.collection('products').doc();
    const now = new Date().toISOString();

    const product: Product = {
      ...productData,
      id: productRef.id,
      createdAt: now,
      updatedAt: now,
    };

    await productRef.set(product);
    return product;
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId: string): Promise<Product | null> {
    const db = getAdminDb();
    const productDoc = await db.collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return null;
    }

    return productDoc.data() as Product;
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string): Promise<Product | null> {
    const db = getAdminDb();
    const productSnapshot = await db.collection('products').where('slug', '==', slug).limit(1).get();

    if (productSnapshot.empty) {
      return null;
    }

    return productSnapshot.docs[0].data() as Product;
  }

  /**
   * Get products with filters and pagination
   */
  static async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const db = getAdminDb();
    
    try {
      const {
        category,
        minPrice,
        maxPrice,
        tags,
        search,
        sort = 'newest',
        page = 1,
        pageSize = 20,
      } = filters;

      // Build the query using Admin SDK
      let query = db.collection('products').where('status', '==', 'active');
      
      // Apply filters
      if (category) {
        query = query.where('category', '==', category);
      }
      
      // For price filtering, we need to be careful about compound queries
      if (minPrice !== undefined && maxPrice !== undefined) {
        query = query.where('price', '>=', minPrice).where('price', '<=', maxPrice);
      } else if (minPrice !== undefined) {
        query = query.where('price', '>=', minPrice);
      } else if (maxPrice !== undefined) {
        query = query.where('price', '<=', maxPrice);
      }

      // Apply sorting
      switch (sort) {
        case 'price-asc':
          query = query.orderBy('price', 'asc');
          break;
        case 'price-desc':
          query = query.orderBy('price', 'desc');
          break;
        case 'newest':
          query = query.orderBy('createdAt', 'desc');
          break;
        case 'popular':
          query = query.orderBy('reviewCount', 'desc');
          break;
        default:
          query = query.orderBy('createdAt', 'desc');
      }

      // Execute the query
      const snapshot = await query.get();
      
      let products: Product[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Product;
      });

      // Apply search filter on server side
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(product =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Apply tag filtering
      if (tags && tags.length > 0) {
        products = products.filter(product => 
          product.tags?.some(tag => tags.includes(tag))
        );
      }

      // Enhance products with seller information (batch this for better performance)
      const enhancedProducts = await Promise.all(
        products.map(async (product) => {
          try {
            // Get seller info
            const [userDoc, sellerDoc] = await Promise.all([
              db.collection('users').doc(product.sellerId).get(),
              db.collection('sellers').doc(product.sellerId).get()
            ]);
            
            const userData = userDoc.exists ? userDoc.data() : {};
            const sellerData = sellerDoc.exists ? sellerDoc.data() : {};
            
            const sellerInfo = {
              id: product.sellerId,
              name: userData?.name || userData?.displayName || 'Unknown Seller',
              storeName: sellerData?.storeName,
              businessName: sellerData?.businessName,
              storeStatus: sellerData?.storeStatus || 'live',
              isVerified: sellerData?.isVerified || false
            };

            return {
              ...product,
              seller: sellerInfo
            };
          } catch (error) {
            console.error(`Error fetching seller info for product ${product.id}:`, error);
            return {
              ...product,
              seller: {
                id: product.sellerId,
                name: 'Unknown Seller',
                storeStatus: 'live',
                isVerified: false
              }
            };
          }
        })
      );

      // Apply pagination
      const total = enhancedProducts.length;
      const startIndex = (page - 1) * pageSize;
      const paginatedProducts = enhancedProducts.slice(startIndex, startIndex + pageSize);

      return {
        items: paginatedProducts as Product[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.error('ProductService getProducts error:', error);
      
      // Return empty result on error
      return {
        items: [],
        total: 0,
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        totalPages: 0,
      };
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const db = getAdminDb();
    const snapshot = await db
      .collection('products')
      .where('status', '==', 'active')
      .where('isFeatured', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as Product);
  }

  /**
   * Update product
   */
  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const db = getAdminDb();
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new Error('Product not found');
    }

    // If updating slug, check if it's already taken
    if (updates.slug) {
      const existingProduct = await db
        .collection('products')
        .where('slug', '==', updates.slug)
        .limit(1)
        .get();

      if (!existingProduct.empty && existingProduct.docs[0].id !== productId) {
        throw new Error('Product with this slug already exists');
      }
    }

    // Remove fields that shouldn't be updated
    const { id, createdAt, ...allowedUpdates } = updates as any;

    await productRef.update({
      ...allowedUpdates,
      updatedAt: new Date().toISOString(),
    });

    const updatedProduct = await this.getProductById(productId);
    if (!updatedProduct) {
      throw new Error('Failed to retrieve updated product');
    }

    return updatedProduct;
  }

  /**
   * Delete product
   */
  static async deleteProduct(productId: string): Promise<void> {
    const db = getAdminDb();
    await db.collection('products').doc(productId).delete();
  }

  /**
   * Update product stock
   */
  static async updateStock(productId: string, quantity: number): Promise<Product> {
    const db = getAdminDb();
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new Error('Product not found');
    }

    const product = productDoc.data() as Product;
    const newQuantity = product.quantity + quantity;

    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    await productRef.update({
      quantity: newQuantity,
      updatedAt: new Date().toISOString(),
    });

    return { ...product, quantity: newQuantity };
  }

  /**
   * Check product availability
   */
  static async checkAvailability(productId: string, requestedQuantity: number): Promise<boolean> {
    const product = await this.getProductById(productId);

    if (!product || product.status !== 'active') {
      return false;
    }

    return product.quantity >= requestedQuantity;
  }

  /**
   * Get related products
   */
  static async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    const db = getAdminDb();
    const product = await this.getProductById(productId);

    if (!product) {
      return [];
    }

    // Get products from the same category
    const snapshot = await db
      .collection('products')
      .where('status', '==', 'active')
      .where('category', '==', product.category)
      .orderBy('createdAt', 'desc')
      .limit(limit + 1)
      .get();

    return snapshot.docs
      .map((doc) => doc.data() as Product)
      .filter((p) => p.id !== productId)
      .slice(0, limit);
  }
}
