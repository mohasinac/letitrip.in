/**
 * Products API Routes
 * GET /api/products - Get all products with filters
 * POST /api/products - Create new product (admin only)
 */

import { NextRequest } from 'next/server';
import { ApiResponse, withAdmin, withRateLimit } from '@/lib/auth/middleware';
import { ProductService } from '@/lib/api/services/product.service';
import { createProductSchema, productFilterSchema } from '@/lib/validations/schemas';

/**
 * Get products with filters
 * GET /api/products
 */
export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters = {
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') as any || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 20,
    };

    // Validate filters
    const validatedFilters = productFilterSchema.parse(filters);

    // Get products
    const result = await ProductService.getProducts(validatedFilters);

    return ApiResponse.success(result);
  } catch (error: any) {
    console.error('Get products error:', error);
    return ApiResponse.error(error.message || 'Failed to get products', 400);
  }
});

/**
 * Create new product (admin only)
 * POST /api/products
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createProductSchema.parse(body);

    // Create product
    const product = await ProductService.createProduct(validatedData);

    return ApiResponse.success(product, 201);
  } catch (error: any) {
    console.error('Create product error:', error);
    return ApiResponse.error(error.message || 'Failed to create product', 400);
  }
});
