/**
 * Working Example: Enhanced Products API Route
 * Demonstrates complete validation and middleware integration
 */

import { NextRequest } from 'next/server';
import { ResponseHelper } from '@/lib/api/middleware/error-handler';
import { DatabaseHelper } from '@/lib/api/middleware/database';
import { ValidationHandler, withValidation } from '@/lib/api/middleware/validation-enhanced';
import { createAuthHandler } from '@/lib/api/middleware/enhanced';
import * as schemas from '@/lib/validations';
import { z } from 'zod';

/**
 * GET /api/products - List products with filtering
 * Before: ~40 lines of repetitive validation and error handling
 * After: ~15 lines focused on business logic
 */
export const GET = async (request: NextRequest) => {
  try {
    // Validate query parameters using comprehensive schema
    const queryData = ValidationHandler.validateQuery(request, schemas.productFilterSchema);
    
    // Extract validated parameters with defaults
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      inStock,
      featured,
      search,
    } = queryData;

    // Build database query using helper
    const filters: any = {};
    
    if (category && category !== 'all') filters.categoryId = category;
    if (minPrice !== undefined) filters.price = { '>=': minPrice };
    if (maxPrice !== undefined) filters.price = { ...filters.price, '<=': maxPrice };
    if (inStock !== undefined) filters['inventory.available'] = inStock ? { '>': 0 } : { '==': 0 };
    if (featured !== undefined) filters.featured = featured;
    if (search) filters.name = { contains: search };

    // Fetch data with pagination
    const { data: products, total } = await DatabaseHelper.findManyWithPagination(
      'products',
      filters,
      { page, limit, orderBy: 'createdAt', direction: 'desc' }
    );

    // Return formatted response
    return ResponseHelper.success({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      appliedFilters: { category, minPrice, maxPrice, inStock, featured, search },
    });

  } catch (error) {
    console.error('Products GET error:', error);
    return ResponseHelper.handleError(error);
  }
};

/**
 * POST /api/products - Create new product
 * Demonstrates comprehensive validation with authentication
 */
export const POST = withValidation('createProduct')(
  async (request: NextRequest, validatedData) => {
    try {
      // Authenticate with role requirements
      const authHandler = createAuthHandler({
        requireAuth: true,
        allowedRoles: ['admin', 'seller'],
        requirePermissions: ['products:create'],
      });

      const authResult = await authHandler(request);
      if (!authResult.success) {
        return ResponseHelper.unauthorized(authResult.error);
      }

      const { user } = authResult;

      // Business validation using validated data
      if (user.role === 'seller' && !user.verified) {
        return ResponseHelper.forbidden('Account must be verified to create products');
      }

      // Check for duplicate SKU
      const existingProduct = await DatabaseHelper.findOne('products', { sku: validatedData.sku });
      if (existingProduct) {
        return ResponseHelper.conflict('Product with this SKU already exists');
      }

      // Validate category exists
      const category = await DatabaseHelper.findById('categories', validatedData.categoryId);
      if (!category) {
        return ResponseHelper.badRequest('Invalid category');
      }

      // Create product with metadata
      const productData = {
        ...validatedData,
        id: DatabaseHelper.generateId(),
        sellerId: user.uid,
        status: user.role === 'admin' ? 'active' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analytics: {
          views: 0,
          sales: 0,
          revenue: 0,
        },
      };

      // Execute transaction for data consistency
      const result = await DatabaseHelper.runTransaction(async (batch) => {
        // Create product
        const productRef = DatabaseHelper.getDocRef('products', productData.id);
        batch.set(productRef, productData);

        // Update category product count
        const categoryRef = DatabaseHelper.getDocRef('categories', validatedData.categoryId);
        batch.update(categoryRef, {
          productCount: DatabaseHelper.increment(1),
          updatedAt: new Date().toISOString(),
        });

        // Update user stats
        const userRef = DatabaseHelper.getDocRef('users', user.uid);
        batch.update(userRef, {
          'stats.productsCreated': DatabaseHelper.increment(1),
        });

        return productData.id;
      });

      // Log activity for audit trail
      await DatabaseHelper.create('activityLogs', {
        userId: user.uid,
        action: 'product.created',
        resourceId: result,
        metadata: {
          productName: validatedData.name,
          category: validatedData.categoryId,
        },
        timestamp: new Date().toISOString(),
      });

      return ResponseHelper.created({
        product: { id: result, ...productData },
        message: user.role === 'admin' 
          ? 'Product created successfully' 
          : 'Product submitted for review',
      });

    } catch (error) {
      console.error('Product creation error:', error);
      return ResponseHelper.handleError(error);
    }
  }
);

/**
 * PUT /api/products/[id] - Update product
 * Shows parameter validation with complex authorization
 */
