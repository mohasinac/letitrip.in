/**
 * Enhanced Products API Route
 * Demonstrates comprehensive validation and middleware usage
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { ResponseHelper } from '@/lib/api/middleware/error-handler';
import { DatabaseHelper } from '@/lib/api/middleware/database';
import { ValidationHandler, withValidation, withComplexValidation } from '@/lib/api/middleware/validation-enhanced';
import { EnhancedMiddleware } from '@/lib/api/middleware/enhanced';
import * as schemas from '@/lib/validations';

/**
 * GET /api/products
 * Fetch products with advanced filtering and pagination
 */
export const GET = withComplexValidation({
  query: schemas.productFilterSchema,
})(async (request: NextRequest, { query }) => {
  try {
    // Extract validated query parameters
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      minPrice,
      maxPrice,
      brand,
      rating,
      inStock,
      featured,
      search,
    } = query;

    // Build Firestore query with validated parameters
    const productsRef = DatabaseHelper.collection('products');
    let queryBuilder = productsRef;

    // Apply filters based on validated input
    if (category && category !== 'all') {
      queryBuilder = queryBuilder.where('categoryId', '==', category);
    }

    if (brand && brand.length > 0) {
      queryBuilder = queryBuilder.where('brand', 'in', brand);
    }

    if (minPrice !== undefined) {
      queryBuilder = queryBuilder.where('price', '>=', minPrice);
    }

    if (maxPrice !== undefined) {
      queryBuilder = queryBuilder.where('price', '<=', maxPrice);
    }

    if (rating !== undefined) {
      queryBuilder = queryBuilder.where('averageRating', '>=', rating);
    }

    if (inStock === true) {
      queryBuilder = queryBuilder.where('inventory.available', '>', 0);
    } else if (inStock === false) {
      queryBuilder = queryBuilder.where('inventory.available', '==', 0);
    }

    if (featured === true) {
      queryBuilder = queryBuilder.where('featured', '==', true);
    }

    // Apply search if provided
    if (search) {
      // Firestore doesn't support full-text search, but we can do prefix matching
      queryBuilder = queryBuilder
        .orderBy('name')
        .startAt(search)
        .endAt(search + '\uf8ff');
    } else {
      // Apply sorting for non-search queries
      queryBuilder = queryBuilder.orderBy(sortBy, sortOrder);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      queryBuilder = queryBuilder.offset(offset);
    }
    queryBuilder = queryBuilder.limit(limit);

    // Execute query with error handling
    const snapshot = await DatabaseHelper.executeQuery(queryBuilder);
    const products = DatabaseHelper.snapshotToArray(snapshot);

    // Get total count for pagination (separate query)
    let totalCountQuery = DatabaseHelper.collection('products');
    if (category && category !== 'all') {
      totalCountQuery = totalCountQuery.where('categoryId', '==', category);
    }
    if (brand && brand.length > 0) {
      totalCountQuery = totalCountQuery.where('brand', 'in', brand);
    }
    // Add other filters for accurate count...

    const totalSnapshot = await DatabaseHelper.executeQuery(totalCountQuery);
    const totalCount = totalSnapshot.size;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Return paginated response with metadata
    return ResponseHelper.success({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        category,
        brand,
        priceRange: { min: minPrice, max: maxPrice },
        rating,
        inStock,
        featured,
        search,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return ResponseHelper.internalError('Failed to fetch products');
  }
});

/**
 * POST /api/products
 * Create a new product with comprehensive validation
 */
export const POST = withValidation('createProduct')(
  async (request: NextRequest, validatedData) => {
    try {
      // Enhanced auth check with role validation
      const authResult = await EnhancedMiddleware.authenticateUser(request, {
        requireRoles: ['admin', 'seller'],
        checkPermissions: ['products.create'],
      });

      if (!authResult.success) {
        return ResponseHelper.unauthorized(authResult.error);
      }

      const { user } = authResult;

      // Validate business rules
      if (user.role === 'seller' && !user.storeVerified) {
        return ResponseHelper.forbidden('Store must be verified to create products');
      }

      // Check for duplicate SKU
      const existingProduct = await DatabaseHelper.findOne('products', {
        sku: validatedData.sku,
      });

      if (existingProduct) {
        return ResponseHelper.conflict('Product with this SKU already exists');
      }

      // Validate category exists
      const categoryExists = await DatabaseHelper.exists('categories', validatedData.categoryId);
      if (!categoryExists) {
        return ResponseHelper.badRequest('Invalid category ID');
      }

      // Prepare product data with metadata
      const productData = {
        ...validatedData,
        id: DatabaseHelper.generateId(),
        sellerId: user.uid,
        storeId: user.storeId,
        status: user.role === 'admin' ? 'active' : 'pending',
        featured: user.role === 'admin' ? validatedData.featured : false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.uid,
        inventory: {
          ...validatedData.inventory,
          reserved: 0,
          sold: 0,
        },
        analytics: {
          views: 0,
          purchases: 0,
          revenue: 0,
          conversionRate: 0,
        },
        seo: {
          ...validatedData.seo,
          slug: validatedData.seo?.slug || generateSlug(validatedData.name),
        },
      };

      // Create product with transaction for consistency
      const productId = await DatabaseHelper.runTransaction(async (transaction) => {
        // Create the product
        const productRef = DatabaseHelper.doc('products', productData.id);
        transaction.set(productRef, productData);

        // Update category product count
        const categoryRef = DatabaseHelper.doc('categories', validatedData.categoryId);
        transaction.update(categoryRef, {
          productCount: DatabaseHelper.increment(1),
          updatedAt: new Date().toISOString(),
        });

        // Update user's product count
        const userRef = DatabaseHelper.doc('users', user.uid);
        transaction.update(userRef, {
          'stats.productsCreated': DatabaseHelper.increment(1),
          updatedAt: new Date().toISOString(),
        });

        return productData.id;
      });

      // Log activity
      await DatabaseHelper.create('activityLogs', {
        userId: user.uid,
        action: 'product.created',
        resourceType: 'product',
        resourceId: productId,
        metadata: {
          productName: validatedData.name,
          category: validatedData.categoryId,
          price: validatedData.price,
        },
        timestamp: new Date().toISOString(),
      });

      // Send notifications if needed
      if (user.role === 'seller') {
        await EnhancedMiddleware.sendNotification({
          type: 'product_submitted',
          userId: user.uid,
          data: {
            productId,
            productName: validatedData.name,
            status: 'pending',
          },
        });
      }

      return ResponseHelper.created({
        product: {
          id: productId,
          ...productData,
        },
        message: user.role === 'admin' 
          ? 'Product created successfully' 
          : 'Product submitted for review',
      });

    } catch (error) {
      console.error('Error creating product:', error);
      return ResponseHelper.internalError('Failed to create product');
    }
  }
);

/**
 * PUT /api/products/[id]
 * Update an existing product with validation and authorization
 */
export const PUT = withComplexValidation({
  body: schemas.updateProductSchema,
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
})(async (request: NextRequest, { body: validatedData, params }, context) => {
  try {
    const productId = context?.params?.id as string;

    // Enhanced auth check
    const authResult = await EnhancedMiddleware.authenticateUser(request, {
      requireRoles: ['admin', 'seller'],
      checkPermissions: ['products.update'],
    });

    if (!authResult.success) {
      return ResponseHelper.unauthorized(authResult.error);
    }

    const { user } = authResult;

    // Get existing product
    const existingProduct = await DatabaseHelper.findById('products', productId);
    if (!existingProduct) {
      return ResponseHelper.notFound('Product not found');
    }

    // Authorization check - sellers can only update their own products
    if (user.role === 'seller' && existingProduct.sellerId !== user.uid) {
      return ResponseHelper.forbidden('You can only update your own products');
    }

    // Validate business rules
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const skuExists = await DatabaseHelper.findOne('products', {
        sku: validatedData.sku,
        id: { '!=': productId },
      });

      if (skuExists) {
        return ResponseHelper.conflict('Product with this SKU already exists');
      }
    }

    // Prepare update data
    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update product with optimistic locking
    const updatedProduct = await DatabaseHelper.update('products', productId, updateData);

    // Log activity
    await DatabaseHelper.create('activityLogs', {
      userId: user.uid,
      action: 'product.updated',
      resourceType: 'product',
      resourceId: productId,
      metadata: {
        productName: existingProduct.name,
        changes: Object.keys(updateData),
      },
      timestamp: new Date().toISOString(),
    });

    return ResponseHelper.success({
      product: updatedProduct,
      message: 'Product updated successfully',
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return ResponseHelper.internalError('Failed to update product');
  }
});

/**
 * DELETE /api/products/[id]
 * Soft delete a product with proper authorization
 */
export const DELETE = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    const productId = context.params.id;

    // Validate product ID
    ValidationHandler.validateParams(context.params, z.object({
      id: z.string().min(1, 'Product ID is required'),
    }));

    // Enhanced auth check
    const authResult = await EnhancedMiddleware.authenticateUser(request, {
      requireRoles: ['admin', 'seller'],
      checkPermissions: ['products.delete'],
    });

    if (!authResult.success) {
      return ResponseHelper.unauthorized(authResult.error);
    }

    const { user } = authResult;

    // Get existing product
    const existingProduct = await DatabaseHelper.findById('products', productId);
    if (!existingProduct) {
      return ResponseHelper.notFound('Product not found');
    }

    // Authorization check
    if (user.role === 'seller' && existingProduct.sellerId !== user.uid) {
      return ResponseHelper.forbidden('You can only delete your own products');
    }

    // Check if product has active orders
    const activeOrders = await DatabaseHelper.findMany('orders', {
      'items.productId': productId,
      status: { 'in': ['pending', 'processing', 'shipped'] },
    });

    if (activeOrders.length > 0) {
      return ResponseHelper.conflict('Cannot delete product with active orders');
    }

    // Soft delete the product
    await DatabaseHelper.update('products', productId, {
      status: 'deleted',
      deletedAt: new Date().toISOString(),
      deletedBy: user.uid,
    });

    // Update category product count
    await DatabaseHelper.update('categories', existingProduct.categoryId, {
      productCount: DatabaseHelper.increment(-1),
      updatedAt: new Date().toISOString(),
    });

    // Log activity
    await DatabaseHelper.create('activityLogs', {
      userId: user.uid,
      action: 'product.deleted',
      resourceType: 'product',
      resourceId: productId,
      metadata: {
        productName: existingProduct.name,
        category: existingProduct.categoryId,
      },
      timestamp: new Date().toISOString(),
    });

    return ResponseHelper.success({
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return ResponseHelper.internalError('Failed to delete product');
  }
};

/**
 * Helper function to generate URL-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
