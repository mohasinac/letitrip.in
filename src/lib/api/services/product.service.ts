/**
 * Product Service
 * Server-side product management
 */

import { getAdminDb } from '../../firebase/admin';
import { Product, ProductFilters, PaginatedResponse } from '@/types';
import { FirebaseService } from '../../firebase/services';

// Mock data generator
function generateMockProducts(): Product[] {
  return [
    {
      id: 'mock-1',
      name: 'Sample Product',
      slug: 'sample-product',
      description: 'This is a sample product',
      price: 99.99,
      sku: 'SAMPLE-001',
      quantity: 10,
      lowStockThreshold: 5,
      images: [{
        url: '/api/placeholder/300/300',
        alt: 'Sample Product',
        order: 0
      }],
      category: 'Electronics',
      tags: ['sample', 'mock'],
      status: 'active' as const,
      isFeatured: false,
      rating: 4.5,
      reviewCount: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
}

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
    const firebaseService = FirebaseService.getInstance();
    
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

      // Use FirebaseService with filters
      const { products, total } = await firebaseService.getProducts({
        category,
        minPrice,
        maxPrice,
        search,
        featured: undefined,
        limit: pageSize,
        page
      });

      // Apply tag filtering on client side if needed
      let filteredProducts = products;
      if (tags && tags.length > 0) {
        filteredProducts = products.filter(product => 
          product.tags.some(tag => tags.includes(tag))
        );
      }

      // Apply sorting
      switch (sort) {
        case 'price-asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popular':
          filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }

      const actualTotal = filteredProducts.length;
      const startIndex = (page - 1) * pageSize;
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

      return {
        items: paginatedProducts,
        total: actualTotal,
        page,
        pageSize,
        totalPages: Math.ceil(actualTotal / pageSize),
      };
    } catch (error) {
      console.error('Firebase getProducts error:', error);
      
      // Fallback to mock data
      const mockProducts = generateMockProducts();
      let filteredProducts = mockProducts;

      // Apply filters to mock data
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }
      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
      }

      const total = filteredProducts.length;
      const startIndex = ((filters.page || 1) - 1) * (filters.pageSize || 20);
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + (filters.pageSize || 20));

      return {
        items: paginatedProducts,
        total,
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        totalPages: Math.ceil(total / (filters.pageSize || 20)),
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