export const PUT = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    // Validate path parameters
    const { id: productId } = ValidationHandler.validateParams(
      context.params,
      z.object({ id: z.string().min(1, 'Product ID required') })
    );

    // Validate request body
    const updateData = await ValidationHandler.validateBody(request, schemas.updateProductSchema);

    // Authenticate user
    const authHandler = createAuthHandler({
      requireAuth: true,
      allowedRoles: ['admin', 'seller'],
      requirePermissions: ['products:update'],
    });

    const authResult = await authHandler(request);
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
      return ResponseHelper.forbidden('Can only update your own products');
    }

    // Validate SKU uniqueness if being updated
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const duplicateSKU = await DatabaseHelper.findOne('products', {
        sku: updateData.sku,
        id: { '!=': productId },
      });

      if (duplicateSKU) {
        return ResponseHelper.conflict('SKU already exists');
      }
    }

    // Apply updates
    const updatedProduct = await DatabaseHelper.update('products', productId, {
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    });

    // Log activity
    await DatabaseHelper.create('activityLogs', {
      userId: user.uid,
      action: 'product.updated',
      resourceId: productId,
      metadata: {
        changes: Object.keys(updateData),
        productName: existingProduct.name,
      },
      timestamp: new Date().toISOString(),
    });

    return ResponseHelper.success({
      product: updatedProduct,
      message: 'Product updated successfully',
    });

  } catch (error) {
    console.error('Product update error:', error);
    return ResponseHelper.handleError(error);
  }
};

/**
 * DELETE /api/products/[id] - Soft delete product
 * Demonstrates complex business logic with validation
 */
export const DELETE = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    // Validate parameters
    const { id: productId } = ValidationHandler.validateParams(
      context.params,
      z.object({ id: z.string().min(1) })
    );

    // Authenticate with admin/seller roles
    const authHandler = createAuthHandler({
      requireAuth: true,
      allowedRoles: ['admin', 'seller'],
      requirePermissions: ['products:delete'],
    });

    const authResult = await authHandler(request);
    if (!authResult.success) {
      return ResponseHelper.unauthorized(authResult.error);
    }

    const { user } = authResult;

    // Get product to delete
    const product = await DatabaseHelper.findById('products', productId);
    if (!product) {
      return ResponseHelper.notFound('Product not found');
    }

    // Authorization check
    if (user.role === 'seller' && product.sellerId !== user.uid) {
      return ResponseHelper.forbidden('Can only delete your own products');
    }

    // Business rule: Check for active orders
    const activeOrders = await DatabaseHelper.findMany('orders', {
      'items.productId': productId,
      status: { in: ['pending', 'processing', 'shipped'] },
    });

    if (activeOrders.length > 0) {
      return ResponseHelper.conflict('Cannot delete product with active orders');
    }

    // Soft delete with transaction
    await DatabaseHelper.runTransaction(async (batch) => {
      // Mark product as deleted
      const productRef = DatabaseHelper.getDocRef('products', productId);
      batch.update(productRef, {
        status: 'deleted',
        deletedAt: new Date().toISOString(),
        deletedBy: user.uid,
      });

      // Update category count
      const categoryRef = DatabaseHelper.getDocRef('categories', product.categoryId);
      batch.update(categoryRef, {
        productCount: DatabaseHelper.increment(-1),
      });
    });

    // Log deletion
    await DatabaseHelper.create('activityLogs', {
      userId: user.uid,
      action: 'product.deleted',
      resourceId: productId,
      metadata: {
        productName: product.name,
        category: product.categoryId,
      },
      timestamp: new Date().toISOString(),
    });

    return ResponseHelper.success({
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    return ResponseHelper.handleError(error);
  }
};

/**
 * Additional endpoint: PATCH /api/products/[id]/status
 * Demonstrates single-field validation
 */
export const PATCH = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    const { id: productId } = ValidationHandler.validateParams(
      context.params,
      z.object({ id: z.string().min(1) })
    );

    const { status } = await ValidationHandler.validateBody(
      request,
      z.object({
        status: z.enum(['active', 'inactive', 'pending', 'rejected']),
      })
    );

    // Admin-only operation
    const authHandler = createAuthHandler({
      requireAuth: true,
      allowedRoles: ['admin'],
      requirePermissions: ['products:moderate'],
    });

    const authResult = await authHandler(request);
    if (!authResult.success) {
      return ResponseHelper.unauthorized(authResult.error);
    }

    const { user } = authResult;

    // Update product status
    const updatedProduct = await DatabaseHelper.update('products', productId, {
      status,
      updatedAt: new Date().toISOString(),
      moderatedBy: user.uid,
      moderatedAt: new Date().toISOString(),
    });

    if (!updatedProduct) {
      return ResponseHelper.notFound('Product not found');
    }

    // Notify seller of status change
    if (status === 'active') {
      await DatabaseHelper.create('notifications', {
        userId: updatedProduct.sellerId,
        type: 'product_approved',
        title: 'Product Approved',
        message: `Your product "${updatedProduct.name}" has been approved and is now live.`,
        data: { productId, productName: updatedProduct.name },
        createdAt: new Date().toISOString(),
      });
    }

    return ResponseHelper.success({
      product: updatedProduct,
      message: `Product status updated to ${status}`,
    });

  } catch (error) {
    console.error('Product status update error:', error);
    return ResponseHelper.handleError(error);
  }
};
