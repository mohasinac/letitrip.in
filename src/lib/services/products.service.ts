/**
 * Firebase Product Service
 * Handles all product-related operations with Firestore
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, ProductFilters, PaginatedResponse } from '@/types';

export class ProductsService {
  private static collection = collection(db, 'products');

  /**
   * Create a new product
   */
  static async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const docRef = await addDoc(this.collection, {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Failed to create product');
      }

      return {
        id: docRef.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Get product by ID
   */
  static async getById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Product;
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Failed to get product');
    }
  }

  /**
   * Get product by slug
   */
  static async getBySlug(slug: string): Promise<Product | null> {
    try {
      const q = query(this.collection, where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Product;
    } catch (error) {
      console.error('Error getting product by slug:', error);
      throw new Error('Failed to get product');
    }
  }

  /**
   * Update product
   */
  static async update(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const docRef = doc(db, 'products', id);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Product not found after update');
      }

      return updated;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Delete product
   */
  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Get products with filtering and pagination
   */
  static async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
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
        sellerId,
        status,
      } = filters;

      // Build query constraints
      const constraints: QueryConstraint[] = [];

      if (category) {
        constraints.push(where('category', '==', category));
      }

      if (sellerId) {
        constraints.push(where('sellerId', '==', sellerId));
      }

      if (status) {
        constraints.push(where('status', '==', status));
      } else {
        // Only show active products by default for public queries
        if (!sellerId) {
          constraints.push(where('status', '==', 'active'));
        }
      }

      if (minPrice !== undefined) {
        constraints.push(where('price', '>=', minPrice));
      }

      if (maxPrice !== undefined) {
        constraints.push(where('price', '<=', maxPrice));
      }

      if (tags && tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', tags));
      }

      // Add sorting
      switch (sort) {
        case 'price-asc':
          constraints.push(orderBy('price', 'asc'));
          break;
        case 'price-desc':
          constraints.push(orderBy('price', 'desc'));
          break;
        case 'popular':
          constraints.push(orderBy('rating', 'desc'));
          break;
        case 'newest':
        default:
          constraints.push(orderBy('createdAt', 'desc'));
          break;
      }

      // Apply pagination
      constraints.push(limit(pageSize));

      // Build query
      const q = query(this.collection, ...constraints);
      const querySnapshot = await getDocs(q);

      // Convert to products array
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Apply search filter (client-side as Firestore doesn't support full-text search)
        if (search) {
          const searchLower = search.toLowerCase();
          const nameMatch = data.name.toLowerCase().includes(searchLower);
          const descMatch = data.description.toLowerCase().includes(searchLower);
          const tagMatch = data.tags.some((tag: string) => tag.toLowerCase().includes(searchLower));
          
          if (!nameMatch && !descMatch && !tagMatch) {
            return;
          }
        }

        products.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Product);
      });

      // For simplicity, we'll return approximate pagination info
      // In production, you might want to implement proper counting
      const total = products.length;
      const totalPages = Math.ceil(total / pageSize);

      return {
        items: products,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Failed to get products');
    }
  }

  /**
   * Get featured products
   */
  static async getFeatured(limit: number = 10): Promise<Product[]> {
    try {
      const q = query(
        this.collection,
        where('isFeatured', '==', true),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Product);
      });

      return products;
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw new Error('Failed to get featured products');
    }
  }

  /**
   * Update product inventory
   */
  static async updateInventory(id: string, quantity: number): Promise<void> {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        quantity,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw new Error('Failed to update inventory');
    }
  }

  /**
   * Get low stock products for a seller
   */
  static async getLowStockProducts(sellerId: string): Promise<Product[]> {
    try {
      const q = query(
        this.collection,
        where('sellerId', '==', sellerId),
        where('status', '==', 'active'),
        orderBy('quantity', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only include products where quantity is below threshold
        if (data.quantity <= data.lowStockThreshold) {
          products.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          } as Product);
        }
      });

      return products;
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw new Error('Failed to get low stock products');
    }
  }
}
