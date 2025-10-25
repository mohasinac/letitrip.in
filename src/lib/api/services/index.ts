/**
 * API Services
 * Common API operations and utilities used across multiple routes
 */

import { DatabaseHelper, type PaginationParams, type FilterParams } from '../middleware/database';
import { throwApiError } from '../middleware/error-handler';

/**
 * User service for common user operations
 */
export class UserService {
  /**
   * Get user with enhanced data (orders, addresses, etc.)
   */
  static async getUserWithStats(userId: string) {
    const user = await DatabaseHelper.getDocumentById('users', userId);
    if (!user) {
      throwApiError('User not found', 404);
    }

    // Get user statistics
    const [orders, addresses, wishlist] = await Promise.all([
      DatabaseHelper.getDocumentsByField('orders', 'userId', userId, { limit: 100 }),
      DatabaseHelper.getDocumentsByField('addresses', 'userId', userId),
      DatabaseHelper.getDocumentsByField('wishlist', 'userId', userId),
    ]);

    const stats = {
      ordersCount: orders.length,
      totalSpent: orders.reduce((total: number, order: any) => 
        ['delivered', 'completed'].includes(order.status) ? total + (order.total || 0) : total, 0
      ),
      addressesCount: addresses.length,
      wishlistCount: wishlist.length,
    };

    return { ...user, stats };
  }

  /**
   * Update user profile with validation
   */
  static async updateProfile(userId: string, updateData: any) {
    // Validate email uniqueness if email is being updated
    if (updateData.email) {
      const existingUser = await DatabaseHelper.queryDocuments('users', {
        filters: { email: updateData.email },
      });
      
      if (existingUser.data.length > 0 && (existingUser.data[0] as any).id !== userId) {
        throwApiError('Email already exists', 409);
      }
    }

    return DatabaseHelper.updateDocument('users', userId, updateData);
  }
}

/**
 * Product service for common product operations
 */
export class ProductService {
  /**
   * Search products with advanced filtering
   */
  static async searchProducts(options: {
    query?: string;
    categoryId?: string;
    filters?: FilterParams;
    pagination?: PaginationParams;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  }) {
    const { query, categoryId, filters = {}, pagination, sort } = options;

    let searchFilters: any = { ...filters, status: 'active' };

    // Handle category filtering (including subcategories)
    if (categoryId) {
      const category = await DatabaseHelper.getDocumentById('categories', categoryId);
      if (!category) {
        throwApiError('Category not found', 404);
      }

      // Get all categories to determine hierarchy
      const allCategories = await DatabaseHelper.queryDocuments('categories', {});
      const hasChildren = allCategories.data.some((cat: any) => cat.parentId === categoryId);

      if (!hasChildren) {
        // Leaf category: search products directly
        searchFilters.category = categoryId;
      } else {
        // Parent category: get all descendant leaf categories
        const descendantLeafCategories = allCategories.data.filter((cat: any) => 
          cat.parentIds && cat.parentIds.includes(categoryId) && 
          !allCategories.data.some((childCat: any) => childCat.parentId === cat.id)
        );

        if (descendantLeafCategories.length > 0) {
          searchFilters.category = { operator: 'in', value: descendantLeafCategories.map((cat: any) => cat.id) };
        }
      }
    }

    // If there's a text query, use search function
    if (query) {
      return DatabaseHelper.searchDocuments(
        'products',
        query,
        ['name', 'description', 'sku', 'tags'],
        { filters: searchFilters, pagination, sort }
      );
    }

    // Otherwise, use regular query
    return DatabaseHelper.queryDocuments('products', {
      filters: searchFilters,
      pagination,
      sort,
    });
  }

  /**
   * Get product with related data (reviews, seller info, etc.)
   */
  static async getProductWithDetails(productId: string) {
    const product: any = await DatabaseHelper.getDocumentById('products', productId);
    if (!product) {
      throwApiError('Product not found', 404);
    }

    // Get related data
    const [reviews, seller, category] = await Promise.all([
      DatabaseHelper.getDocumentsByField('reviews', 'productId', productId, { limit: 10 }),
      product.sellerId ? DatabaseHelper.getDocumentById('users', product.sellerId) : null,
      product.category ? DatabaseHelper.getDocumentById('categories', product.category) : null,
    ]);

    // Calculate review stats
    const reviewStats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviews.length 
        : 0,
    };

    return {
      ...product,
      reviews: reviews.slice(0, 5), // Only return first 5 reviews
      reviewStats,
      seller,
      category,
    };
  }
}

/**
 * Order service for common order operations
 */
export class OrderService {
  /**
   * Get user orders with filtering and pagination
   */
  static async getUserOrders(userId: string, options: {
    status?: string;
    pagination?: PaginationParams;
  } = {}) {
    const { status, pagination } = options;
    
    const filters: FilterParams = { userId };
    if (status) {
      filters.status = status;
    }

    return DatabaseHelper.queryDocuments('orders', {
      filters,
      pagination,
      sort: [{ field: 'createdAt', direction: 'desc' }],
    });
  }

  /**
   * Create order with validation
   */
  static async createOrder(orderData: any) {
    // Validate required fields
    if (!orderData.userId || !orderData.items || !Array.isArray(orderData.items)) {
      throwApiError('Invalid order data', 400);
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of orderData.items) {
      const product: any = await DatabaseHelper.getDocumentById('products', item.productId);
      if (!product) {
        throwApiError(`Product ${item.productId} not found`, 404);
      }
      
      if (product.quantity < item.quantity) {
        throwApiError(`Insufficient stock for ${product.name}`, 400);
      }
      
      subtotal += product.price * item.quantity;
    }

    const shipping = orderData.shipping || 0;
    const tax = orderData.tax || subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    const order = await DatabaseHelper.createDocument('orders', {
      ...orderData,
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
    });

    // Update product quantities
    const updateOperations = orderData.items.map((item: any) => ({
      type: 'update' as const,
      collection: 'products',
      id: item.productId,
      data: { quantity: (product: any) => Math.max(0, product.quantity - item.quantity) },
    }));

    await DatabaseHelper.batchOperations(updateOperations);

    return order;
  }
}

/**
 * Wishlist service
 */
export class WishlistService {
  static async addToWishlist(userId: string, productId: string) {
    // Check if already exists
    const existing = await DatabaseHelper.queryDocuments('wishlist', {
      filters: { userId, productId },
    });

    if (existing.data.length > 0) {
      throwApiError('Product already in wishlist', 409);
    }

    // Verify product exists
    const product = await DatabaseHelper.getDocumentById('products', productId);
    if (!product) {
      throwApiError('Product not found', 404);
    }

    return DatabaseHelper.createDocument('wishlist', {
      userId,
      productId,
    });
  }

  static async removeFromWishlist(userId: string, productId: string) {
    const existing = await DatabaseHelper.queryDocuments('wishlist', {
      filters: { userId, productId },
    });

    if (existing.data.length === 0) {
      throwApiError('Product not in wishlist', 404);
    }

    await DatabaseHelper.deleteDocument('wishlist', (existing.data[0] as any).id);
  }

  static async getUserWishlist(userId: string, pagination?: PaginationParams) {
    const wishlistItems = await DatabaseHelper.queryDocuments('wishlist', {
      filters: { userId },
      pagination,
      sort: [{ field: 'createdAt', direction: 'desc' }],
    });

    // Populate product details
    const populatedItems = await Promise.all(
      wishlistItems.data.map(async (item: any) => {
        const product = await DatabaseHelper.getDocumentById('products', item.productId);
        return { ...item, product };
      })
    );

    return {
      ...wishlistItems,
      data: populatedItems,
    };
  }
}

/**
 * Category service
 */
export class CategoryService {
  static async getCategoryTree() {
    const categories = await DatabaseHelper.queryDocuments('categories', {
      filters: { isActive: true },
      sort: [{ field: 'sortOrder', direction: 'asc' }, { field: 'name', direction: 'asc' }],
    });

    // Build tree structure
    const categoryMap = new Map();
    const roots: any[] = [];

    // First pass: create all categories
    categories.data.forEach((category: any) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build hierarchy
    categories.data.forEach((category: any) => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(category.id));
        }
      } else {
        roots.push(categoryMap.get(category.id));
      }
    });

    return roots;
  }

  static async updateCategoryProductCounts(categoryId?: string) {
    // Get categories to update
    const categories = categoryId 
      ? [await DatabaseHelper.getDocumentById('categories', categoryId)]
      : (await DatabaseHelper.queryDocuments('categories', {})).data;

    if (!categories.length) return;

    const updateOperations = [];

    for (const category of categories) {
      if (!category) continue;

      const categoryData = category as any;
      
      // Count products in this category
      const products = await DatabaseHelper.queryDocuments('products', {
        filters: { category: categoryData.id, status: 'active' },
      });

      updateOperations.push({
        type: 'update' as const,
        collection: 'categories',
        id: categoryData.id,
        data: { productCount: products.data.length },
      });
    }

    await DatabaseHelper.batchOperations(updateOperations);
  }
}

/**
 * Analytics service
 */
export class AnalyticsService {
  static async getDashboardStats(userId?: string, isAdmin = false) {
    if (isAdmin) {
      // Admin stats
      const [users, products, orders, categories] = await Promise.all([
        DatabaseHelper.queryDocuments('users', {}),
        DatabaseHelper.queryDocuments('products', {}),
        DatabaseHelper.queryDocuments('orders', {}),
        DatabaseHelper.queryDocuments('categories', {}),
      ]);

      const revenue = orders.data.reduce((sum: number, order: any) => 
        ['delivered', 'completed'].includes(order.status) ? sum + (order.total || 0) : sum, 0
      );

      return {
        totalUsers: users.pagination.totalItems,
        totalProducts: products.pagination.totalItems,
        totalOrders: orders.pagination.totalItems,
        totalCategories: categories.pagination.totalItems,
        totalRevenue: revenue,
        activeProducts: products.data.filter((p: any) => p.status === 'active').length,
        pendingOrders: orders.data.filter((o: any) => o.status === 'pending').length,
      };
    } else if (userId) {
      // User stats
      const [orders, wishlist, addresses] = await Promise.all([
        DatabaseHelper.getDocumentsByField('orders', 'userId', userId),
        DatabaseHelper.getDocumentsByField('wishlist', 'userId', userId),
        DatabaseHelper.getDocumentsByField('addresses', 'userId', userId),
      ]);

      const totalSpent = orders.reduce((sum: number, order: any) => 
        ['delivered', 'completed'].includes(order.status) ? sum + (order.total || 0) : sum, 0
      );

      return {
        totalOrders: orders.length,
        totalSpent,
        wishlistItems: wishlist.length,
        savedAddresses: addresses.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        recentOrders: orders.slice(0, 5),
      };
    }

    return {};
  }
}
